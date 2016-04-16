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
	var roll20 = __webpack_require__(1);
	var parseModule = __webpack_require__(3);
	var mmFormat = __webpack_require__(4);
	var myState = roll20.getState('ShapedScripts');
	var logger = __webpack_require__(5)(myState.config);
	var EntityLookup = __webpack_require__(6);
	var JSONValidator = __webpack_require__(8);
	var el = new EntityLookup();
	var Reporter = __webpack_require__(9);
	var reporter = new Reporter(roll20, 'Shaped Scripts');
	var ShapedScripts = __webpack_require__(10);
	var shaped = new ShapedScripts(logger, myState, roll20, parseModule.getParser(mmFormat, logger), el, reporter);
	var _ = __webpack_require__(2);

	//logger.wrapModule(el);
	logger.wrapModule(roll20);

	var jsonValidator = new JSONValidator(__webpack_require__(4));
	el.configureEntity('monsters', [
	  EntityLookup.jsonValidatorAsEntityProcessor(jsonValidator),
	  el.getSpellHydrator()
	], EntityLookup.jsonValidatorAsVersionChecker(jsonValidator));
	el.configureEntity('spells', [el.getMonsterSpellUpdater()], EntityLookup.getVersionChecker('0.2'));

	roll20.on('ready', function () {
	  shaped.checkInstall();
	  shaped.registerEventHandlers();
	});

	module.exports = {
	  addEntities: function (entities) {
	    try {
	      if (typeof entities === 'string') {
	        entities = JSON.parse(entities);
	      }
	      var result = el.addEntities(entities);
	      var summary = _.mapObject(result, function (resultObject, type) {
	        if (type === 'errors') {
	          return resultObject.length;
	        }
	        else {
	          return _.mapObject(resultObject, function (operationResultArray) {
	            return operationResultArray.length;
	          });
	        }
	      });
	      logger.info('Summary of adding entities to the lookup: $$$', summary);
	      logger.info('Details: $$$', result);
	      if (!_.isEmpty(result.errors)) {
	        var message = _.chain(result.errors)
	          .groupBy('entity')
	          .mapObject(function (entityErrors) {
	            return _.chain(entityErrors)
	              .pluck('errors')
	              .flatten()
	              .value();
	          })
	          .map(function (errors, entityName) {
	            return '<li>' + entityName + ':<ul><li>' + errors.join('</li><li>') + '</li></ul></li>';
	          })
	          .value();

	        reporter.reportError('JSON import error:<ul>' + message + '</ul>');
	      }
	    }
	    catch (e) {
	      reporter.reportError('JSON parse error, please see log for more information');
	      logger.error(e.toString());
	      logger.error(e.stack);
	    }
	  }
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* globals state:false, createObj, findObjs, filterObjs, getObj, getAttrByName, sendChat, on, log, Campaign, playerIsGM, spawnFx, spawnFxBetweenPoints */
	'use strict';
	var _ = __webpack_require__(2);
	//noinspection JSUnusedGlobalSymbols
	module.exports = {

	  getState: function (module) {
	    if (!state[module]) {
	      state[module] = {};
	    }
	    return state[module];
	  },

	  createObj: function (type, attributes) {
	    return createObj(type, attributes);
	  },

	  findObjs: function (attributes) {
	    return findObjs(attributes);
	  },

	  filterObjs: function (callback) {
	    return filterObjs(callback);
	  },

	  getObj: function (type, id) {
	    return getObj(type, id);
	  },

	  getOrCreateObj: function (type, attributes) {
	    var newAttributes = _.extend(_.clone(attributes), { type: type });
	    var existing = this.findObjs(newAttributes);
	    switch (existing.length) {
	      case 0:
	        return this.createObj(type, newAttributes);
	      case 1:
	        return existing[0];
	      default:
	        throw new Error('Asked for a single ' + type + ' but more than 1 was found matching attributes: ' +
	          JSON.stringify(attributes));
	    }
	  },

	  getAttrByName: function (character, attrName) {
	    return getAttrByName(character, attrName);
	  },

	  getAttrObjectByName: function (character, attrName) {
	    var attr = this.findObjs({ type: 'attribute', characterid: character, name: attrName });
	    return attr && attr.length > 0 ? attr[0] : null;
	  },

	  getOrCreateAttr: function (characterId, attrName) {
	    return this.getOrCreateObj('attribute', { characterid: characterId, name: attrName });
	  },

	  setAttrByName: function (characterId, attrName, value) {
	    this.getOrCreateAttr(characterId, attrName).set('current', value);
	  },

	  processAttrValue: function (characterId, attrName, cb) {
	    var attribute = this.getOrCreateAttr(characterId, attrName);
	    attribute.set('current', cb(attribute.get('current')));
	  },

	  getRepeatingSectionAttrs: function (characterId, sectionName) {
	    var prefix = 'repeating_' + sectionName;
	    return _.filter(this.findObjs({ type: 'attribute', characterid: characterId }), function (attr) {
	      return attr.get('name').indexOf(prefix) === 0;
	    });
	  },

	  getRepeatingSectionItemIdsByName: function (characterId, sectionName) {
	    var re = new RegExp('repeating_' + sectionName + '_([^_]+)_name$');
	    return _.reduce(this.getRepeatingSectionAttrs(characterId, sectionName),
	      function (lookup, attr) {
	        var match = attr.get('name').match(re);
	        if (match) {
	          lookup[attr.get('current').toLowerCase()] = match[1];
	        }
	        return lookup;
	      }, {});
	  },

	  getCurrentPage: function (playerId) {
	    var pageId;
	    if (this.playerIsGM(playerId)) {
	      pageId = this.getObj('player', playerId).get('lastpage');
	    }
	    else {
	      pageId = this.getCampaign().get('playerspecificpages')[playerId] || this.getCampaign().get('playerpageid');
	    }
	    return pageId ? this.getObj('page', pageId) : null;
	  },

	  spawnFx: function (pointsArray, fxType, pageId) {
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
	  },

	  playerIsGM: function (playerId) {
	    return playerIsGM(playerId);
	  },

	  getCampaign: function () {
	    return Campaign(); //jshint ignore: line
	  },

	  sendChat: function (sendAs, message, callback, options) {
	    return sendChat(sendAs, message, callback, options);
	  },

	  on: function (event, callback) {
	    return on(event, callback);
	  },

	  log: function (msg) {
	    return log(msg);
	  },

	  logWrap: 'roll20'
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = _;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2);

	/**
	 * A specification of a field that can appear
	 * in the format that this parser processes
	 * @typedef {Object} FieldSpec
	 * @property {FieldSpec[]} [contentModel] - list of child fieldSpecs for complex content
	 * @property {boolean} [bare] - if true this field appears as a bare value with no parseToken in front of it
	 * @property {string} [parseToken] - the token that defines the beginning of this field (usually case insensitive). Not used for bare tokens.
	 * @property {string} [pattern] - a pattern that defines the value of this field. For bare properties this will determine
	 *                                  if the field matches at all, whereas for normal ones this will just be used to validate them
	 * @property {number} [forNextMatchGroup] - the 1-based index of the match group from the supplied pattern that will contain text that
	 *                                          should be handed to the next parser rather than used as part of this field.
	 * @property {number} [forPreviousMatchGroup] - the 1-based index of the match group from the supplied pattern that will contain text that
	 *                                          should be handed to the previous parser to complete its value rather than used as part of this field.
	 *                                          Only applicable to
	 *                                          bare properties, since ones with a token have a clearly defined start based on the parseToken
	 * @property {number} [matchGroup=0] - the index of the capturing group in the supplied pattern to use as the value for this field. If left at the
	 *                                      default of 0, the whole match will be used.
	 * @property {boolean} [caseSensitive=false] - If true, the pattern used for the value of this field will be made case sensitive. Note
	 *                                        that parseToken matching is always case insensitive.
	 * @property {string} type - the type of this field. Currently valid values are [orderedContent, unorderedContent, string, enumType, integer, abililty]
	 * @property {string[]} enumValues - an array of valid values for this field if the type is enumType
	 * @property {number} [minOccurs=1] - the minimum number of times this field should occur in the parent content model.
	 * @property {number} [maxOccurs=1] - the maximum number of times this field should occur in the parent content model.
	 */


	/**
	 *
	 * @param {FieldSpec} formatSpec - Root format specification for this parser
	 * @param logger - Logger object to use for reporting errors etc.
	 * @returns {{parse:parse}} - A parser that will process text in the format specified by the supplied formatSpec into JSON objects
	 */
	function getParser(formatSpec, logger) {
	  'use strict';


	  //noinspection JSUnusedGlobalSymbols
	  var parserModule = {

	    makeContentModelParser: function (fieldSpec, ordered) {
	      var module = this;
	      return {

	        parse: function (stateManager, textLines, resume) {

	          var parseState = stateManager.enterChildParser(this, resume),
	            someMatch = false,
	            canContinue,
	            stopParser = null;

	          parseState.subParsers = parseState.subParsers || module.makeParserList(fieldSpec.contentModel);


	          if (parseState.resumeParser) {
	            if (!parseState.resumeParser.resumeParse(stateManager, textLines)) {
	              stateManager.leaveChildParser(this);
	              return false;
	            }

	            someMatch = true;

	          }

	          var parseRunner = function (parser, index, parsers) {

	            if (!parser.parse(stateManager, textLines)) {

	              if (parser.required === 0 || !ordered) {
	                //No match but it's ok to keep looking
	                //through the rest of the content model for one
	                return false;
	              }

	              //No match but one was required here by the content model
	            }
	            else {
	              parser.justMatched = true;
	              if (parser.required > 0) {
	                parser.required--;
	              }
	              parser.allowed--;
	              if (ordered) {
	                //Set all the previous parsers to be exhausted since we've matched
	                //this one and we're in a strictly ordered content model.
	                _.each(parsers.slice(0, index), _.partial(_.extend, _, { allowed: 0 }));
	              }
	            }
	            return true;
	          };

	          do {

	            stopParser = _.find(parseState.subParsers, parseRunner);
	            logger.debug('Stopped at parser $$$', stopParser);
	            canContinue = stopParser && stopParser.justMatched;
	            if (stopParser) {
	              someMatch = someMatch || stopParser.justMatched;
	              stopParser.justMatched = false;
	            }

	            //Lose any parsers that have used up all their cardinality already
	            parseState.subParsers = _.reject(parseState.subParsers, { allowed: 0 });

	          } while (!_.isEmpty(parseState.subParsers) && !_.isEmpty(textLines) && canContinue);

	          stateManager.leaveChildParser(this, someMatch ? parseState : undefined);

	          return someMatch;
	        },

	        resumeParse: function (stateManager, textLines) {
	          return this.parse(stateManager, textLines, true);
	        },
	        complete: function (parseState, finalText) {
	          var missingContent = _.filter(parseState.subParsers, 'required');
	          if (!_.isEmpty(missingContent)) {
	            throw new MissingContentError(missingContent);
	          }
	        }
	      };
	    },

	    matchParseToken: function (myParseState, textLines) {
	      if (_.isEmpty(textLines) || this.bare) {
	        return !_.isEmpty(textLines);
	      }

	      var re = new RegExp('^(.*?)(' + this.parseToken + ')(?:[\\s.]+|$)', 'i');
	      var match = textLines[0].match(re);
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

	    matchValue: function (myParseState, textLines) {
	      if (this.pattern && this.bare) {
	        //If this is not a bare value then we can take all the text up to next
	        //token and just validate it at the end. If it is, then the pattern itself
	        //defines whether this field matches and we must run it immediately.

	        if (_.isEmpty(textLines)) {
	          return false;
	        }
	        textLines[0] = textLines[0].trim();

	        var matchGroup = this.matchGroup || 0;
	        var re = new RegExp(this.pattern, this.caseSensitive ? '' : 'i');
	        logger.debug('$$$ attempting to match value [$$$] against regexp $$$', this.name, textLines[0], re.toString());
	        var match = textLines[0].match(re);

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
	        else {
	          logger.debug('Match failed');
	        }
	        return false;
	      }
	      else {
	        logger.debug('$$$ standard string match, not using pattern', this.name);
	        myParseState.text = '';
	        return true;
	      }

	    },

	    orderedContent: function (fieldSpec) {
	      return this.makeContentModelParser(fieldSpec, true);
	    },

	    unorderedContent: function (fieldSpec) {
	      return this.makeContentModelParser(fieldSpec, false);
	    },

	    string: function (fieldSpec) {
	      return this.makeSimpleValueParser();
	    },


	    enumType: function (fieldSpec) {
	      var parser = this.makeSimpleValueParser();

	      if (fieldSpec.bare) {
	        parser.matchValue = function (myParseState, textLines) {
	          var parser = this;
	          var firstMatch = _.chain(fieldSpec.enumValues)
	            .map(function (enumValue) {
	              logger.debug('Attempting to parse as enum property $$$', enumValue);
	              var pattern = '^(.*?)(' + enumValue + ')(?:[\\s.]+|$)';
	              var re = new RegExp(pattern, parser.caseSensitive ? '' : 'i');
	              return textLines[0].match(re);
	            })
	            .compact()
	            .sortBy(function (match) {
	              return match[1].length;
	            })
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

	    number: function (fieldSpec) {
	      var parser = this.makeSimpleValueParser();
	      parser.typeConvert = function (textValue) {
	        var parts = textValue.split('/');
	        var intVal;
	        if (parts.length > 1) {
	          intVal = parts[0] / parts[1];
	        }
	        else {
	          intVal = parseInt(textValue);
	        }

	        if (_.isNaN(intVal)) {
	          throw new BadValueError(fieldSpec.name, textValue, '[Integer]');
	        }
	        return intVal;
	      };
	      return parser;
	    },


	    ability: function (fieldSpec) {
	      var parser = this.number();
	      parser.matchValue = function (parseState, textLines) {
	        if (_.isEmpty(textLines)) {
	          return false;
	        }
	        var re = new RegExp('^([\\sa-z\\(\\)]*)(\\d+(?:\\s?\\([\\-+\\d]+\\))?)', 'i');
	        logger.debug('Attempting to match value [$$$] against regexp $$$', textLines[0].trim(), re.toString());
	        var match = textLines[0].trim().match(re);

	        if (match) {
	          logger.debug('Successful match $$$', match);
	          parseState.text = match[2];
	          textLines[0] = match[1] + textLines[0].slice(match.index + match[0].length);
	          if (!textLines[0]) {
	            textLines.shift();
	          }
	          return true;
	        }
	        return false;
	      };

	      return parser;
	    },

	    heading: function (fieldSpec) {
	      fieldSpec.bare = true;
	      var parser = this.makeSimpleValueParser();
	      parser.skipOutput = true;
	      return parser;
	    },

	    makeSimpleValueParser: function () {
	      var module = this;
	      return {
	        parse: function (stateManager, textLines) {
	          var parseState = stateManager.enterChildParser(this);
	          var match = this.matchParseToken(parseState, textLines) &&
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
	        complete: function (parseState, finalText) {
	          parseState.text += finalText ? finalText : '';
	          if (parseState.text) {
	            parseState.value = this.extractValue(parseState.text);
	            parseState.value = this.typeConvert(parseState.value);
	            parseState.setOutputValue();
	          }
	        },
	        extractValue: function (text) {
	          text = text.trim();
	          if (this.pattern && !this.bare) {


	            var regExp = new RegExp(this.pattern, this.caseSensitive ? '' : 'i');
	            var match = text.match(regExp);
	            if (match) {
	              var matchGroup = this.matchGroup || 0;
	              return match[matchGroup];
	            }
	            else {
	              throw new BadValueError(this.name, text, regExp);
	            }
	          }
	          else {
	            return text;
	          }
	        },
	        typeConvert: function (textValue) {
	          return textValue;
	        },
	        resumeParse: function (stateManager, textLines) {
	          if (_.isEmpty(textLines)) {
	            return false;
	          }
	          var parseState = stateManager.enterChildParser(this, true);
	          parseState.text += textLines.shift() + '\n';
	          stateManager.leaveChildParser(this, parseState);
	          return true;
	        },
	        matchParseToken: module.matchParseToken,
	        matchValue: module.matchValue
	      };
	    },

	    makeBaseParseState: function (skipOutput, propertyPath, outputObject, completedObjects) {
	      return {
	        text: '',
	        getObjectValue: function () {
	          var value = outputObject;
	          var segments = _.clone(propertyPath);
	          while (segments.length) {
	            var prop = segments.shift();
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
	        setOutputValue: function () {
	          if (skipOutput) {
	            return;
	          }
	          var outputTo = outputObject;
	          var segments = _.clone(propertyPath);
	          while (segments.length > 0) {
	            var prop = segments.shift();
	            if (prop.flatten) {
	              continue;
	            }

	            var currentValue = outputTo[prop.name];
	            var newValue = segments.length === 0 ? this.value : {};

	            if (_.isUndefined(currentValue) && prop.allowed > 1) {
	              currentValue = [];
	              outputTo[prop.name] = currentValue;
	            }

	            if (_.isArray(currentValue)) {
	              var arrayItem = _.find(currentValue, _.partial(_.negate(_.contains), completedObjects));
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
	        logWrap: 'parseState[' + _.pluck(propertyPath, 'name').join('/') + ']',
	        toJSON: function () {
	          return _.extend(_.clone(this), { propertyPath: propertyPath });
	        }
	      };
	    },

	    makeParseStateManager: function () {
	      var incompleteParserStack = [];
	      var currentPropertyPath = [];
	      var completedObjects = [];
	      var module = this;
	      return {
	        outputObject: {},
	        leaveChildParser: function (parser, state) {
	          currentPropertyPath.pop();
	          if (state) {
	            state.resumeParser = _.isEmpty(incompleteParserStack) ? null : _.last(incompleteParserStack).parser;
	            incompleteParserStack.push({ parser: parser, state: state });
	          }
	        },
	        completeCurrentStack: function (finalText) {
	          while (!_.isEmpty(incompleteParserStack)) {
	            var incomplete = incompleteParserStack.shift();
	            incomplete.parser.complete(incomplete.state, finalText);
	            var value = incomplete.state.getObjectValue();
	            if (_.isObject(value) && !incomplete.parser.flatten) {
	              //Crude but this list is unlikely to get that big
	              completedObjects.push(value);
	            }
	          }
	        },
	        enterChildParser: function (parser, resume) {
	          currentPropertyPath.push({
	            name: parser.name,
	            allowed: parser.allowed,
	            flatten: parser.flatten
	          });

	          if (!resume || _.isEmpty(incompleteParserStack) || parser !== _.last(incompleteParserStack).parser) {
	            return module.makeBaseParseState(parser.skipOutput, _.clone(currentPropertyPath), this.outputObject, completedObjects);
	          }

	          return incompleteParserStack.pop().state;
	        },
	        logWrap: 'parserState',
	        toJSON: function () {
	          return _.extend(_.clone(this), {
	            incompleteParsers: incompleteParserStack,
	            propertyPath: currentPropertyPath
	          });
	        }

	      };
	    },

	    parserId: 0,
	    parserAttributes: [
	      'forPreviousMatchGroup', 'forNextMatchGroup',
	      'parseToken', 'flatten', 'pattern', 'matchGroup', 'bare', 'caseSensitive',
	      'name', 'skipOutput'
	    ],
	    getParserFor: function (fieldSpec) {
	      logger.debug('Making parser for field $$$', fieldSpec);
	      var parserBuilder = this[fieldSpec.type];
	      if (!parserBuilder) {
	        throw new Error('Can\'t make parser for type ' + fieldSpec.type);
	      }
	      var parser = parserBuilder.call(this, fieldSpec);
	      parser.required = _.isUndefined(fieldSpec.minOccurs) ? 1 : fieldSpec.minOccurs;
	      parser.allowed = _.isUndefined(fieldSpec.maxOccurs) ? 1 : fieldSpec.maxOccurs;
	      _.extend(parser, _.pick(fieldSpec, this.parserAttributes));
	      _.defaults(parser, {
	        parseToken: parser.name
	      });
	      parser.id = this.parserId++;
	      parser.logWrap = 'parser[' + parser.name + ']';
	      return parser;
	    },


	    makeParserList: function (contentModelArray) {
	      var module = this;
	      return _.chain(contentModelArray)
	        .reject('noParse')
	        .reduce(function (parsers, fieldSpec) {
	          parsers.push(module.getParserFor(fieldSpec));
	          return parsers;
	        }, [])
	        .value();
	    },

	    logWrap: 'parseModule'
	  };

	  logger.wrapModule(parserModule);

	  var parser = parserModule.getParserFor(formatSpec);
	  return {
	    parse: function (text) {
	      logger.debug('Text: $$$', text);

	      var textLines = _.chain(text.split('\n'))
	        .invoke('trim')
	        .compact()
	        .value();
	      logger.debug(parser);
	      var stateManager = parserModule.makeParseStateManager();
	      var success = parser.parse(stateManager, textLines);
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
	    }
	  };

	}

	/**
	 * @constructor
	 */
	function ParserError(message) {
	  'use strict';
	  //noinspection JSUnusedGlobalSymbols
	  this.message = message;
	}
	ParserError.prototype = new Error();

	/**
	 * @constructor
	 */
	function MissingContentError(missingFieldParsers) {
	  'use strict';
	  this.missingFieldParsers = missingFieldParsers;
	  //noinspection JSUnusedGlobalSymbols
	  this.message = _.reduce(this.missingFieldParsers, function (memo, parser) {
	      return memo + '<li>Field ' + parser.parseToken + ' should have appeared ' + parser.required + ' more times</li>';
	    }, '<ul>') + '</ul>';
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
	  //noinspection JSUnusedGlobalSymbols
	  this.message = 'Bad value [' + this.value + '] for field [' + this.name + ']. Should have matched pattern: ' +
	    this.pattern;
	}
	BadValueError.prototype = new ParserError();

	module.exports = {
	  getParser: getParser,
	  MissingContentError: MissingContentError,
	  BadValueError: BadValueError,
	  ParserError: ParserError
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

	var _ = __webpack_require__(2);
	var roll20 = __webpack_require__(1);

	/**
	 *
	 * @param config
	 * @returns {{debug:function, error:function, info:function, trace:function, warn:function}}
	 */
	module.exports = function (config) {
	  'use strict';

	  var logger = {
	      OFF: 0,
	      ERROR: 1,
	      WARN: 2,
	      INFO: 3,
	      DEBUG: 4,
	      TRACE: 5,
	      prefixString: ''
	    },

	    stringify = function (object) {
	      if (object === undefined) {
	        return object;
	      }

	      return typeof object === 'string' ? object : JSON.stringify(object, function (key, value) {
	        if (key !== 'logWrap' && key !== 'isLogWrapped') {
	          return value;
	        }
	      });
	    },

	    shouldLog = function (level) {
	      var logLevel = logger.INFO;
	      if (config && config.logLevel) {
	        logLevel = logger[config.logLevel];
	      }

	      return level <= logLevel;
	    },

	    outputLog = function (level, message) {

	      if (!shouldLog(level)) {
	        return;
	      }

	      var args = arguments.length > 2 ? _.toArray(arguments).slice(2) : [];
	      message = stringify(message);
	      if (message) {
	        message = message.replace(/\$\$\$/g, function () {
	          return stringify(args.shift());
	        });
	      }
	      //noinspection NodeModulesDependencies
	      roll20.log('ShapedScripts ' + Date.now() + ' ' + logger.getLabel(level) + ' : ' +
	        (shouldLog(logger.TRACE) ? logger.prefixString : '') +
	        message);
	    };

	  logger.getLabel = function (logLevel) {
	    var logPair = _.chain(logger).pairs().find(function (pair) {
	      return pair[1] === logLevel;
	    }).value();
	    return logPair ? logPair[0] : 'UNKNOWN';
	  };

	  _.each(logger, function (level, levelName) {
	    logger[levelName.toLowerCase()] = _.partial(outputLog, level);
	  });

	  logger.wrapModule = function (modToWrap) {
	    if (shouldLog(logger.TRACE)) {
	      _.chain(modToWrap)
	        .functions()
	        .each(function (funcName) {
	          var origFunc = modToWrap[funcName];
	          modToWrap[funcName] = logger.wrapFunction(funcName, origFunc, modToWrap.logWrap);
	        });
	      modToWrap.isLogWrapped = true;
	    }
	  };

	  logger.getLogTap = function (level, messageString) {
	    return _.partial(outputLog, level, messageString);
	  };

	  logger.wrapFunction = function (name, func, moduleName) {
	    if (shouldLog(logger.TRACE)) {
	      if (name === 'toJSON' || moduleName === 'roll20' && name === 'log') {
	        return func;
	      }
	      return function () {
	        logger.trace('$$$.$$$ starting with this value: $$$ and args $$$', moduleName, name, this, arguments);
	        logger.prefixString = logger.prefixString + '  ';
	        var retVal = func.apply(this, arguments);
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
	  //noinspection JSValidateTypes
	  return logger;
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var _ = __webpack_require__(2);
	var utils = __webpack_require__(7);


	module.exports = EntityLookup;


	function EntityLookup() {
	  var entities = {},
	    noWhiteSpaceEntities = {},
	    entityProcessors = {},
	    versionCheckers = {},
	    self = this;

	  this.configureEntity = function (entityName, processors, versionChecker) {
	    entities[entityName] = {};
	    noWhiteSpaceEntities[entityName] = {};
	    entityProcessors[entityName] = processors;
	    versionCheckers[entityName] = versionChecker;
	  };

	  this.addEntities = function (entitiesObject) {
	    var results = {
	      errors: []
	    };


	    _.chain(entitiesObject)
	      .omit('version', 'patch')
	      .each(function (entityArray, type) {
	        results[type] = {
	          withErrors: [],
	          skipped: [],
	          deleted: [],
	          patched: [],
	          added: []
	        };

	        if (!entities[type]) {
	          results.errors.push({ entity: 'general', errors: ['Unrecognised entity type ' + type] });
	          return;
	        }

	        if (!versionCheckers[type](entitiesObject.version, results.errors)) {
	          return;
	        }


	        _.each(entityArray, function (entity) {
	          var key = entity.name.toLowerCase();
	          var operation = !!entities[type][key] ? (entitiesObject.patch ? 'patched' : 'skipped') : 'added';

	          if (operation === 'patched') {
	            entity = patchEntity(entities[type][key], entity);
	            if (!entity) {
	              operation = 'deleted';
	              delete entities[type][key];
	              delete noWhiteSpaceEntities[type][key.replace(/\s+/g, '')];
	            }

	          }

	          if (_.contains(['patched', 'added'], operation)) {
	            var processed = _.reduce(entityProcessors[type], utils.executor, {
	              entity: entity,
	              type: type,
	              version: entitiesObject.version,
	              errors: []
	            });
	            if (!_.isEmpty(processed.errors)) {
	              processed.entity = processed.entity.name;
	              results.errors.push(processed);
	              operation = 'withErrors';
	            }
	            else {
	              if (processed.entity.name.toLowerCase() !== key) {
	                results[type].deleted.push(key);
	                delete entities[type][key];
	                delete noWhiteSpaceEntities[type][key.replace(/\s+/g, '')];
	                key = processed.entity.name.toLowerCase();
	              }
	              entities[type][key] = processed.entity;
	              noWhiteSpaceEntities[type][key.replace(/\s+/g, '')] = processed.entity;
	            }
	          }


	          results[type][operation].push(key);
	        });
	      });

	    return results;
	  };

	  this.findEntity = function (type, name, tryWithoutWhitespace) {
	    var key = name.toLowerCase();
	    if (!entities[type]) {
	      throw new Error('Unrecognised entity type ' + type);
	    }
	    var found = entities[type][key];
	    if (!found && tryWithoutWhitespace) {
	      found = noWhiteSpaceEntities[type][key.replace(/\s+/g, '')];
	    }
	    return found && utils.deepClone(found);
	  };

	  this.getAll = function (type) {
	    if (!entities[type]) {
	      throw new Error('Unrecognised entity type: ' + type);
	    }
	    return utils.deepClone(_.values(entities[type]));
	  };

	  /**
	   * Gets all of the keys for the specified entity type
	   * @param {string} type - The entity type to retrieve keys for (either 'monster' or 'spell')
	   * @param {boolean} sort - True if the returned array should be sorted alphabetically; false otherwise
	   * @function
	   * @public
	   * @name EntityLookup#getKeys
	   * @return {Array} An array containing all keys for the specified entity type
	   */
	  this.getKeys = function (type, sort) {
	    if (!entities[type]) {
	      throw new Error('Unrecognised entity type: ' + type);
	    }
	    var keys = _.keys(entities[type]);
	    if (sort) {
	      keys.sort();
	    }
	    return keys;
	  };


	  /**
	   * Gets spell hydrator
	   * @function
	   * @public
	   * @name EntityLookup#getSpellHydrator
	   * @return {function}
	   */
	  this.getSpellHydrator = function () {
	    return function (monsterInfo) {
	      var monster = monsterInfo.entity;
	      if (monster.spells) {
	        monster.spells = _.map(monster.spells.split(', '), function (spellName) {
	          return self.findEntity('spells', spellName) || spellName;
	        });
	      }
	      return monsterInfo;
	    };
	  };

	  this.getMonsterSpellUpdater = function () {
	    return function (spellInfo) {
	      var spell = spellInfo.entity;
	      _.chain(entities.monsters)
	        .pluck('spells')
	        .compact()
	        .each(function (spellArray) {
	          var spellIndex = _.findIndex(spellArray, function (monsterSpell) {
	            if (typeof monsterSpell === 'string') {
	              return monsterSpell.toLowerCase() === spell.name.toLowerCase();
	            }
	            else {
	              return monsterSpell !== spell && monsterSpell.name.toLowerCase() === spell.name.toLowerCase();
	            }
	          });
	          if (spellIndex !== -1) {
	            spellArray[spellIndex] = spell;
	          }
	        });
	      return spellInfo;
	    };
	  };


	  this.toJSON = function () {
	    return { monsterCount: _.size(entities.monsters), spellCount: _.size(entities.spells) };
	  };

	}

	EntityLookup.prototype.logWrap = 'entityLookup';
	EntityLookup.jsonValidatorAsEntityProcessor = function (jsonValidator) {
	  return function (entityInfo) {
	    var wrapper = {
	      version: entityInfo.version
	    };
	    wrapper[entityInfo.type] = [entityInfo.entity];
	    var errors = jsonValidator.validate(wrapper);
	    var flattenedErrors = _.chain(errors).values().flatten().value();
	    entityInfo.errors = entityInfo.errors.concat(flattenedErrors);
	    return entityInfo;
	  };
	};
	EntityLookup.jsonValidatorAsVersionChecker = function (jsonValidator) {
	  return EntityLookup.getVersionChecker(jsonValidator.getVersionNumber());
	};
	EntityLookup.getVersionChecker = function (requiredVersion) {
	  return function (version, errorsArray) {
	    var valid = version === requiredVersion;
	    if (!valid) {
	      errorsArray.push({
	        entity: 'general',
	        errors: ['Incorrect entity objects version: [' + version + ']. Required is: ' + requiredVersion]
	      });
	    }
	    return valid;
	  };
	};


	function patchEntity(original, patch) {
	  if (patch.remove) {
	    return undefined;
	  }
	  return _.mapObject(original, function (propVal, propName) {
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
	var _ = __webpack_require__(2);

	//noinspection JSUnusedGlobalSymbols
	module.exports = {
	  deepExtend: function (original, newValues) {
	    var self = this;
	    if (!original) {
	      original = _.isArray(newValues) ? [] : {};
	    }
	    _.each(newValues, function (value, key) {
	      if (_.isArray(original[key])) {
	        if (!_.isArray(value)) {
	          original[key].push(value);
	        }
	        else {
	          original[key] = _.map(value, function (item, index) {
	            if (_.isObject(item)) {
	              return self.deepExtend(original[key][index], item);
	            }
	            else {
	              return item !== undefined ? item : original[key][index];
	            }
	          });
	        }
	      }
	      else if (_.isObject(original[key])) {
	        original[key] = self.deepExtend(original[key], value);
	      }
	      else {
	        original[key] = value;
	      }

	    });
	    return original;
	  },

	  createObjectFromPath: function (pathString, value) {
	    var newObject = {};
	    _.reduce(pathString.split(/\./), function (object, pathPart, index, pathParts) {
	      var match = pathPart.match(/([^.\[]*)(?:\[(\d+)\])?/);
	      var newVal = index === pathParts.length - 1 ? value : {};

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

	  getObjectFromPath: function (obj, path) {
	    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
	    path = path.replace(/^\./, '');           // strip a leading dot
	    var a = path.split('.');
	    for (var i = 0, n = a.length; i < n; ++i) {
	      var k = a[i];
	      if (k in obj) {
	        obj = obj[k];
	      }
	      else {
	        return;
	      }
	    }
	    return obj;
	  },

	  deepClone: function (object) {
	    return JSON.parse(JSON.stringify(object));
	  },

	  executor: function () {
	    switch (arguments.length) {
	      case 0:
	        return;
	      case 1:
	        return arguments[0]();
	      default:
	        var args = Array.apply(null, arguments).slice(2);
	        args.unshift(arguments[0]);
	        return arguments[1].apply(null, args);
	    }
	  },

	  /**
	   * Gets a string as 'Title Case' capitalizing the first letter of each word (i.e. 'the grapes of wrath' -> 'The Grapes Of Wrath')
	   * @param {string} s - The string to be converted
	   * @return {string} the supplied string in title case
	   */
	  toTitleCase: function (s) {
	    return s.replace(/\w\S*/g, function (txt) {
	      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	    });
	  },

	  /**
	   * Calculates a contrasting color using YIQ luma value
	   * @param {string} hexcolor - the color to calculate a contrasting color for
	   * @return {string} either 'white' or 'black' as determined to be the best contrasting text color for the input color
	   */
	  getContrastYIQ: function (hexcolor) {
	    hexcolor = hexcolor.replace('#', '');
	    if (hexcolor.length === 3) {
	      hexcolor += hexcolor;
	    }
	    var r = parseInt(hexcolor.substr(0, 2), 16);
	    var g = parseInt(hexcolor.substr(2, 2), 16);
	    var b = parseInt(hexcolor.substr(4, 2), 16);
	    var yiq = (r * 299 + g * 587 + b * 114) / 1000;
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
	  buildHTML: function (tag, innerHtml, attrs) {
	    var self = this;

	    if (typeof innerHtml === 'object') {
	      var res = '';
	      _.each(innerHtml, function (html) {
	        if (!_.isUndefined(html)) {
	          res += '' + self.buildHTML(html.tag, html.innerHtml, html.attrs);
	        }
	      });
	      innerHtml = res;
	    }

	    var h = '<' + tag;

	    for (var attr in attrs) {
	      if (attrs.hasOwnProperty(attr)) {
	        if (attrs[attr] === false) {
	          continue;
	        }
	        h += ' ' + attr + '="' + attrs[attr] + '"';
	      }
	    }

	    h += innerHtml ? '>' + innerHtml + '</' + tag + '>' : '/>';

	    return h;
	  },

	  versionCompare: function (v1, v2) {

	    if (v1 === v2) {
	      return 0;
	    }
	    else if (v1 === undefined || v1 === null) {
	      return -1;
	    }
	    else if (v2 === undefined || v2 === null) {
	      return 1;
	    }

	    var v1parts = v1.split('.');
	    var v2parts = v2.split('.');

	    var isValidPart = function (x) {
	      return /^\d+$/.test(x);
	    };

	    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
	      return NaN;
	    }

	    v1parts = _.map(v1parts, Number);
	    v2parts = _.map(v2parts, Number);

	    for (var i = 0; i < v1parts.length; ++i) {
	      if (v2parts.length === i) {
	        return 1;
	      }

	      if (v1parts[i] > v2parts[i]) {
	        return 1;
	      }
	      else if (v1parts[i] < v2parts[i]) {
	        return -1;
	      }
	    }

	    if (v1parts.length !== v2parts.length) {
	      return -1;
	    }

	    return 0;
	  }

	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var _ = __webpack_require__(2);

	//noinspection JSUnusedGlobalSymbols
	var validatorFactories = {
	  orderedContent: function (spec) {
	    return makeContentModelValidator(spec);
	  },

	  unorderedContent: function (spec) {
	    return makeContentModelValidator(spec);
	  },

	  string: function (spec) {
	    if (spec.pattern) {
	      if (spec.matchGroup) {
	        return regExValidator(spec.name, extractRegexPart(spec.pattern, spec.matchGroup), spec.caseSensitive);
	      }
	      else {
	        return regExValidator(spec.name, spec.pattern, spec.caseSensitive);
	      }
	    }
	    return function () {
	    };
	  },

	  enumType: function (spec) {
	    return function (value, errors) {
	      if (!_.some(spec.enumValues, function (enumVal) {
	          return new RegExp('^' + enumVal + '$', 'i').test(value);
	        })) {
	        errors.add('Value "' + value + '" should have been one of [' + spec.enumValues.join(',') + ']');
	      }
	    };
	  },

	  ability: function (spec) {
	    return regExValidator(spec.name, '\\d+');
	  },

	  heading: function (spec) {
	    return function () {
	    };
	  },

	  number: function (spec) {
	    return function (value, errors) {
	      if (typeof value !== 'number') {
	        errors.add('Value "' + value + '" should have been a number');
	      }
	    };
	  }
	};

	function extractRegexPart(regexp, matchIndex) {
	  var braceCount = 0;
	  var startIndex = _.findIndex(regexp, function (character, index) {
	    if (character === '(' &&
	      (index < 2 || regexp[index - 1] !== '\\') &&
	      regexp[index + 1] !== '?') {
	      return ++braceCount === matchIndex;
	    }
	  });

	  if (startIndex === -1) {
	    throw new Error('Can\'t find matchgroup ' + matchIndex + ' in regular expression ' + regexp);
	  }

	  //Lose the bracket
	  startIndex++;

	  var openCount = 1;
	  var endIndex = _.findIndex(regexp.slice(startIndex), function (character, index, regexp) {
	    if (character === '(' && regexp[index - 1] !== '\\') {
	      openCount++;
	    }
	    if (character === ')' && regexp[index - 1] !== '\\') {
	      return --openCount === 0;
	    }
	  });

	  if (endIndex === -1) {
	    throw new Error('matchgroup ' + matchIndex + ' seems not to have closing brace in regular expression ' + regexp);
	  }

	  return regexp.slice(startIndex, startIndex + endIndex);
	}

	function regExValidator(fieldName, regexp, caseSensitive) {
	  var re = new RegExp('^' + regexp + '$', caseSensitive ? undefined : 'i');
	  return function (value, errors) {
	    if (!re.test(value)) {
	      errors.add('Value "' + value + '" doesn\'t match pattern /' + regexp + '/');
	    }
	  };
	}

	function makeValidator(spec) {
	  var validator = validatorFactories[spec.type](spec);
	  validator.max = _.isUndefined(spec.maxOccurs) ? 1 : spec.maxOccurs;
	  validator.min = _.isUndefined(spec.minOccurs) ? 1 : spec.minOccurs;
	  validator.fieldName = spec.name;
	  return validator;
	}

	function makeContentModelValidator(spec) {
	  var parts = _.chain(spec.contentModel)
	    .reject({ type: 'heading' })
	    .partition({ flatten: true })
	    .value();
	  var flattened = _.map(parts[0], makeValidator);

	  var subValidators = _.reduce(parts[1], function (subValidators, field) {
	    subValidators[field.name] = makeValidator(field);
	    return subValidators;
	  }, {});

	  return function (object, errors, isFlatten) {
	    var completed = _.reduce(object, function (completed, fieldValue, fieldName) {
	      var validator = subValidators[fieldName];
	      if (validator) {
	        completed.push(fieldName);
	        errors.pushPath(fieldName);
	        if (_.isArray(fieldValue)) {
	          if (fieldValue.length > validator.max) {
	            errors.add('Number of entries [' + fieldValue.length + '] exceeds maximum allowed: ' + validator.max);
	          }
	          else if (fieldValue.length < validator.min) {
	            errors.add('Number of entries [' + fieldValue.length + '] is less than minimum allowed: ' + validator.min);
	          }
	          else {
	            _.each(fieldValue, function (arrayItem, index) {
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
	      return completed;
	    }, []);

	    var toValidate = _.omit(object, completed);
	    _.chain(flattened)
	      .map(function (validator) {
	        var subCompleted = validator(toValidate, errors, true);
	        if (subCompleted.length === 0) {
	          return validator;
	        }
	        else {
	          completed = completed.concat(subCompleted);
	        }
	        toValidate = _.omit(toValidate, completed);
	      })
	      .compact()
	      .each(function (validator) {
	        if (validator.min > 0) {
	          errors.pushPath(validator.fieldName);
	          errors.add('Section is missing');
	          errors.popPath();
	        }
	      });

	    //If we're a flattened validator (our content is injected directly into the parent content model)
	    //Then we should only report missing fields if there was some match in our content model - otherwise
	    //the parent content model will check the cardinality of this model as a whole
	    if (!isFlatten || !_.isEmpty(completed)) {
	      _.chain(subValidators)
	        .omit(completed)
	        .each(function (validator) {
	          if (validator.min > 0) {
	            errors.pushPath(validator.fieldName);
	            errors.add('Field is missing');
	            errors.popPath();
	          }
	        });
	    }

	    //Flattened content models shouldn't check for unrecognised fields since they're only parsing
	    //part of the current content model.
	    if (!isFlatten) {
	      _.chain(object)
	        .omit(completed)
	        .each(function (value, key) {
	          errors.pushPath(key);
	          errors.add('Unrecognised field');
	          errors.popPath();
	        });
	    }


	    return completed;
	  };
	}

	function Errors() {

	  var errors = [];
	  var currentPath = [];
	  this.pushPath = function (path) {
	    currentPath.push(path);
	  };
	  this.popPath = function () {
	    currentPath.pop();
	  };
	  this.pushIndex = function (index) {
	    currentPath[currentPath.length - 1] = currentPath[currentPath.length - 1] + '[' + index + ']';
	  };

	  this.popIndex = function (index) {
	    currentPath[currentPath.length - 1] = currentPath[currentPath.length - 1].replace(/\[[^\]]+\]/, '');
	  };

	  this.add = function (msg) {
	    errors.push({ msg: msg, path: _.clone(currentPath) });
	  };

	  this.getErrors = function () {
	    return _.chain(errors)
	      .groupBy(function (error) {
	        return error.path[0];
	      })
	      .mapObject(function (errorList) {
	        return _.map(errorList, function (error) {
	          return error.path.slice(1).join('.') + ': ' + error.msg;
	        });
	      })
	      .value();
	  };
	}

	module.exports = JSONValidator;

	function JSONValidator(spec) {
	  var versionProp = {
	    type: 'string',
	    name: 'version',
	    pattern: '^' + spec.formatVersion.replace('.', '\\.') + '$'
	  };
	  var contentValidator = makeValidator({ type: 'unorderedContent', contentModel: [spec, versionProp] });
	  this.validate = function (object) {
	    var errors = new Errors();
	    contentValidator(object, errors);
	    return errors.getErrors();
	  };

	  this.getVersionNumber = function () {
	    return spec.formatVersion;
	  };

	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	function Reporter(roll20, scriptName) {
	  this.report = function (heading, text) {
	    //Horrible bug with this at the moment - seems to generate spurious chat
	    //messages when noarchive:true is set
	    //sendChat('ShapedScripts', '' + msg, null, {noarchive:true});

	    roll20.sendChat('',
	      '/w gm <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">' +
	      '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">' +
	      scriptName + ' ' + heading +
	      '</div>' +
	      text +
	      '</div>');
	  };

	  this.reportError = function (text) {
	    roll20.sendChat('',
	      '/w gm <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">' +
	      '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;color:red;">' +
	      scriptName +
	      '</div>' +
	      text +
	      '</div>');
	  };
	}


	module.exports = Reporter;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* globals unescape */
	'use strict';
	var _ = __webpack_require__(2);
	var srdConverter = __webpack_require__(11);
	var parseModule = __webpack_require__(3);
	var cp = __webpack_require__(12);
	var utils = __webpack_require__(7);
	var mpp = __webpack_require__(13);
	var AdvantageTracker = __webpack_require__(14);
	var ConfigUI = __webpack_require__(15);

	var schemaVersion = 1.0,
	  configDefaults = {
	    logLevel: 'INFO',
	    tokenSettings: {
	      number: false,
	      bar1: {
	        attribute: 'HP',
	        max: true,
	        link: false,
	        showPlayers: false
	      },
	      bar2: {
	        attribute: 'speed',
	        max: false,
	        link: true,
	        showPlayers: false
	      },
	      bar3: {
	        attribute: '',
	        max: false,
	        link: false,
	        showPlayers: false
	      },
	      aura1: {
	        radius: '',
	        color: '#FFFF99',
	        square: false
	      },
	      aura2: {
	        radius: '',
	        color: '#59e594',
	        square: false
	      },
	      light: {
	        radius: '',
	        dimRadius: '',
	        otherPlayers: false,
	        hasSight: false,
	        angle: 360,
	        losAngle: 360,
	        multiplier: 1
	      },
	      showName: true,
	      showNameToPlayers: false,
	      showAura1ToPlayers: true,
	      showAura2ToPlayers: true
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
	      autoAmmo: '@{ammo_auto_use_var}'
	    },
	    advTrackerSettings: {
	      showMarkers: false
	    },
	    rollHPOnDrop: true,
	    autoHD: true,
	    genderPronouns: [
	      {
	        matchPattern: '^f$|female|girl|woman|feminine',
	        nominative: 'she',
	        accusative: 'her',
	        possessive: 'her',
	        reflexive: 'herself'
	      },
	      {
	        matchPattern: '^m$|male|boy|man|masculine',
	        nominative: 'he',
	        accusative: 'him',
	        possessive: 'his',
	        reflexive: 'himself'
	      },
	      {
	        matchPattern: '^n$|neuter|none|construct|thing|object',
	        nominative: 'it',
	        accusative: 'it',
	        possessive: 'its',
	        reflexive: 'itself'
	      }
	    ],
	    defaultGenderIndex: 2

	  };

	var configToAttributeLookup = {
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
	  autoAmmo: 'ammo_auto_use'
	};

	var booleanValidator = function (value) {
	    var converted = value === 'true' || (value === 'false' ? false : value);
	    return {
	      valid: typeof value === 'boolean' || value === 'true' || value === 'false',
	      converted: converted
	    };
	  },

	  stringValidator = function (value) {
	    return {
	      valid: true,
	      converted: value
	    };
	  },

	  getOptionList = function (options) {
	    return function (value) {
	      if (value === undefined) {
	        return options;
	      }
	      return {
	        converted: options[value],
	        valid: options[value] !== undefined
	      };
	    };
	  },

	  integerValidator = function (value) {
	    var parsed = parseInt(value);
	    return {
	      converted: parsed,
	      valid: !isNaN(parsed)
	    };
	  },

	  colorValidator = function (value) {
	    return {
	      converted: value,
	      valid: /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value)
	    };
	  },

	  sheetOutputValidator = getOptionList({
	    public: '@{output_to_all}',
	    whisper: '@{output_to_gm}'
	  }),
	  barValidator = {
	    attribute: stringValidator,
	    max: booleanValidator,
	    link: booleanValidator,
	    showPlayers: booleanValidator
	  },
	  auraValidator = {
	    radius: stringValidator,
	    color: colorValidator,
	    square: booleanValidator
	  },
	  lightValidator = {
	    radius: stringValidator,
	    dimRadius: stringValidator,
	    otherPlayers: booleanValidator,
	    hasSight: booleanValidator,
	    angle: integerValidator,
	    losAngle: integerValidator,
	    multiplier: integerValidator
	  },
	  regExpValidator = function (value) {
	    try {
	      new RegExp(value, 'i').test('');
	      return {
	        converted: value,
	        valid: true
	      };
	    }
	    catch (e) {
	    }
	    return {
	      converted: null,
	      valid: false
	    };
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


	function ShapedScripts(logger, myState, roll20, parser, entityLookup, reporter) {
	  var sanitise = logger.wrapFunction('sanitise', __webpack_require__(16), '');
	  var addedTokenIds = [];
	  var report = reporter.report.bind(reporter);
	  var reportError = reporter.reportError.bind(reporter);
	  var self = this;
	  var chatWatchers = [];
	  var at = new AdvantageTracker(logger, myState);

	  /**
	   *
	   * @param {ChatMessage} msg
	   */
	  this.handleInput = function (msg) {
	    logger.debug(msg);
	    if (msg.type !== 'api') {
	      this.triggerChatWatchers(msg);
	      return;
	    }

	    this.getCommandProcessor().processCommand(msg);
	  };

	  var configOptionsSpec = {
	    logLevel: function (value) {
	      var converted = value.toUpperCase();
	      return { valid: _.has(logger, converted), converted: converted };
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
	      showAura2ToPlayers: booleanValidator
	    },
	    newCharSettings: {
	      sheetOutput: sheetOutputValidator,
	      deathSaveOutput: sheetOutputValidator,
	      initiativeOutput: sheetOutputValidator,
	      showNameOnRollTemplate: getOptionList({
	        true: '@{show_character_name_yes}',
	        false: '@{show_character_name_no}'
	      }),
	      rollOptions: getOptionList({
	        normal: '@{roll_1}',
	        advantage: '@{roll_advantage}',
	        disadvantage: '@{roll_disadvantage}',
	        two: '@{roll_2}'
	      }),
	      initiativeRoll: getOptionList({
	        normal: '@{normal_initiative}',
	        advantage: '@{advantage_on_initiative}',
	        disadvantage: '@{disadvantage_on_initiative}'
	      }),
	      initiativeToTracker: getOptionList({
	        true: '@{initiative_to_tracker_yes}',
	        false: '@{initiative_to_tracker_no}'
	      }),
	      breakInitiativeTies: getOptionList({
	        true: '@{initiative_tie_breaker_var}',
	        false: ''
	      }),
	      showTargetAC: getOptionList({
	        true: '@{attacks_vs_target_ac_yes}',
	        false: '@{attacks_vs_target_ac_no}'
	      }),
	      showTargetName: getOptionList({
	        true: '@{attacks_vs_target_name_yes}',
	        false: '@{attacks_vs_target_name_no}'
	      }),
	      autoAmmo: getOptionList({
	        true: '@{ammo_auto_use_var}',
	        false: ''
	      })
	    },
	    advTrackerSettings: {
	      showMarkers: booleanValidator,
	    },
	    rollHPOnDrop: booleanValidator,
	    autoHD: booleanValidator,
	    genderPronouns: [
	      {
	        matchPattern: regExpValidator,
	        nominative: stringValidator,
	        accusative: stringValidator,
	        possessive: stringValidator,
	        reflexive: stringValidator
	      }
	    ],
	    defaultGenderIndex: integerValidator
	  };

	  /////////////////////////////////////////
	  // Command handlers
	  /////////////////////////////////////////
	  this.configure = function (options) {
	    utils.deepExtend(myState.config, options);

	    var cui = new ConfigUI();

	    logger.debug('options: ' + options);

	    var menu;
	    if (options.advTrackerSettings || options.atMenu) {
	      menu = cui.getConfigOptionGroupAdvTracker(myState.config, configOptionsSpec);
	    }
	    else if (options.tokenSettings || options.tsMenu) {
	      menu = cui.getConfigOptionGroupTokens(myState.config, configOptionsSpec);
	    }
	    else if (options.newCharSettings || options.ncMenu) {
	      menu = cui.getConfigOptionGroupNewCharSettings(myState.config, configOptionsSpec);
	    }
	    else {
	      menu = cui.getConfigOptionsMenu();
	    }

	    report('Configuration', menu);
	  };

	  this.applyTokenDefaults = function (options) {
	    var self = this;
	    _.each(options.selected.graphic, function (token) {
	      var represents = token.get('represents');
	      var character = roll20.getObj('character', represents);
	      if (character) {
	        self.getTokenConfigurer(token)(character);
	      }
	    });
	  };

	  this.importStatblock = function (options) {
	    logger.info('Importing statblocks for tokens $$$', options.selected.graphic);
	    var self = this;
	    _.each(options.selected.graphic, function (token) {
	      var text = token.get('gmnotes');
	      if (text) {
	        text = sanitise(unescape(text), logger);
	        var monsters = parser.parse(text).monsters;
	        mpp(monsters, entityLookup);
	        self.importMonsters(monsters, options, token, [
	          function (character) {
	            character.set('gmnotes', text.replace(/\n/g, '<br>'));
	          }
	        ]);
	      }
	    });
	  };

	  this.importMonstersFromJson = function (options) {

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
	      var self = this;
	      if (!_.isEmpty(options.monsters)) {
	        setTimeout(function () {
	          self.importMonstersFromJson(options);
	        }, 200);
	      }
	    }

	  };

	  this.importMonsters = function (monsters, options, token, characterProcessors) {
	    var characterRetrievalStrategies = [];

	    if (token) {
	      characterProcessors.push(this.getAvatarCopier(token).bind(this));
	      if (_.size(monsters) === 1) {
	        characterProcessors.push(this.getTokenConfigurer(token).bind(this));
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

	    var errors = [];
	    var importedList = _.chain(monsters)
	      .map(function (monsterData) {

	        var character = _.reduce(characterRetrievalStrategies, function (result, strategy) {
	          return result || strategy(monsterData.name, errors);
	        }, null);

	        if (!character) {
	          logger.error('Failed to find or create character for monster $$$', monsterData.name);
	          return null;
	        }

	        var oldAttrs = roll20.findObjs({ type: 'attribute', characterid: character.id });
	        _.invoke(oldAttrs, 'remove');
	        character.set('name', monsterData.name);

	        _.each(characterProcessors, function (proc) {
	          proc(character, monsterData);
	        });
	        return character && character.get('name');
	      })
	      .compact()
	      .value();

	    if (!_.isEmpty(importedList)) {
	      var monsterList = importedList.join('</li><li>');
	      report('Import Success', 'Added the following monsters: <ul><li>' + monsterList + '</li></ul>');
	    }
	    if (!_.isEmpty(errors)) {
	      var errorList = errors.join('</li><li>');
	      reportError('The following errors occurred on import:  <ul><li>' + errorList + '</li></ul>');
	    }
	  };

	  this.importSpellsFromJson = function (options) {
	    if (_.isEmpty(options.spells)) {
	      this.showEntityPicker('spell', 'spells');
	    }
	    else {
	      this.addSpellsToCharacter(options.selected.character, options.spells);
	    }
	  };

	  this.showEntityPicker = function (entityName, entityNamePlural) {
	    var list = entityLookup.getKeys(entityNamePlural, true);

	    if (!_.isEmpty(list)) {
	      // title case the  names for better display
	      list.forEach(function (part, index) {
	        list[index] = utils.toTitleCase(part);
	      });
	      // create a clickable button with a roll query to select an entity from the loaded json

	      report(utils.toTitleCase(entityName) + ' Importer', '<a href="!shaped-import-' + entityName + ' --?{Pick a ' +
	        entityName + '|' + list.join('|') + '}">Click to select a ' + entityName + '</a>');
	    }
	    else {
	      reportError('Could not find any ' + entityNamePlural + '.<br/>Please ensure you have a properly formatted ' +
	        entityNamePlural + ' json file.');
	    }
	  };

	  this.addSpellsToCharacter = function (character, spells, noreport) {
	    var gender = roll20.getAttrByName(character.id, 'gender');

	    var defaultIndex = Math.min(myState.config.defaultGenderIndex, myState.config.genderPronouns.length);
	    var defaultPronounInfo = myState.config.genderPronouns[defaultIndex];
	    var pronounInfo = _.clone(_.find(myState.config.genderPronouns, function (pronounDetails) {
	        return new RegExp(pronounDetails.matchPattern, 'i').test(gender);
	      }) || defaultPronounInfo);

	    _.defaults(pronounInfo, defaultPronounInfo);


	    var importData = {
	      spells: srdConverter.convertSpells(spells, pronounInfo)
	    };
	    this.getImportDataWrapper(character).mergeImportData(importData);
	    if (!noreport) {
	      report('Import Success', 'Added the following spells:  <ul><li>' + _.map(importData.spells, function (spell) {
	          return spell.name;
	        }).join('</li><li>') + '</li></ul>');
	    }
	  };


	  this.monsterDataPopulator = function (character, monsterData) {
	    _.each(myState.config.newCharSettings, function (value, key) {
	      var attribute = roll20.getOrCreateAttr(character.id, configToAttributeLookup[key]);
	      attribute.set('current', _.isBoolean(value) ? (value ? 1 : 0) : value);
	    });

	    var converted = srdConverter.convertMonster(monsterData);
	    logger.debug('Converted monster data: $$$', converted);
	    var expandedSpells = converted.spells;
	    delete converted.spells;
	    this.getImportDataWrapper(character).setNewImportData({ npc: converted });
	    if (expandedSpells) {
	      this.addSpellsToCharacter(character, expandedSpells, true);
	    }
	    return character;

	  };

	  this.getTokenRetrievalStrategy = function (token) {
	    return function (name, errors) {
	      if (token) {
	        var character = roll20.getObj('character', token.get('represents'));
	        if (character && roll20.getAttrByName(character.id, 'locked')) {
	          errors.push('Character with name ' + character.get('name') + ' and id ' + character.id +
	            ' was locked and cannot be overwritten');
	          return null;
	        }
	        return character;
	      }
	    };
	  };

	  this.nameRetrievalStrategy = function (name, errors) {
	    var chars = roll20.findObjs({ type: 'character', name: name });
	    if (chars.length > 1) {
	      errors.push('More than one existing character found with name "' + name + '". Can\'t replace');
	    }
	    else {
	      if (chars[0] && roll20.getAttrByName(chars[0].id, 'locked')) {
	        errors.push('Character with name ' + chars[0].get('name') + ' and id ' + chars[0].id +
	          ' was locked and cannot be overwritten');
	        return null;
	      }
	      return chars[0];
	    }
	  };

	  this.creationRetrievalStrategy = function (name, errors) {
	    if (!_.isEmpty(roll20.findObjs({ type: 'character', name: name }))) {
	      errors.push('Can\'t create new character with name "' + name +
	        '" because one already exists with that name. Perhaps you want --replace?');
	    }
	    else {
	      return roll20.createObj('character', { name: name });
	    }
	  };

	  this.getAvatarCopier = function (token) {
	    return function (character) {
	      character.set('avatar', token.get('imgsrc'));
	    };
	  };

	  this.getTokenConfigurer = function (token) {
	    return function (character) {
	      token.set('represents', character.id);
	      token.set('name', character.get('name'));
	      var settings = myState.config.tokenSettings;
	      if (settings.number && token.get('name').indexOf('%%NUMBERED%%') === -1) {
	        token.set('name', token.get('name') + ' %%NUMBERED%%');
	      }

	      _.chain(settings)
	        .pick(['bar1', 'bar2', 'bar3'])
	        .each(function (bar, barName) {
	          if (!_.isEmpty(bar.attribute)) {
	            var attribute = roll20.getOrCreateAttr(character.id, bar.attribute);
	            if (attribute) {
	              token.set(barName + '_value', attribute.get('current'));
	              if (bar.max) {
	                token.set(barName + '_max', attribute.get('max'));
	              }
	              token.set('showplayers_' + barName, bar.showPlayers);
	              if (bar.link) {
	                token.set(barName + '_link', attribute.id);
	              }
	            }
	          }
	        });

	      // auras
	      _.chain(settings)
	        .pick(['aura1', 'aura2'])
	        .each(function (aura, auraName) {
	          token.set(auraName + '_radius', aura.radius);
	          token.set(auraName + '_color', aura.color);
	          token.set(auraName + '_square', aura.square);
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

	  this.getImportDataWrapper = function (character) {


	    return {
	      setNewImportData: function (importData) {
	        if (_.isEmpty(importData)) {
	          return;
	        }
	        roll20.setAttrByName(character.id, 'import_data', JSON.stringify(importData));
	        roll20.setAttrByName(character.id, 'import_data_present', 'on');
	      },
	      mergeImportData: function (importData) {
	        if (_.isEmpty(importData)) {
	          return;
	        }
	        var attr = roll20.getOrCreateAttr(character.id, 'import_data');
	        var dataPresentAttr = roll20.getOrCreateAttr(character.id, 'import_data_present');
	        var current = {};
	        try {
	          if (!_.isEmpty(attr.get('current').trim())) {
	            current = JSON.parse(attr.get('current'));
	          }
	        }
	        catch (e) {
	          logger.warn('Existing import_data attribute value was not valid JSON: [$$$]', attr.get('current'));
	        }
	        _.each(importData, function (value, key) {
	          var currentVal = current[key];
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

	      logWrap: 'importDataWrapper'
	    };
	  };

	  this.applyAdvantageTracker = function (options) {
	    var type = 'normal';
	    if (options.advantage) {
	      type = 'advantage';
	    }
	    else if (options.disadvantage) {
	      type = 'disadvantage';
	    }

	    at.setMarkers(type, at.buildResources(at.getSelectedCharacters(options.selected.character)));

	    //roll20.log('in AT listener');
	    //roll20.log(at.buildResources(at.getSelectedCharacters(options.selected.character)));
	  };

	  /////////////////////////////////////////////////
	  // Event Handlers
	  /////////////////////////////////////////////////
	  this.handleAddToken = function (token) {
	    var represents = token.get('represents');
	    if (_.isEmpty(represents)) {
	      return;
	    }
	    var character = roll20.getObj('character', represents);
	    if (!character) {
	      return;
	    }
	    addedTokenIds.push(token.id);

	    var wrappedChangeToken = this.wrapHandler(this.handleChangeToken);

	    //URGH. Thanks Roll20.
	    setTimeout((function (id) {
	      return function () {
	        var token = roll20.getObj('graphic', id);
	        if (token) {
	          wrappedChangeToken(token);
	        }
	      };
	    }(token.id)), 100);
	  };

	  this.handleChangeToken = function (token) {
	    at.updateToken(token);
	    if (_.contains(addedTokenIds, token.id)) {
	      addedTokenIds = _.without(addedTokenIds, token.id);
	      this.rollHPForToken(token);
	    }
	  };

	  this.getHPBar = function () {
	    return _.chain(myState.config.tokenSettings)
	      .pick('bar1', 'bar2', 'bar3')
	      .findKey({ attribute: 'HP' })
	      .value();
	  };

	  this.rollHPForToken = function (token) {
	    var hpBar = this.getHPBar();
	    logger.debug('HP bar is $$$', hpBar);
	    if (!hpBar || !myState.config.rollHPOnDrop) {
	      return;
	    }

	    var represents = token.get('represents');
	    if (!represents) {
	      return;
	    }
	    var character = roll20.getObj('character', represents);
	    if (!character) {
	      return;
	    }
	    var hpBarLink = token.get(hpBar + '_link');
	    if (hpBarLink) {
	      return;
	    }
	    // Guard against characters that aren't properly configured - i.e. ones used for templates and system
	    // things rather than actual characters
	    if (_.isEmpty(roll20.getAttrByName(character.id, 'hp_formula'))) {
	      logger.debug('Ignoring character $$$ for rolling HP - has no hp_formula attribute', character.get('name'));
	      return;
	    }

	    var self = this;
	    roll20.sendChat('', '%{' + character.get('name') + '|npc_hp}', function (results) {
	      if (results && results.length === 1) {
	        var message = self.processInlinerolls(results[0]);
	        if (!results[0].inlinerolls || !results[0].inlinerolls[0]) {
	          logger.warn('HP roll didn\'t have the expected structure. This is what we got back: $$$', results[0]);
	        }
	        else {
	          var total = results[0].inlinerolls[0].results.total;
	          roll20.sendChat('HP Roller', '/w GM &{template:5e-shaped} ' + message);
	          token.set(hpBar + '_value', total);
	          token.set(hpBar + '_max', total);
	        }
	      }
	    });
	  };


	  this.registerChatWatcher = function (handler, triggerFields) {
	    var matchers = [];
	    if (triggerFields && !_.isEmpty(triggerFields)) {
	      matchers.push(function (msg, options) {
	        return _.intersection(triggerFields, _.keys(options)).length === triggerFields.length;
	      });
	    }
	    chatWatchers.push({ matchers: matchers, handler: handler.bind(this) });
	  };

	  this.triggerChatWatchers = function (msg) {
	    var options = this.getRollTemplateOptions(msg);
	    _.each(chatWatchers, function (watcher) {
	      if (_.every(watcher.matchers, function (matcher) {
	          return matcher(msg, options);
	        })) {
	        watcher.handler(options, msg);
	      }
	    });
	  };

	  /**
	   *
	   * @param options
	   * @param {ChatMessage} msg
	   */
	  this.handleAmmo = function (options, msg) {

	    if (!roll20.getAttrByName(options.character.id, 'ammo_auto_use')) {
	      return;
	    }

	    var ammoAttr = _.chain(roll20.findObjs({ type: 'attribute', characterid: options.character.id }))
	      .filter(function (attribute) {
	        return attribute.get('name').indexOf('repeating_ammo') === 0;
	      })
	      .groupBy(function (attribute) {
	        return attribute.get('name').replace(/(repeating_ammo_[^_]+).*/, '$1');
	      })
	      .find(function (attributes) {
	        return _.find(attributes, function (attribute) {
	          return attribute.get('name').match(/.*name$/) && attribute.get('current') === options.ammoName;
	        });
	      })
	      .find(function (attribute) {
	        return attribute.get('name').match(/.*qty$/);
	      })
	      .value();

	    if (!ammoAttr) {
	      logger.error('No ammo attribute found corresponding to name $$$', options.ammoName);
	      return;
	    }

	    var ammoUsed = 1;
	    if (options.ammo) {
	      var rollRef = options.ammo.match(/\$\[\[(\d+)\]\]/);
	      if (rollRef) {
	        var rollExpr = msg.inlinerolls[rollRef[1]].expression;
	        var match = rollExpr.match(/\d+-(\d+)/);
	        if (match) {
	          ammoUsed = match[1];
	        }
	      }

	    }

	    var val = parseInt(ammoAttr.get('current'), 10) || 0;
	    ammoAttr.set('current', Math.max(0, val - ammoUsed));
	  };

	  this.handleHD = function (options, msg) {
	    var match = options.title.match(/(\d+)d(\d+) Hit Dice/);
	    if (match && myState.config.autoHD) {
	      var hdCount = match[1];
	      var hdSize = match[2];
	      var hdAttr = roll20.getAttrObjectByName(options.character.id, 'hd_d' + hdSize);
	      var hpAttr = roll20.getAttrObjectByName(options.character.id, 'HP');
	      var newHp = Math.min(parseInt(hpAttr.get('current')) + this.getRollValue(msg, options.roll1), hpAttr.get('max'));

	      if (hdAttr) {
	        if (hdCount <= hdAttr.get('current')) {
	          hdAttr.set('current', hdAttr.get('current') - hdCount);
	          hpAttr.set('current', newHp);
	        }
	        else {
	          report('HD Police', options.characterName + ' can\'t use ' + hdCount + 'd' + hdSize +
	            ' hit dice because they only have ' + hdAttr.get('current') + ' left');
	        }
	      }

	    }
	  };


	  this.handleDeathSave = function (options, msg) {

	    //TODO: Do we want to output text on death/recovery?
	    var increment = function (val) {
	      return ++val;
	    };
	    //TODO: Advantage?
	    if (roll20.getAttrByName(options.character.id, 'roll_setting') !== '@{roll_2}') {
	      var result = this.getRollValue(msg, options.roll1);
	      var attributeToIncrement = result >= 10 ? 'death_saving_throw_successes' : 'death_saving_throw_failures';
	      roll20.processAttrValue(options.character.id, attributeToIncrement, increment);
	    }

	  };

	  this.handleFX = function (options, msg) {
	    var parts = options.fx.split(' ');
	    if (parts.length < 2 || _.some(parts.slice(0, 2), _.isEmpty)) {
	      logger.warn('FX roll template variable is not formated correctly: [$$$]', options.fx);
	      return;
	    }


	    var fxType = parts[0],
	      pointsOfOrigin = parts[1],
	      targetTokenId,
	    //sourceTokenId,
	      sourceCoords = {},
	      targetCoords = {},
	      fxCoords = [],
	      pageId;

	    //noinspection FallThroughInSwitchStatementJS
	    switch (pointsOfOrigin) {
	      case 'sourceToTarget':
	      case 'source':
	        targetTokenId = parts[2]; //jshint ignore: line
	        fxCoords.push(sourceCoords, targetCoords);
	        break;
	      case 'targetToSource':
	      case 'target':
	        targetTokenId = parts[2];
	        fxCoords.push(targetCoords, sourceCoords);
	    }

	    if (targetTokenId) {
	      var targetToken = roll20.getObj('graphic', targetTokenId);
	      pageId = targetToken.get('_pageid');
	      targetCoords.x = targetToken.get('left');
	      targetCoords.y = targetToken.get('top');
	    }
	    else {
	      pageId = roll20.getCurrentPage(msg.playerid).id;
	    }


	    var casterTokens = roll20.findObjs({ type: 'graphic', pageid: pageId, represents: options.character.id });

	    if (casterTokens.length) {
	      //If there are multiple tokens for the character on this page, then try and find one of them that is selected
	      //This doesn't work without a selected token, and the only way we can get this is to use @{selected} which is a pain
	      //for people who want to launch without a token selected
	      // if(casterTokens.length > 1) {
	      //     var selected = _.findWhere(casterTokens, {id: sourceTokenId});
	      //     if (selected) {
	      //         casterTokens = [selected];
	      //     }
	      // }
	      sourceCoords.x = casterTokens[0].get('left');
	      sourceCoords.y = casterTokens[0].get('top');
	    }


	    if (!fxCoords[0]) {
	      logger.warn('Couldn\'t find required point for fx for character $$$, casterTokens: $$$, fxSpec: $$$ ', options.character.id, casterTokens, options.fx);
	      return;
	    }
	    else if (!fxCoords[1]) {
	      fxCoords = fxCoords.slice(0, 1);
	    }

	    roll20.spawnFx(fxCoords, fxType, pageId);
	  };

	  this.getRollValue = function (msg, rollOutputExpr) {
	    var rollIndex = rollOutputExpr.match(/\$\[\[(\d+)\]\]/)[1];
	    return msg.inlinerolls[rollIndex].results.total;
	  };

	  /**
	   *
	   * @returns {*}
	   */
	  this.getRollTemplateOptions = function (msg) {
	    if (msg.rolltemplate === '5e-shaped') {
	      var regex = /\{\{(.*?)\}\}/g;
	      var match;
	      var options = {};
	      while (!!(match = regex.exec(msg.content))) {
	        if (match[1]) {
	          var splitAttr = match[1].split('=');
	          var propertyName = splitAttr[0].replace(/_([a-z])/g, function (match, letter) {
	            return letter.toUpperCase();
	          });
	          options[propertyName] = splitAttr.length === 2 ? splitAttr[1] : '';
	        }
	      }
	      if (options.characterName) {
	        options.character = roll20.findObjs({
	          _type: 'character',
	          name: options.characterName
	        })[0];
	      }
	      return options;
	    }
	    return {};
	  };

	  this.processInlinerolls = function (msg) {
	    if (_.has(msg, 'inlinerolls')) {
	      return _.chain(msg.inlinerolls)
	        .reduce(function (previous, current, index) {
	          previous['$[[' + index + ']]'] = current.results.total || 0;
	          return previous;
	        }, {})
	        .reduce(function (previous, current, index) {
	          return previous.replace(index.toString(), current);
	        }, msg.content)
	        .value();
	    }
	    else {
	      return msg.content;
	    }
	  };

	  this.addAbility = function (options) {
	    if (_.isEmpty(options.abilities)) {
	      //TODO report some sort of error?
	      return;
	    }
	    var messages = _.map(options.selected.character, function (character) {

	      var operationMessages = _.chain(options.abilities)
	        .sortBy('sortKey')
	        .map(function (maker) {
	          return maker.run(character, options);
	        })
	        .value();


	      if (_.isEmpty(operationMessages)) {
	        return '<li>' + character.get('name') + ': Nothing to do</li>';
	      }

	      var message;
	      message = '<li>Configured the following abilities for character ' + character.get('name') + ':<ul><li>';
	      message += operationMessages.join('</li><li>');
	      message += '</li></ul></li>';

	      return message;
	    });

	    report('Ability Creation', '<ul>' + messages.join('') + '</ul>');

	  };

	  var getAbilityMaker = function (character) {
	    return function (abilitySpec) {
	      var ability = roll20.getOrCreateObj('ability', { characterid: character.id, name: abilitySpec.name });
	      ability.set({ action: abilitySpec.action, istokenaction: true }); //TODO configure this
	      return abilitySpec.name;
	    };
	  };

	  var abilityDeleter = {
	    run: function (character) {
	      var abilities = roll20.findObjs({ type: 'ability', characterid: character.id });
	      var deleted = _.map(abilities, function (obj) {
	        var name = obj.get('name');
	        obj.remove();
	        return name;
	      });

	      return 'Deleted: ' + (_.isEmpty(deleted) ? 'None' : deleted.join(', '));
	    },
	    sortKey: ''
	  };

	  var RepeatingAbilityMaker = function (repeatingSection, abilityName, label, canMark) {
	    this.run = function (character, options) {
	      options[`cache${repeatingSection}`] = options[`cache${repeatingSection}`] ||
	        roll20.getRepeatingSectionItemIdsByName(character.id, repeatingSection);

	      var configured = _.chain(options[`cache${repeatingSection}`])
	        .map(function (repeatingId, repeatingName) {
	          var repeatingAction = '%{' + character.get('name') + '|repeating_' + repeatingSection + '_' + repeatingId +
	            '_' + abilityName + '}';
	          if (canMark && options.mark) {
	            repeatingAction += '\n!mark @{target|token_id}';
	          }
	          return { name: utils.toTitleCase(repeatingName), action: repeatingAction };
	        })
	        .map(getAbilityMaker(character))
	        .value();
	      return label + (_.isEmpty(configured) ? ': Not present for character' : ': ' + configured.join(', '));

	    };
	    this.sortKey = 'originalOrder';
	  };

	  var RollAbilityMaker = function (abilityName, newName) {
	    this.run = function (character) {
	      return getAbilityMaker(character)({
	        name: newName,
	        action: '%{' + character.get('name') + '|' + abilityName + '}'
	      });
	    };
	    this.sortKey = 'originalOrder';
	  };

	  var staticAbilityOptions = {
	    DELETE: abilityDeleter,
	    initiative: new RollAbilityMaker('initiative', 'Init'),
	    abilitychecks: new RollAbilityMaker('ability_checks_macro', 'Ability Checks'),
	    abilitychecksquery: new RollAbilityMaker('ability_checks_query_macro', 'Ability Checks'),
	    abilchecks: new RollAbilityMaker('ability_checks_macro', 'AbilChecks'),
	    abilchecksquery: new RollAbilityMaker('ability_checks_query_macro', 'AbilChecks'),
	    savingthrows: new RollAbilityMaker('saving_throw_macro', 'Saving Throws'),
	    savingthrowsquery: new RollAbilityMaker('saving_throw_query_macro', 'Saving Throws'),
	    saves: new RollAbilityMaker('saving_throw_macro', 'Saves'),
	    savesquery: new RollAbilityMaker('saving_throw_query_macro', 'Saves'),
	    attacks: new RepeatingAbilityMaker('attack', 'attack', 'Attacks', true),
	    statblock: new RollAbilityMaker('statblock', 'Statblck'),
	    traits: new RepeatingAbilityMaker('trait', 'trait', 'Traits'),
	    'traits-macro': new RollAbilityMaker('traits_macro', 'Traits'),
	    actions: new RepeatingAbilityMaker('action', 'action', 'Actions', true),
	    'actions-macro': new RollAbilityMaker('actions_macro', 'Actions'),
	    reactions: new RepeatingAbilityMaker('reaction', 'action', 'Reactions'),
	    'reactions-macro': new RollAbilityMaker('reactions_macro', 'Reactions'),
	    legendaryactions: new RepeatingAbilityMaker('legendaryaction', 'action', 'Legendary Actions'),
	    'legendaryactions-macro': new RollAbilityMaker('legendaryactions_macro', 'Legendary Actions'),
	    legendarya: new RepeatingAbilityMaker('legendaryaction', 'action', 'LegendaryA'),
	    lairactions: new RollAbilityMaker('lairactions_macro', 'Lair Actions'),
	    laira: new RollAbilityMaker('lairactions_macro', 'LairA'),
	    regionaleffects: new RollAbilityMaker('regionaleffects_macro', 'Regional Effects'),
	    regionale: new RollAbilityMaker('regionaleffects_macro', 'RegionalE')
	  };

	  var abilityLookup = function (optionName, existingOptions) {
	    var maker = staticAbilityOptions[optionName];

	    //Makes little sense to add named spells to multiple characters at once
	    if (!maker && existingOptions.selected.character.length === 1) {

	      existingOptions.spellToRepeatingIdLookup = existingOptions.spellToRepeatingIdLookup ||
	        roll20.getRepeatingSectionItemIdsByName(existingOptions.selected.character[0].id, 'spell');

	      var repeatingId = existingOptions.spellToRepeatingIdLookup[optionName.toLowerCase()];
	      if (repeatingId) {
	        maker = new RollAbilityMaker('repeating_spell_' + repeatingId + '_spell', utils.toTitleCase(optionName));
	      }
	    }
	    return maker;
	  };


	  this.getCommandProcessor = function () {
	    return cp('shaped')
	      .addCommand('config', this.configure.bind(this))
	      .options(configOptionsSpec)
	      .option('atMenu', booleanValidator)
	      .option('tsMenu', booleanValidator)
	      .option('ncMenu', booleanValidator)
	      .addCommand('import-statblock', self.importStatblock.bind(self))
	      .option('overwrite', booleanValidator)
	      .option('replace', booleanValidator)
	      .withSelection({
	        graphic: {
	          min: 1,
	          max: Infinity
	        }
	      })
	      .addCommand(['import-monster', 'monster'], this.importMonstersFromJson.bind(this))
	      .option('all', booleanValidator)
	      .optionLookup('monsters', entityLookup.findEntity.bind(entityLookup, 'monsters'))
	      .option('overwrite', booleanValidator)
	      .option('replace', booleanValidator)
	      .withSelection({
	        graphic: {
	          min: 0,
	          max: 1
	        }
	      })
	      .addCommand(['import-spell', 'spell'], this.importSpellsFromJson.bind(this))
	      .optionLookup('spells', entityLookup.findEntity.bind(entityLookup, 'spells'))
	      .withSelection({
	        character: {
	          min: 1,
	          max: 1
	        }
	      })
	      .addCommand('at', this.applyAdvantageTracker.bind(this))
	      .option('advantage', booleanValidator)
	      .option('disadvantage', booleanValidator)
	      .option('normal', booleanValidator)
	      .withSelection({
	        character: {
	          min: 1,
	          max: Infinity
	        }
	      })
	      .addCommand('abilities', this.addAbility.bind(this))
	      .withSelection({
	        character: {
	          min: 1,
	          max: Infinity
	        }
	      })
	      .optionLookup('abilities', abilityLookup)
	      .option('mark', booleanValidator)
	      .addCommand('token-defaults', this.applyTokenDefaults.bind(this))
	      .withSelection({
	        graphic: {
	          min: 1,
	          max: Infinity
	        }
	      })
	      .end();
	  };

	  this.checkInstall = function () {
	    logger.info('-=> ShapedScripts v1.0.1 <=-');
	    if (myState.version !== schemaVersion) {
	      logger.info('  > Updating Schema to v$$$ from $$$<', schemaVersion, myState && myState.version);
	      logger.info('Preupgrade state: $$$', myState);
	      //noinspection FallThroughInSwitchStatementJS
	      switch (myState && myState.version) {
	        case 0.1:
	        case 0.2:
	        case 0.3:
	          _.extend(myState.config.genderPronouns, utils.deepClone(configDefaults.genderPronouns)); //jshint ignore: line
	        case 0.4:
	        case 0.5:
	        case 0.6:
	        case 0.7:
	        case 0.8:
	        case 0.9:
	          _.defaults(myState.config, utils.deepClone(configDefaults));
	          _.defaults(myState.config.tokenSettings, utils.deepClone(configDefaults.tokenSettings));
	          _.defaults(myState.config.newCharSettings, utils.deepClone(configDefaults.newCharSettings));
	          _.defaults(myState.config.advTrackerSettings, utils.deepClone(configDefaults.advTrackerSettings));
	          myState.version = schemaVersion;
	          break;
	        default:
	          if (!myState.version) {
	            _.defaults(myState, {
	              version: schemaVersion,
	              config: utils.deepClone(configDefaults)
	            });
	            logger.info('Making new state object $$$', myState);
	          }
	          else {
	            logger.error('Unknown schema version for state $$$', myState);
	            reportError('Serious error attempting to upgrade your global state, please see log for details. ' +
	              'ShapedScripts will not function correctly until this is fixed');
	            myState = undefined;
	          }
	          break;
	      }
	      logger.info('Upgraded state: $$$', myState);
	    }
	  };

	  this.wrapHandler = function (handler) {
	    var self = this;
	    return function () {
	      try {
	        handler.apply(self, arguments);
	      }
	      catch (e) {
	        if (typeof e === 'string' || e instanceof parseModule.ParserError) {
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

	  this.registerEventHandlers = function () {
	    roll20.on('chat:message', this.wrapHandler(this.handleInput));
	    roll20.on('add:token', this.wrapHandler(this.handleAddToken));
	    roll20.on('change:token', this.wrapHandler(this.handleChangeToken));
	    roll20.on('change:attribute', this.wrapHandler(function (msg) {
	      if (msg.get('name') === 'roll_setting') {
	        at.updateSetting(msg);
	      }
	    }));
	    this.registerChatWatcher(this.handleDeathSave, ['deathSavingThrow', 'character', 'roll1']);
	    this.registerChatWatcher(this.handleAmmo, ['ammoName', 'character']);
	    this.registerChatWatcher(this.handleFX, ['fx', 'character']);
	    this.registerChatWatcher(this.handleHD, ['character', 'title']);
	  };

	  logger.wrapModule(this);
	}

	ShapedScripts.prototype.logWrap = 'ShapedScripts';







/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var _ = __webpack_require__(2);

	/* jshint camelcase : false */
	function getRenameMapper(newName) {
	  return function (key, value, output) {
	    output[newName] = value;
	  };
	}

	var identityMapper = function (key, value, output) {
	    output[key] = value;
	  },
	  booleanMapper = function (key, value, output) {
	    if (value) {
	      output[key] = 'Yes';
	    }
	  },
	  camelCaseFixMapper = function (key, value, output) {
	    var newKey = key.replace(/[A-Z]/g, function (letter) {
	      return '_' + letter.toLowerCase();
	    });
	    output[newKey] = value;
	  },
	  castingStatMapper = function (key, value, output) {
	    if (value) {
	      output.add_casting_modifier = 'Yes';
	    }
	  },
	  componentMapper = function (key, value, output) {
	    output.components = _.chain(value)
	      .map(function (value, key) {
	        if (key !== 'materialMaterial') {
	          return key.toUpperCase().slice(0, 1);
	        }
	        else {
	          output.materials = value;
	        }

	      })
	      .compact()
	      .value()
	      .join(' ');
	  },
	  saveAttackMappings = {
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
	    castingStat: castingStatMapper
	  };

	function getObjectMapper(mappings) {
	  return function (key, value, output) {
	    _.each(value, function (propVal, propName) {
	      var mapper = mappings[propName];
	      if (!mapper) {
	        throw 'Unrecognised property when attempting to convert to srd format: [' + propName + '] ' +
	        JSON.stringify(output);
	      }
	      mapper(propName, propVal, output);
	    });
	  };
	}

	var spellMapper = getObjectMapper({
	  name: identityMapper,
	  duration: identityMapper,
	  level: getRenameMapper('spell_level'),
	  school: identityMapper,
	  emote: identityMapper,
	  range: identityMapper,
	  castingTime: camelCaseFixMapper,
	  target: identityMapper,
	  description: function (key, value, output) {
	    output.content = value + (output.content ? '\n' + output.content : '');
	  },
	  higherLevel: function (key, value, output) {
	    output.content = (output.content ? output.content + '\n' : '') + value;
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
	    bonus: getRenameMapper('heal_bonus')
	  }),
	  components: componentMapper,
	  prepared: function (key, value, output) {
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
	  patrons: _.noop
	});


	var monsterMapper = getObjectMapper({
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
	  spells: function (key, value, output) {
	    var splitSpells = _.partition(value, _.isObject);
	    if (!_.isEmpty(splitSpells[1])) {
	      output.spells_srd = splitSpells[1].join(', ');
	    }
	    if (!_.isEmpty(splitSpells[0])) {
	      output.spells = splitSpells[0];
	      _.each(output.spells, function (spell) {
	        spell.prepared = true;
	      });
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
	  lairActions: identityMapper
	});

	var pronounTokens = {
	  '{{GENDER_PRONOUN_HE_SHE}}': 'nominative',
	  '{{GENDER_PRONOUN_HIM_HER}}': 'accusative',
	  '{{GENDER_PRONOUN_HIS_HER}}': 'possessive',
	  '{{GENDER_PRONOUN_HIMSELF_HERSELF}}': 'reflexive'
	};


	module.exports = {

	  convertMonster: function (npcObject) {

	    var output = {};
	    monsterMapper(null, npcObject, output);

	    var actionTraitTemplate = _.template('**<%=data.name%><% if(data.recharge) { print(" (" + data.recharge + ")") } %>**: <%=data.text%>', { variable: 'data' });
	    var legendaryTemplate = _.template('**<%=data.name%><% if(data.cost && data.cost > 1){ print(" (Costs " + data.cost + " actions)") }%>**: <%=data.text%>', { variable: 'data' });
	    var lairRegionalTemplate = function (item) {
	      return '**' + item;
	    };

	    var simpleSectionTemplate = _.template('<%=data.title%>\n<% print(data.items.join("\\n")); %>', { variable: 'data' });
	    var legendarySectionTemplate = _.template('<%=data.title%>\nThe <%=data.name%> can take <%=data.legendaryPoints%> legendary actions, ' +
	      'choosing from the options below. It can take only one legendary action at a time and only at the end of another creature\'s turn.' +
	      ' The <%=data.name%> regains spent legendary actions at the start of its turn.\n<% print(data.items.join("\\n")) %>', { variable: 'data' });
	    var regionalSectionTemplate = _.template('<%=data.title%>\n<% print(data.items.join("\\n")); %>\n**<%=data.regionalEffectsFade%>', { variable: 'data' });

	    var srdContentSections = [
	      { prop: 'traits', itemTemplate: actionTraitTemplate, sectionTemplate: simpleSectionTemplate },
	      { prop: 'actions', itemTemplate: actionTraitTemplate, sectionTemplate: simpleSectionTemplate },
	      { prop: 'reactions', itemTemplate: actionTraitTemplate, sectionTemplate: simpleSectionTemplate },
	      { prop: 'legendaryActions', itemTemplate: legendaryTemplate, sectionTemplate: legendarySectionTemplate },
	      { prop: 'lairActions', itemTemplate: lairRegionalTemplate, sectionTemplate: simpleSectionTemplate },
	      { prop: 'regionalEffects', itemTemplate: lairRegionalTemplate, sectionTemplate: regionalSectionTemplate }
	    ];

	    var makeDataObject = function (propertyName, itemList) {
	      return {
	        title: propertyName.replace(/([A-Z])/g, ' $1').replace(/^[a-z]/, function (letter) {
	          return letter.toUpperCase();
	        }),
	        name: output.character_name,
	        legendaryPoints: output.legendaryPoints,
	        regionalEffectsFade: output.regionalEffectsFade,
	        items: itemList
	      };
	    };

	    output.is_npc = 1;
	    output.edit_mode = 'off';

	    output.content_srd = _.chain(srdContentSections)
	      .map(function (sectionSpec) {
	        var items = output[sectionSpec.prop];
	        delete output[sectionSpec.prop];
	        return _.map(items, sectionSpec.itemTemplate);
	      })
	      .map(function (sectionItems, sectionIndex) {
	        var sectionSpec = srdContentSections[sectionIndex];
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


	  convertSpells: function (spellObjects, pronounInfo) {

	    return _.map(spellObjects, function (spellObject) {
	      var converted = {};
	      spellMapper(null, spellObject, converted);
	      if (converted.emote) {
	        _.each(pronounTokens, function (pronounType, token) {
	          var replacement = pronounInfo[pronounType];
	          converted.emote = converted.emote.replace(token, replacement);
	        });
	      }
	      return converted;
	    });

	  }
	  /* jshint camelcase : true */
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(2);
	var roll20 = __webpack_require__(1);
	var utils = __webpack_require__(7);


	var getParser = function (optionString, validator) {
	  'use strict';
	  return function (arg, errors, options) {
	    var argParts = arg.split(/\s+/);
	    if (argParts[0].toLowerCase() === optionString.toLowerCase()) {
	      if (argParts.length <= 2) {
	        //Allow for bare switches
	        var value = argParts.length === 2 ? argParts[1] : true;
	        var result = validator(value);
	        if (result.valid) {
	          options[argParts[0]] = result.converted;
	        }
	        else {
	          errors.push('Invalid value [' + value + '] for option [' + argParts[0] + ']');
	        }
	      }
	      return true;
	    }
	    return false;
	  };
	};

	var getObjectParser = function (specObject) {
	  'use strict';
	  return function (arg, errors, options) {
	    var argParts = arg.split(/\s+/);
	    var newObject = utils.createObjectFromPath(argParts[0], argParts.slice(1).join(' '));

	    var comparison = { spec: specObject, actual: newObject };
	    while (comparison.spec) {
	      var key = _.keys(comparison.actual)[0];
	      var spec = comparison.spec[key];
	      if (!spec) {
	        return false;
	      }
	      if (_.isFunction(comparison.spec[key])) {
	        var result = comparison.spec[key](comparison.actual[key]);
	        if (result.valid) {
	          comparison.actual[key] = result.converted;
	          utils.deepExtend(options, newObject);
	        }
	        else {
	          errors.push('Invalid value [' + comparison.actual[key] + '] for option [' + argParts[0] + ']');
	        }
	        return true;
	      }
	      else if (_.isArray(comparison.actual[key])) {
	        var newVal = [];
	        newVal[comparison.actual[key].length - 1] = comparison.spec[key][0];
	        comparison.spec = newVal;
	        comparison.actual = comparison.actual[key];
	      }
	      else {
	        comparison.spec = comparison.spec[key];
	        comparison.actual = comparison.actual[key];
	      }
	    }
	  };
	};

	/**
	 * @constructor
	 */
	function Command(root, handler) {
	  'use strict';
	  this.root = root;
	  this.handler = handler;
	  this.parsers = [];
	}


	Command.prototype.option = function (optionString, validator) {
	  'use strict';
	  if (_.isFunction(validator)) {
	    this.parsers.push(getParser(optionString, validator));
	  }
	  else if (_.isObject(validator)) {
	    var dummy = {};
	    dummy[optionString] = validator;
	    this.parsers.push(getObjectParser(dummy));
	  }
	  else {
	    throw new Error('Bad validator [' + validator + '] specified for option ' + optionString);
	  }

	  return this;
	};

	Command.prototype.options = function (optsSpec) {
	  'use strict';
	  var self = this;
	  _.each(optsSpec, function (validator, key) {
	    self.option(key, validator);
	  });
	  return this;
	};

	Command.prototype.optionLookup = function (groupName, lookup) {
	  'use strict';
	  if (typeof lookup !== 'function') {
	    lookup = _.propertyOf(lookup);
	  }
	  this.parsers.push(function (arg, errors, options) {
	    options[groupName] = options[groupName] || [];
	    var someMatch = false;
	    var resolved = lookup(arg, options);
	    if (resolved) {
	      options[groupName].push(resolved);
	      someMatch = true;
	    }
	    else {
	      _.each(arg.split(','), function (name) {
	        var resolved = lookup(name.trim(), options);
	        if (resolved) {
	          options[groupName].push(resolved);
	          someMatch = true;
	        }
	      });
	    }
	    return someMatch;
	  });
	  return this;
	};

	Command.prototype.handle = function (args, selection) {
	  'use strict';
	  var self = this;
	  var options = { errors: [] };
	  options.selected = this.selectionSpec && processSelection(selection || [], this.selectionSpec);
	  options = _.reduce(args, function (options, arg) {
	    var parser = _.find(self.parsers, function (parser) {
	      return parser(arg, options.errors, options);
	    });
	    if (!parser) {
	      options.errors.push('Unrecognised or poorly formed option ' + arg);
	    }

	    return options;
	  }, options);
	  if (options.errors.length > 0) {
	    throw options.errors.join('\n');
	  }
	  delete options.errors;
	  this.handler(options);
	};

	Command.prototype.withSelection = function (selectionSpec) {
	  'use strict';
	  this.selectionSpec = selectionSpec;
	  return this;
	};


	Command.prototype.addCommand = function (cmdString, handler) {
	  'use strict';
	  return this.root.addCommand(cmdString, handler);
	};

	Command.prototype.end = function () {
	  'use strict';
	  return this.root;
	};


	function processSelection(selection, constraints) {
	  'use strict';
	  return _.reduce(constraints, function (result, constraintDetails, type) {

	    var objects = _.chain(selection)
	      .where({ _type: type === 'character' ? 'graphic' : type })
	      .map(function (selected) {
	        return roll20.getObj(selected._type, selected._id);
	      })
	      .map(function (object) {
	        if (type === 'character' && object) {
	          var represents = object.get('represents');
	          if (represents) {
	            return roll20.getObj('character', represents);
	          }
	        }
	        return object;
	      })
	      .compact()
	      .value();
	    if (_.size(objects) < constraintDetails.min || _.size(objects) > constraintDetails.max) {
	      throw 'Wrong number of objects of type [' + type + '] selected, should be between ' + constraintDetails.min +
	      ' and ' + constraintDetails.max;
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

	module.exports = function (rootCommand) {
	  'use strict';

	  var commands = {};
	  return {
	    addCommand: function (cmds, handler) {
	      var command = new Command(this, handler);
	      _.each(_.isArray(cmds) ? cmds : [cmds], cmdString => commands[cmdString] = command);
	      return command;
	    },

	    processCommand: function (msg) {
	      var prefix = '!' + rootCommand + '-';
	      if (msg.type === 'api' && msg.content.indexOf(prefix) === 0) {
	        var cmdString = msg.content.slice(prefix.length);
	        var parts = cmdString.split(/\s+--/);
	        var cmdName = parts.shift();
	        var cmd = commands[cmdName];
	        if (!cmd) {
	          throw 'Unrecognised command ' + prefix + cmdName;
	        }
	        cmd.handle(parts, msg.selected);
	      }
	    }

	  };


	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var _ = __webpack_require__(2);

	var levelStrings = ['Cantrips ', '1st level ', '2nd level ', '3rd level '];
	_.each(_.range(4, 10), function (level) {
	  levelStrings[level] = level + 'th level ';
	});

	var spellcastingHandler = {
	  splitRegex: /(Cantrips|(?:1st|2nd|3rd|[4-9]th)\s*level)\.?\s*\(([^\)]+)\)\s*:/i,

	  makeLevelDetailsObject: function (match) {
	    var levelMatch = match[1].match(/\d/);
	    return {
	      level: levelMatch ? parseInt(levelMatch[0]) : 0,
	      slots: match[2]
	    };
	  },

	  setLevelDetailsString: function (levelDetails) {
	    levelDetails.newText = levelStrings[levelDetails.level] + '(' + levelDetails.slots + '): ';
	    levelDetails.newText += levelDetails.spells.join(', ');
	  }

	};

	var innateHandler = {
	  splitRegex: /(At\s?will|\d\s?\/\s?day)(?:\s?each)?\s?:/i,

	  makeLevelDetailsObject: function (match) {
	    var usesMatch = match[1].match(/\d/);
	    return {
	      uses: usesMatch ? parseInt(usesMatch[0]) : 0,
	      slots: match[2]
	    };
	  },

	  setLevelDetailsString: function (levelDetails) {
	    levelDetails.newText = levelDetails.uses === 0 ? 'At will' : levelDetails.uses + '/day';
	    if (levelDetails.spells.length > 1) {
	      levelDetails.newText += ' each';
	    }
	    levelDetails.newText += ': ';
	    levelDetails.newText += levelDetails.spells.join(', ');
	  }

	};


	function processSpellcastingTrait(monster, traitName, traitHandler, entityLookup) {
	  var trait = _.findWhere(monster.traits, { name: traitName });
	  if (trait) {
	    var spellList = trait.text.substring(trait.text.indexOf(':') + 1).replace('\n', ' ');
	    var castingDetails = trait.text.substring(0, trait.text.indexOf(':'));
	    var levelDetails = [];
	    var match;
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

	    var hasCastBeforeCombat = false;
	    var spellDetailsByLevel = _.chain(levelDetails)
	      .each(function (levelDetails) {
	        levelDetails.spells = _.chain(levelDetails.spells.replace(',*', '*,').split(','))
	          .map(_.partial(_.result, _, 'trim'))
	          .map(function (spellName) {
	            var match = spellName.match(/([^\(\*]+)(?:\(([^\)]+)\))?(\*)?/);
	            hasCastBeforeCombat = hasCastBeforeCombat || !!match[3];
	            return {
	              name: match[1].trim(),
	              restriction: match[2],
	              castBeforeCombat: !!match[3],
	              toString: function () {
	                return this.name +
	                  (this.restriction ? ' (' + this.restriction + ')' : '') +
	                  (this.castBeforeCombat ? '*' : '');
	              },
	              toSpellArrayItem: function () {
	                return this.name;
	              }
	            };
	          })
	          .each(function (spell) {
	            spell.object = entityLookup.findEntity('spells', spell.name, true);
	            if (spell.object) {
	              spell.name = spell.object.name;
	              spell.toSpellArrayItem = function () {
	                return this.object;
	              };
	            }
	          })
	          .value();
	      })
	      .each(traitHandler.setLevelDetailsString)
	      .value();


	    trait.text = castingDetails + ':\n' + _.pluck(spellDetailsByLevel, 'newText').join('\n');
	    if (hasCastBeforeCombat) {
	      trait.text += '\n* The ' + monster.name.toLowerCase() + ' casts these spells on itself before combat.';
	    }
	    var spells = _.chain(spellDetailsByLevel)
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


	module.exports = function (monsters, entityLookup) {
	  _.each(monsters, function (monster) {
	    processSpellcastingTrait(monster, 'Spellcasting', spellcastingHandler, entityLookup);
	    processSpellcastingTrait(monster, 'Innate Spellcasting', innateHandler, entityLookup);
	  });
	};



/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var _ = __webpack_require__(2);
	var roll20 = __webpack_require__(1);
	var utils = __webpack_require__(7);

	var advantageMarker = 'green',
	  disadvantageMarker = 'red';

	var ignoreNpc = false;

	class AdvantageTracker {

	  constructor(logger, myState) {
	    this.logger = logger;
	    this.myState = myState;
	  }

	  getSelectedCharacters(selected) {
	    return _.chain(selected)
	      .map(function (s) {
	        return s.get('_id');
	      })
	      .value();
	  }

	  updateSetting(msg) {
	    this.logger.debug('AT: Updating Setting');
	    var br, setting, isAdvantage, isDisadvantage,
	      char = [];
	    char.push(msg.get('_characterid'));
	    br = this.buildResources(_.uniq(_.union(char)));
	    setting = msg.get('current');
	    isAdvantage = '@{roll_advantage}' === setting;
	    isDisadvantage = '@{roll_disadvantage}' === setting;

	    if (this.myState.config.advTrackerSettings.showMarkers) {
	      _.each(br[0].tokens, function (t) {
	        t.set('status_' + disadvantageMarker, isDisadvantage);
	        t.set('status_' + advantageMarker, isAdvantage);
	      });
	    }
	  }

	  updateToken(token) {
	    this.logger.debug('AT: Updating New Token');
	    if (!this.myState.config.advTrackerSettings.showMarkers) {
	      return;
	    }

	    var character, setting, isAdvantage, isDisadvantage;

	    if (token.get('represents') === '') {
	      return;
	    }

	    character = roll20.getObj('character', token.get('represents'));
	    setting = roll20.getAttrByName(character.id, 'roll_setting');
	    isAdvantage = '@{roll_advantage}' === setting;
	    isDisadvantage = '@{roll_disadvantage}' === setting;

	    if (ignoreNpc) {
	      if (roll20.getAttrByName(character.id, 'is_npc') === '1') {
	        return;
	      }
	    }

	    token.set('status_' + disadvantageMarker, isDisadvantage);
	    token.set('status_' + advantageMarker, isAdvantage);
	  }

	  buildResources(ids) {
	    return _.chain(ids)
	      .map(function (cid) {
	        return roll20.getObj('character', cid);
	      })
	      .reject(_.isUndefined)
	      //.filter(this.npcCheckFunc)
	      .map(function (c) {
	        return {
	          character: c,
	          tokens: roll20.filterObjs(function (o) {
	            return 'graphic' === o.get('_type') &&
	              c.id === o.get('represents');
	          })
	        };
	      })
	      .value();
	  }

	  setAttribute(options) {
	    if (!options.current && options.current !== '') {
	      roll20.log('Error setting empty value: ');// + name);
	      return;
	    }

	    var attr = roll20.findObjs({
	      _type: 'attribute',
	      _characterid: options.characterId,
	      name: options.name
	    })[0];

	    if (!attr) {
	      roll20.createObj('attribute', {
	        name: options.name,
	        current: options.current,
	        characterid: options.characterId
	      });
	    }
	    else if (!attr.get('current') || attr.get('current').toString() !== options.current) {
	      attr.set({
	        current: options.current
	      });
	    }
	  }

	  setMarkers(type, resources) {
	    var self = this;

	    var setting,
	      rollInfo = '',
	      preroll = '',
	      postroll = '',
	      valByType = {
	        normal: '@{roll_1}',
	        advantage: '@{roll_advantage}',
	        disadvantage: '@{roll_disadvantage}',
	        roll2: '@{roll_2}'
	      },
	      msgByType = {
	        normal: 'normally',
	        advantage: 'with advantage',
	        disadvantage: 'with disadvantage',
	        roll2: 'two dice'
	      },

	      isAdvantage = 'advantage' === type,
	      isDisadvantage = 'disadvantage' === type;

	    _.each(resources, function (r) {
	      if (self.myState.config.advTrackerSettings.showMarkers) {
	        _.each(r.tokens, function (t) {
	          t.set('status_' + disadvantageMarker, isDisadvantage);
	          t.set('status_' + advantageMarker, isAdvantage);
	        });
	      }

	      setting = roll20.getAttrByName(r.character.get('_id'), 'roll_setting');
	      if (setting === valByType[type]) {
	        return;
	      }

	      self.setAttribute({
	        characterId: r.character.get('_id'),
	        name: 'roll_setting',
	        current: valByType[type]
	      });

	      if (valByType[type] === '@{roll_advantage}') {
	        rollInfo = '{{advantage=1}}';
	        preroll = 2;
	        postroll = 'kh1';
	      }
	      if (valByType[type] === '@{roll_disadvantage}') {
	        rollInfo = '{{disadvantage=1}}';
	        preroll = 2;
	        postroll = 'kl1';
	      }
	      self.setAttribute({
	        characterId: r.character.get('_id'),
	        name: 'roll_info',
	        current: rollInfo
	      });
	      self.setAttribute({
	        characterId: r.character.get('_id'),
	        name: 'preroll',
	        current: preroll
	      });
	      self.setAttribute({
	        characterId: r.character.get('_id'),
	        name: 'postroll',
	        current: postroll
	      });

	      //if (chatOptions(who) === 'disabled') {
	      //    return;
	      //}

	      roll20.sendChat('AdvantageTracker',
	        ' &{template:5e-shaped} {{character_name=' + r.character.get('name') + '}} @{' + r.character.get('name') +
	        '|show_character_name} {{title=' + utils.toTitleCase(type) + '}} {{text_top=' + r.character.get('name') +
	        ' is rolling ' + msgByType[type] + '!}}');
	    });
	  }
	}

	module.exports = AdvantageTracker;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var _ = __webpack_require__(2);
	var utils = __webpack_require__(7);

	class ConfigUi {

	  ////////////
	  // Menus
	  ////////////
	  getConfigOptionsAll(config, optionsSpec) {
	    return this.getConfigOptionGroupAdvTracker(config, optionsSpec) +
	      this.getConfigOptionGroupTokens(config, optionsSpec) +
	      this.getConfigOptionGroupNewCharSettings(config, optionsSpec);

	  }

	  getConfigOptionsMenu() {
	    var optionRows = this.makeOptionRow('Advantage Tracker', 'atMenu', '', 'view', '', '#02baf2') +
	      this.makeOptionRow('Token Defaults', 'tsMenu', '', 'view', '', '#02baf2') +
	      this.makeOptionRow('New Characters', 'ncMenu', '', 'view', '', '#02baf2');

	    var th = utils.buildHTML('th', 'Main Menu', { colspan: '2' });
	    var tr = utils.buildHTML('tr', th, { style: 'margin-top: 5px;' });

	    return utils.buildHTML('table', tr + optionRows, { style: 'width: 100%; font-size: 0.9em;' });
	  }

	  getConfigOptionGroupAdvTracker(config, optionsSpec) {
	    var optionRows = this.makeToggleSetting(config, 'advTrackerSettings.showMarkers', 'Show Markers');

	    var th = utils.buildHTML('th', 'Advantage Tracker Options', { colspan: '2' });
	    var tr = utils.buildHTML('tr', th, { style: 'margin-top: 5px;' });
	    var table = utils.buildHTML('table', tr + optionRows, { style: 'width: 100%; font-size: 0.9em;' });

	    return table + this.backToMainMenuButton();
	  }

	  getConfigOptionGroupTokens(config, optionsSpec) {
	    var auraButtonWidth = 60;


	    var ts = 'tokenSettings';

	    var retVal = '<table style="width: 100%; font-size: 0.9em;">' +
	      '<tr style="margin-top: 5px;"><th colspan=2>Token Options</th></tr>' +
	      this.makeToggleSetting(config, `${ts}.number`, 'Numbered Tokens') +
	      this.makeToggleSetting(config, `${ts}.showName`, 'Show Name Tag') +
	      this.makeToggleSetting(config, `${ts}.showNameToPlayers`, 'Show Name to Players');

	    for (var i = 1; i <= 3; i++) {
	      retVal += this.makeInputSetting(config, `${ts}.bar${i}.attribute`, `Bar ${i} Attribute`, `Bar ${i} Attribute (empty to unset)`);
	      retVal += this.makeToggleSetting(config, `${ts}.bar${i}.max`, `Bar ${i} Set Max`);
	      retVal += this.makeToggleSetting(config, `${ts}.bar${i}.link`, `Bar ${i} Link`);
	      retVal += this.makeToggleSetting(config, `${ts}.bar${i}.showPlayers`, `Bar ${i} Show Players`);
	    }

	    // Build out the aura grids
	    for (i = 1; i <= 2; i++) {
	      var currRad = utils.getObjectFromPath(config, `${ts}.aura${i}.radius`);
	      var currRadEmptyHint = currRad ? currRad : '[not set]';
	      var currColor = utils.getObjectFromPath(config, `${ts}.aura${i}.color`);
	      var currSquare = utils.getObjectFromPath(config, `${ts}.aura${i}.square`);

	      var radBtn = this.makeOptionButton(`${ts}.aura${i}.radius`, `?{Aura ${i} Radius (empty to unset)|${currRad}}`,
	        this.makeText(currRadEmptyHint), 'click to edit', currRadEmptyHint === '[not set]' ? '#f84545' : '#02baf2',
	        undefined, auraButtonWidth);
	      var colorBtn = this.makeOptionButton('tokenSettings.aura' + i + '.color',
	        '?{Aura ' + i + ' Color (hex colors)' + '|' + currColor + '}',
	        this.makeText(currColor), 'click to edit', currColor, utils.getContrastYIQ(currColor), auraButtonWidth);
	      var squareBtn = this.makeOptionButton('tokenSettings.aura' + i + '.square', !currSquare,
	        this.makeBoolText(currSquare), 'click to toggle', currSquare ? '#65c4bd' : '#f84545',
	        undefined, auraButtonWidth);

	      retVal += utils.buildHTML('tr', [
	        {
	          tag: 'td', innerHtml: [
	          {
	            tag: 'table', innerHtml: [
	            {
	              tag: 'tr',
	              innerHtml: [{ tag: 'th', innerHtml: 'Aura ' + i, attrs: { colspan: 3 } }]
	            },
	            {
	              tag: 'tr',
	              innerHtml: [
	                {
	                  tag: 'td',
	                  innerHtml: 'Range'
	                },
	                {
	                  tag: 'td',
	                  innerHtml: 'Color'
	                },
	                {
	                  tag: 'td',
	                  innerHtml: 'Square'
	                }
	              ]
	            },
	            {
	              tag: 'tr',
	              innerHtml: [
	                {
	                  tag: 'td',
	                  innerHtml: radBtn
	                },
	                {
	                  tag: 'td',
	                  innerHtml: colorBtn
	                },
	                {
	                  tag: 'td',
	                  innerHtml: squareBtn
	                }
	              ]
	            }
	          ],
	            attrs: { style: 'width: 100%; text-align: center;' }
	          }
	        ], attrs: { colspan: '2' }
	        }
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

	    retVal += '</table>' + this.backToMainMenuButton();

	    return retVal;
	  }

	  getConfigOptionGroupNewCharSettings(config, optionsSpec) {
	    var optionRows = this.makeQuerySetting(config, 'newCharSettings.sheetOutput', 'Sheet Output',
	        optionsSpec.newCharSettings.sheetOutput()) +
	      this.makeQuerySetting(config, 'newCharSettings.deathSaveOutput',
	        'Death Save Output', optionsSpec.newCharSettings.deathSaveOutput()) +
	      this.makeQuerySetting(config, 'newCharSettings.initiativeOutput', 'Initiative Output',
	        optionsSpec.newCharSettings.initiativeOutput()) +
	      this.makeToggleSetting(config, 'newCharSettings.showNameOnRollTemplate', 'Show Name on Roll Template',
	        optionsSpec.newCharSettings.showNameOnRollTemplate()) +
	      this.makeQuerySetting(config, 'newCharSettings.rollOptions', 'Roll Options',
	        optionsSpec.newCharSettings.rollOptions()) +
	      this.makeQuerySetting(config, 'newCharSettings.initiativeRoll', 'Init Roll',
	        optionsSpec.newCharSettings.initiativeRoll()) +
	      this.makeToggleSetting(config, 'newCharSettings.initiativeToTracker', 'Init To Tracker',
	        optionsSpec.newCharSettings.initiativeToTracker()) +
	      this.makeToggleSetting(config, 'newCharSettings.breakInitiativeTies', 'Break Init Ties',
	        optionsSpec.newCharSettings.breakInitiativeTies()) +
	      this.makeToggleSetting(config, 'newCharSettings.showTargetAC', 'Show Target AC',
	        optionsSpec.newCharSettings.showTargetAC()) +
	      this.makeToggleSetting(config, 'newCharSettings.showTargetName', 'Show Target Name',
	        optionsSpec.newCharSettings.showTargetName()) +
	      this.makeToggleSetting(config, 'newCharSettings.autoAmmo', 'Auto Use Ammo',
	        optionsSpec.newCharSettings.autoAmmo());

	    var th = utils.buildHTML('th', 'New Character Sheets', { colspan: '2' });
	    var tr = utils.buildHTML('tr', th, { style: 'margin-top: 5px;' });
	    var table = utils.buildHTML('table', tr + optionRows, { style: 'width: 100%; font-size: 0.9em;' });

	    return table + this.backToMainMenuButton();
	  }

	  backToMainMenuButton() {
	    return utils.buildHTML('a', 'back to main menu', {
	      href: '!shaped-config',
	      style: 'text-align: center; margin: 5px 0 0 0; padding: 2px 2px ; border-radius: 10px; white-space: nowrap; ' +
	      'overflow: hidden; text-overflow: ellipsis; background-color: #02baf2; border-color: #c0c0c0;'
	    });
	  }

	  makeInputSetting(config, path, title, prompt) {
	    var currentVal = utils.getObjectFromPath(config, path);
	    var emptyHint = '[not set]';
	    if (currentVal) {
	      emptyHint = currentVal;
	    }

	    return this.makeOptionRow(title, path, `?{${prompt}|${currentVal}}`, emptyHint, 'click to edit', emptyHint ===
	    '[not set]' ? '#f84545' : '#02baf2');
	  }

	  //noinspection JSUnusedGlobalSymbols
	  makeColorSetting(config, path, title, prompt) {
	    var currentVal = utils.getObjectFromPath(config, path);
	    var emptyHint = '[not set]';

	    if (currentVal) {
	      emptyHint = currentVal;
	    }

	    var buttonColor = emptyHint === '[not set]' ? '#02baf2' : currentVal;

	    // return this.makeOptionRow(title, path, '?{' + prompt + '|' + currentVal + '}', emptyHint, 'click to edit', buttonColor, utils.getContrastYIQ(buttonColor));
	    return this.makeOptionRow(title, path, `?{${prompt}|${currentVal}}`, emptyHint, 'click to edit', buttonColor, utils.getContrastYIQ(buttonColor));
	  }

	  makeToggleSetting(config, path, title, optionsSpec) {
	    var currentVal = utils.getObjectFromPath(config, path);
	    if (optionsSpec) {
	      currentVal = _.invert(optionsSpec)[currentVal] === 'true';
	    }

	    return this.makeOptionRow(title, path, !currentVal,
	      this.makeBoolText(currentVal), 'click to toggle', currentVal ? '#65c4bd' : '#f84545');
	  }

	  makeQuerySetting(config, path, title, optionsSpec) {
	    var currentVal = _.invert(optionsSpec)[utils.getObjectFromPath(config, path)];
	    var optionList = _.keys(optionsSpec);

	    // move the current option to the front of the list
	    optionList.splice(optionList.indexOf(currentVal), 1);
	    optionList.unshift(currentVal);

	    // return this.makeOptionRow(title, path, '?{' + title + '|' + optionList.join('|') + '}', this.makeText(currentVal), 'click to change', '#02baf2');
	    return this.makeOptionRow(title, path, `?{${title}|${optionList.join('|')}}`, this.makeText(currentVal), 'click to change', '#02baf2');
	  }

	  makeOptionRow(optionTitle, path, command, linkText, tooltip, buttonColor, buttonTextColor) {
	    var col1 = utils.buildHTML('td', optionTitle);
	    var col2 = utils.buildHTML('td', this.makeOptionButton(path, command, linkText, tooltip, buttonColor, buttonTextColor),
	      { style: 'text-align:right;' });

	    return utils.buildHTML('tr', col1 + col2, { style: 'border: 1px solid gray;' });
	  }

	  makeOptionButton(path, command, linkText, tooltip, buttonColor, buttonTextColor, width) {
	    if (_.isUndefined(width)) {
	      width = 80;
	    }

	    var css = `text-align: center; width: ${width}px; margin: 5px 0 0 0; ` +
	      `padding: 2px 2px ; border-radius: 10px; border-color: #c0c0c0;` +
	      `white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background-color: ${buttonColor};`;
	    if (buttonTextColor) {
	      css += `color: ${buttonTextColor}`; // 'color: ' + buttonTextColor + '; ';
	    }

	    return utils.buildHTML('a', linkText, {
	      style: css,
	      href: `!shaped-config --${path} ${command}` //'!shaped-config --' + path + ' ' + command
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
	}

	module.exports = ConfigUi;


/***/ },
/* 16 */
/***/ function(module, exports) {

	function sanitise(statblock, logger) {
	  'use strict';

	  statblock = statblock
	    .replace(/\s+([\.,;:])/g, '$1')
	    .replace(/\n+/g, '#')
	    .replace(/–/g, '-')
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
	    .replace(/#/g, '\n');

	  logger.debug('First stage cleaned statblock: $$$', statblock);

	  //Sometimes the texts ends up like 'P a r a l y z i n g T o u c h . M e l e e S p e l l A t t a c k : + 1 t o h i t
	  //In this case we can fix the title case stuff, because we can find the word boundaries. That will at least meaning
	  //that the core statblock parsing will work. If this happens inside the lowercase body text, however, there's nothing
	  //we can do about it because you need to understand the natural language to reinsert the word breaks properly.
	  statblock = statblock.replace(/([A-Z])(\s[a-z]){2,}/g, function (match, p1) {
	    return p1 + match.slice(1).replace(/\s([a-z])/g, '$1');
	  });


	  //Conversely, sometimes words get mushed together. Again, we can only fix this for title case things, but that's
	  //better than nothing
	  statblock = statblock.replace(/([A-Z][a-z]+)(?=[A-Z])/g, '$1 ');

	  //This covers abilites that end up as 'C O N' or similar
	  statblock = statblock.replace(/^[A-Z]\s?[A-Z]\s?[A-Z](?=\s|$)/mg, function (match) {
	    return match.replace(/\s/g, '');
	  });

	  statblock = statblock.replace(/^[A-Z ]+$/m, function (match) {
	    return match.replace(/([A-Z])([A-Z]+)(?=\s|$)/g, function (match, p1, p2) {
	      return p1 + p2.toLowerCase();
	    });
	  });


	  statblock = statblock.replace(/(\d+)\s*?plus\s*?((?:\d+d\d+)|(?:\d+))/gi, '$2 + $1');
	  var replaceObj = {
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
	    'spe ll': 'spell'
	  };
	  var re = new RegExp(Object.keys(replaceObj).join('|'), 'g');
	  statblock = statblock.replace(re, function (matched) {
	    return replaceObj[matched];
	  });

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


/***/ }
/******/ ]);