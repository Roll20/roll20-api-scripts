// ChatSetAttr version 1.1.2
// Last Updated: 2016-11-8
// A script to create, modify, or delete character attributes from the chat area or macros.
// If you don't like my choices for --replace, you can edit the replacers variable at your own peril to change them.
var chatSetAttr = chatSetAttr || (function () {
	'use strict';
	const version = '1.1.2',
		schemaVersion = 1,
		replacers = [
			['<', '[', /</g, /\[/g],
			['>', ']', />/g, /\]/g],
			['#', '|', /#/g, /\|/g],
			['~', '-', /\~/g, /\-/g],
			[';', '?', /\;/g, /\?/g],
			['`', '@', /`/g, /@/g]
		],
		checkInstall = function () {
			log(`-=> ChatSetAttr v${version} <=-`);
			if (!_.has(state, 'ChatSetAttr') || state.ChatSetAttr.version !== schemaVersion) {
				log(` > Updating ChatSetAttr Schema to v${schemaVersion} <`);
				state.ChatSetAttr = {
					version: schemaVersion,
					globalconfigCache: {
						lastsaved: 0
					},
					playersCanModify: false
				};
			}
			checkGlobalConfig();
		},
		checkGlobalConfig = function () {
			let s = state.ChatSetAttr,
				g = globalconfig && globalconfig.chatsetattr;
			if (g && g.lastsaved && g.lastsaved > s.globalconfigCache.lastsaved) {
				log(' > Updating ChatSetAttr from Global Config < [' +
					(new Date(g.lastsaved * 1000)) + ']');
				s.playersCanModify = 'playersCanModify' === g['Players can modify all characters'];
				s.globalconfigCache = globalconfig.chatsetattr;
			}
		},
		handleErrors = function (who, errors) {
			if (errors.length) {
				let output = `/w "${who}" <div style="border: 1px solid black;` +
					`background-color: #FFBABA; padding: 3px 3px;">` +
					`<h4>Errors</h4><p>${errors.join('</p><p>')}</p></div>`;
				sendChat('ChatSetAttr', output);
				errors.splice(0, errors.length);
			}
		},
		showConfig = function (who) {
			let output = `/w "${who}" <div style="border: 1px solid black;` +
				'background-color: #FFFFFF; padding: 3px 3px;">' +
				'<b>ChatSetAttr Configuration</b><div style="padding-left:10px;">' +
				'<p><i>!setattr-config</i> can be invoked in the following format: </p>' +
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">' +
				'!setattr-config --option</pre>' +
				'<p>There is currently one configuration option:</p>' +
				'<div style="padding-left: 10px;padding-right:20px"><ul>' +
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">' +
				'<div style="float:right;width:40px;border:1px solid' +
				' black;background-color:#ffc;text-align:center;">' +
				(state.ChatSetAttr.playersCanModify ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>') +
				'</div><b><span style="font-family: serif;">players-can-modify</span></b> ' +
				htmlReplace('-') + ' Determines if players can use <i>--name</i> and ' +
				'<i>--charid</i> to change attributes of characters they do not control.' +
				' Specifying this option toggles the current setting</li></ul> </div>' +
				getConfigOption_playersCanModify() + '</div></div>';
			sendChat('ChatSetAttr', output)
		},
		getConfigOption_playersCanModify = function () {
			let text = (state.ChatSetAttr.playersCanModify ?
				'<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' :
				'<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>'
			);
			return '<div>playersCanModify is currently ' + text +
				'<a href="!setattr-config --players-can-modify">Toggle</a></div>';
		},
		getPlayerName = function (who) {
			let match = who.match(/(.*) \(GM\)/);
			return (match) ? (match[1] || 'GM') : who;
		},
		getCharNameById = function (id) {
			let character = getObj('character', id);
			return (character) ? character.get('name') : '';
		},
		escapeRegExp = function (str) {
			return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		},
		htmlReplace = function (str) {
			let entities = {
				'<': 'lt',
				'>': 'gt',
				"'": '#39',
				'@': '#64',
				'{': '#123',
				'|': '#124',
				'}': '#125',
				'[': '#91',
				']': '#93',
				'"': 'quot',
				'-': 'mdash',
				' ': 'nbsp'
			};
			return _.chain(str.split(''))
				.map(c => (_.has(entities, c)) ? ('&' + entities[c] + ';') : c)
				.value()
				.join('');
		},
		processInlinerolls = function (msg) {
			// Input:	msg - chat message
			// Output:	msg.content, with all inline rolls evaluated
			if (_.has(msg, 'inlinerolls')) {
				return _.chain(msg.inlinerolls)
					.reduce(function (previous, current, index) {
						previous['$[[' + index + ']]'] = current.results.total || 0;
						return previous;
					}, {})
					.reduce(function (previous, current, index) {
						return previous.replace(index, current);
					}, msg.content)
					.value();
			} else {
				return msg.content;
			}
		},
		getCIKey = function (obj, name) {
			let nameLower = name.toLowerCase(),
				result = false;
			_.each(obj, function (v, k) {
				if (k.toLowerCase() === nameLower) {
					result = k;
				}
			});
			return result;
		},
		// Getting attributes from parsed options. Repeating attributes need special treatment
		// in order to parse row index and not create defective repeating rows.
		addRepeatingAttributes = function (list, attrNames, allAttrs, errors, createMissing, failSilently) {
			let indexMatch, attrNameSplit, id, name, repSectionIdsLower, realRepName,
				repeatingTypeStart, allSectionAttrs, repSectionIds, rowNum, rowId, idMatch;
			_.each(attrNames, function (attrName) {
				indexMatch = attrName.match(/_\$(\d+)_/);
				allSectionAttrs = {}, repSectionIds = {}, repSectionIdsLower = {};
				_.each(list, charid => allSectionAttrs[charid] = {});
				if (indexMatch) {
					rowNum = parseInt(indexMatch[1]);
					attrNameSplit = attrName.split(indexMatch[0]);
				} else {
					idMatch = attrName.match(/_(-[-A-Za-z0-9]+?|\d+)_/);
					if (idMatch) {
						rowId = idMatch[1].toLowerCase();
						attrNameSplit = attrName.split(idMatch[0]);
					} else {
						errors.push(`Could not understand repeating attribute` +
							` name ${attrName}.`);
						return;
					}
				}
				repeatingTypeStart = new RegExp('^' + escapeRegExp(attrNameSplit[0]) +
					'_(-[-A-Za-z0-9]+?|\\d+)_', 'i');
				filterObjs(function (o) {
					if (o.get('_type') === 'attribute') {
						id = o.get('_characterid');
						name = o.get('name');
						if (_.contains(list, id) && name.search(repeatingTypeStart) !== -1) {
							allSectionAttrs[id][name] = o;
							return true;
						}
					}
				});
				_.each(list, function (charid) {
					repSectionIds[charid] = _.chain(allSectionAttrs[charid])
						.map((o, n) => n.match(repeatingTypeStart))
						.compact()
						.map(a => a[1])
						.uniq()
						.value();
					if (!indexMatch) {
						repSectionIdsLower[charid] = _.map(repSectionIds[charid],
							n => n.toLowerCase());
					}
				});
				_.each(list, function (charid) {
					if (indexMatch && !_.isUndefined(repSectionIds[charid][rowNum])) {
						realRepName = attrNameSplit[0] + '_' + repSectionIds[charid][rowNum] +
							'_' + attrNameSplit[1];
					} else if (!indexMatch && _.contains(repSectionIdsLower[charid], rowId)) {
						realRepName = attrNameSplit[0] + '_' +
							repSectionIds[charid][_.indexOf(repSectionIdsLower[charid], rowId)] +
							'_' + attrNameSplit[1];
					} else if (indexMatch) {
						errors.push(`Row number ${rowNum} invalid for` +
							` character ${getCharNameById(charid)}` +
							` and repeating section ${attrNameSplit[0]}.`);
						return;
					} else {
						errors.push(`Repeating section id ${rowId} invalid for` +
							` character ${getCharNameById(charid)}` +
							` and repeating section ${attrNameSplit[0]}.`);
						return;
					}
					let nameCI = getCIKey(allSectionAttrs[charid], realRepName);
					if (nameCI) {
						allAttrs[charid][attrName] = allSectionAttrs[charid][nameCI];
					} else if (createMissing) {
						allAttrs[charid][attrName] = createObj('attribute', {
							characterid: charid,
							name: realRepName
						});
					} else if (!failSilently) {
						errors.push(`Missing attribute ${realRepName} not created` +
							` for character ${getCharNameById(charid)}.`);
					}
				});
			});
			return allAttrs;
		},
		addStandardAttributes = function (list, attrNames, allAttrs, errors, createMissing, failSilently) {
			let attrNamesUpper = attrNames.map(x => x.toUpperCase()),
				name, id;
			filterObjs(function (o) {
				if (o.get('_type') === 'attribute') {
					id = o.get('_characterid');
					name = o.get('name');
					if (_.contains(list, id) && _.contains(attrNamesUpper, name.toUpperCase())) {
						allAttrs[id][attrNames[_.indexOf(attrNamesUpper, name.toUpperCase())]] = o;
						return true;
					}
				}
			});
			_.each(list, function (charid) {
				_.each(_.difference(attrNames, _.keys(allAttrs[charid])), function (key) {
					if (createMissing) {
						allAttrs[charid][key] = createObj('attribute', {
							characterid: charid,
							name: key
						});
					} else if (!failSilently) {
						errors.push(`Missing attribute ${key} not created for` +
							` character ${getCharNameById(charid)}.`);
					}
				});
			});
		},
		getAllAttributes = function (list, attrNames, errors, createMissing, failSilently) {
			let allAttrs = {},
				attrNamesRepeating = _.filter(attrNames, str => (str.search(/^repeating_/) !== -1));
			_.each(list, charid => allAttrs[charid] = {});
			addStandardAttributes(list, _.difference(attrNames, attrNamesRepeating), allAttrs,
				errors, createMissing, failSilently);
			addRepeatingAttributes(list, attrNamesRepeating, allAttrs, errors, createMissing, failSilently);
			return allAttrs;
		},
		// Setting attributes happens in a delayed recursive way to prevent the sandbox
		// from overheating.
		delayedSetAttributes = function (who, list, setting, errors, allAttrs, fillInAttrs, opts) {
			let cList = _.clone(list),
				feedback = [],
				dWork = function (charid) {
					setCharAttributes(charid, setting, errors, feedback, allAttrs[charid],
						fillInAttrs, opts);
					if (cList.length) {
						_.delay(dWork, 50, cList.shift());
					} else {
						handleErrors(who, errors);
						(opts.silent) ? null: sendFeedback(who, feedback);
					}
				}
			dWork(cList.shift());
		},
		setCharAttributes = function (charid, setting, errors, feedback, attrs, fillInAttrs, opts) {
			let charFeedback = {};
			_.each(attrs, function (attr, attrName) {
				let attrNew = (fillInAttrs[attrName]) ?
					_.mapObject(setting[attrName], v => fillInAttrValues(charid, v)) : _.clone(setting[attrName]);
				if (opts.evaluate) {
					try {
						attrNew = _.mapObject(attrNew, function (v) {
							let parsed = eval(v);
							if (!_.isNaN(parsed) && !_.isUndefined(parsed)) {
								return parsed.toString();
							} else return v;
						});
					} catch (err) {
						errors.push(`Something went wrong with --evaluate` +
							` for the character ${getCharNameById(charid)}.` +
							` You were warned. The error message was: ${err}.`);
					}
				}
				if (opts.mod || opts.modb) {
					_.each(attrNew, function (v, k) {
						let moddedValue = parseFloat(v) + parseFloat(attr.get(k) || '0');
						if (!_.isNaN(moddedValue)) {
							if (opts.modb && k === 'current') {
								moddedValue = Math.min(Math.max(moddedValue, 0),
									parseFloat(attr.get('max') || Infinity));
							}
							attrNew[k] = moddedValue.toString();
						} else {
							delete attrNew[k];
							let type = (k === 'max') ? 'maximum ' : '';
							errors.push(`Attribute ${type}${attrName} is not number-valued` +
								` for character ${getCharNameById(charid)}.` +
								` Attribute ${type}left unchanged.`);
						}
					});
				}
				charFeedback[attrName] = attrNew;
				attr.set(attrNew);
			});
			// Feedback
			if (!opts.silent) {
				charFeedback = _.chain(charFeedback)
					.map(function (o, k) {
						if (!_.isUndefined(o.max) && !_.isUndefined(o.current))
							return `${k} to ${htmlReplace(o.current) || '<i>(empty)</i>'} / ${htmlReplace(o.max) || '<i>(empty)</i>'}`;
						else if (!_.isUndefined(o.current)) return `${k} to ${htmlReplace(o.current) || '<i>(empty)</i>'}`;
						else if (!_.isUndefined(o.max)) return `${k} to ${htmlReplace(o.max) || '<i>(empty)</i>'} (max)`;
						else return null;
					})
					.compact()
					.value();
				if (!_.isEmpty(charFeedback)) {
					feedback.push(`Setting ${charFeedback.join(', ')} for` +
						` character ${getCharNameById(charid)}.`);
				} else {
					feedback.push(`Nothing to do for character` +
						` ${getCharNameById(charid)}.`);
				}
			}
			return;
		},
		fillInAttrValues = function (charid, expression) {
			let match = expression.match(/%(\S.*?)(?:_(max))?%/),
				replacer;
			while (match) {
				replacer = getAttrByName(charid, match[1], match[2] || 'current') || '';
				expression = expression.replace(/%(\S.*?)(?:_(max))?%/, replacer);
				match = expression.match(/%(\S.*?)(?:_(max))?%/);
			}
			return expression;
		},
		deleteAttributes = function (who, allAttrs, silent) {
			let feedback = {};
			_.each(allAttrs, function (charAttrs, charid) {
				feedback[charid] = [];
				_.each(charAttrs, function (attr, name) {
					attr.remove();
					feedback[charid].push(name);
				});
			});
			silent ? null : sendDeleteFeedback(who, feedback);
		},
		//  These functions parse the chat input.
		parseOpts = function (content, hasValue) {
			// Input:	content - string of the form command --opts1 --opts2  value --opts3.
			//					values come separated by whitespace.
			//			hasValue - array of all options which come with a value
			// Output:	object containing key:true if key is not in hasValue. and containing
			//			key:value otherwise
			let opts = {};
			let args = _.rest(content.replace(/<br\/>\n/g, ' ')
				.replace(/\s*$/g, '')
				.replace(/({{(.*?)\s*}}$)/g, '$2')
				.split(/\s+--/));
			_.each(args, function (arg) {
				let kv = arg.split(/\s(.+)/);
				if (_.contains(hasValue, kv[0])) {
					opts[kv[0]] = kv[1];
				} else {
					opts[arg] = true;
				}
			});
			return opts;
		},
		parseAttributes = function (args, replace, fillInAttrs) {
			// Input:	args - array containing comma-separated list of strings, every one of which contains
			//			an expression of the form key|value or key|value|maxvalue
			//			replace - true if characters from the replacers array should be replaced
			// Output:	Object containing key|value for all expressions.
			let setting = _.chain(args)
				.map(str => str.split('').reverse().join('')
					.split(/\s*\|(?!\\)\s*/g).reverse()
					.map(str => str.split('').reverse().join('')))
				.reject(a => a.length === 0)
				.map(arr => _.map(arr, str => str.replace(/\\\|/g, '|')))
				.map(readAttribute)
				.reduce(function (p, c) {
					p[c[0]] = _.extend(p[c[0]] || {}, c[1])
					return p;
				}, {})
				.value();
			if (replace) {
				setting = _.mapObject(setting, function (obj) {
					return _.mapObject(obj, function (str) {
						_.each(replacers, function (rep) {
							str = str.replace(rep[2], rep[1]);
						});
						return str;
					});
				});
			}
			_.extend(fillInAttrs, _.mapObject(setting, obj =>
				(obj.current && obj.current.search(/%(\S.*?)(?:_(max))?%/) !== -1) ||
				(obj.max && obj.max.search(/%(\S.*?)(?:_(max))?%/) !== -1)
			));
			return setting;
		},
		readAttribute = function (arr) {
			let value = {};
			if (arr.length < 3 || arr[1] !== '') {
				value.current = arr[1] || '';
			}
			if (arr.length > 2) {
				value.max = arr[2];
			}
			return [arr[0], _.mapObject(value, str => str.replace(/^'(.*)'$/, '$1'))];
		},
		// These functions are used to get a list of character ids from the input,
		// and check for permissions.
		checkPermissions = function (list, errors, playerid) {
			let control, character;
			_.each(list, function (id, k) {
				character = getObj('character', id);
				if (character) {
					control = character.get('controlledby').split(/,/);
					if (!(state.ChatSetAttr.playersCanModify || playerIsGM(playerid) || _.contains(control, 'all') || _.contains(control, playerid))) {
						list[k] = null;
						errors.push(`Permission error for character ${character.get('name')}.`);
					}
				} else {
					errors.push(`Invalid character id ${id}.`);
					list[k] = null;
				}
			});
			return _.compact(list);
		},
		getIDsFromTokens = function (selected) {
			return _.chain(selected)
				.map(obj => getObj('graphic', obj._id))
				.compact()
				.map(token => token.get('represents'))
				.compact()
				.filter(id => getObj('character', id))
				.uniq()
				.value();
		},
		getIDsFromNames = function (charNames, errors, playerid) {
			let charIDList = _.chain(charNames.split(/\s*,\s*/))
				.map(n => [n, findObjs({
					type: 'character',
					name: n
				}, {
					caseInsensitive: true
				})[0]])
				.each(function (arr) {
					_.isUndefined(arr[1]) ? errors.push('No character named' +
						` ${arr[0]} found.`) : null;
				})
				.map(arr => arr[1])
				.compact()
				.map(c => c.id)
				.uniq()
				.value();
			return checkPermissions(charIDList, errors, playerid);
		},
		getIDsFromList = function (charid, errors, playerid) {
			return checkPermissions(_.uniq(charid.split(/\s*,\s*/)), errors, playerid);
		},
		sendFeedback = function (who, feedback) {
			let output = `/w "${who}" <div style="border: 1px solid black; background-color:` +
				' #FFFFFF; padding: 3px 3px;"><h3>Setting attributes</h3><p>' +
				(feedback.join('<br>') || 'Nothing to do.') + '</p></div>';
			sendChat('ChatSetAttr', output);
		},
		sendDeleteFeedback = function (who, feedback) {
			let output = `/w "${who}" <div style="border: 1px solid black; background-color:` +
				' #FFFFFF; padding: 3px 3px;"><h3>Deleting attributes</h3><p>';
			output += _.chain(feedback)
				.omit(arr => _.isEmpty(arr))
				.map(function (arr, charid) {
					return `Deleting attribute(s) ${arr.join(', ')} for character` +
						` ${getCharNameById(charid)}.`;
				})
				.join('<br>')
				.value() || 'Nothing to do.';
			output += '</p></div>';
			sendChat('ChatSetAttr', output);
		},
		// Main function, called after chat message input
		handleInput = function (msg) {
			if (msg.type !== 'api') {
				return;
			}
			let mode = msg.content.match(/^!(set|del)attr\b(?:-|\s|$)(config)?/);
			if (mode && mode[2]) {
				if (playerIsGM(msg.playerid)) {
					let opts = parseOpts(msg.content, []);
					if (opts['players-can-modify']) {
						state.ChatSetAttr.playersCanModify = !state.ChatSetAttr.playersCanModify;
					}
					showConfig(getPlayerName(msg.who));
				}
			} else if (mode) {
				// Parsing input
				let charIDList = [],
					fillInAttrs = {},
					errors = [];
				const hasValue = ['charid', 'name'],
					optsArray = ['all', 'allgm', 'charid', 'name', 'silent', 'sel',
						'replace', 'nocreate', 'mod', 'modb', 'evaluate'
					],
					who = getPlayerName(msg.who),
					opts = parseOpts(processInlinerolls(msg), hasValue),
					setting = parseAttributes(_.chain(opts).omit(optsArray).keys().value(),
						opts.replace, fillInAttrs),
					deleteMode = (mode[1] === 'del');
				if (opts.evaluate && !playerIsGM(msg.playerid)) {
					errors.push('The --evaluate option is only available to the GM.');
					delete opts.evaluate;
				}
				// Get list of character IDs
				if (opts.all && playerIsGM(msg.playerid)) {
					charIDList = _.map(findObjs({
						_type: 'character'
					}), c => c.id);
				} else if (opts.allgm && playerIsGM(msg.playerid)) {
					charIDList = _.chain(findObjs({
							_type: 'character'
						}))
						.filter(c => c.get('controlledby') === '')
						.map(c => c.id)
						.value();
				} else if (opts.charid) {
					charIDList = getIDsFromList(opts.charid, errors, msg.playerid);
				} else if (opts.name) {
					charIDList = getIDsFromNames(opts.name, errors, msg.playerid);
				} else if (opts.sel) {
					charIDList = getIDsFromTokens(msg.selected);
				} else {
					errors.push('You need to supply one of --all, --allgm, --sel,' +
						' --charid, or --name.');
				}
				if (_.isEmpty(charIDList)) {
					errors.push('No target characters.');
				}
				if (_.isEmpty(setting)) {
					errors.push('No attributes supplied.');
				}
				// Get attributes
				let allAttrs = getAllAttributes(charIDList, _.keys(setting), errors, !opts.nocreate && !deleteMode, deleteMode);
				handleErrors(who, errors);
				// Set or delete attributes
				if (!_.isEmpty(charIDList) && !_.isEmpty(setting)) {
					if (deleteMode) {
						deleteAttributes(who, allAttrs, opts.silent);
					} else {
						delayedSetAttributes(who, charIDList, setting, errors, allAttrs,
							fillInAttrs, _.pick(opts, optsArray));
					}
				}
			}
			return;
		},
		registerEventHandlers = function () {
			on('chat:message', handleInput);
		};
	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());
on('ready', function () {
	'use strict';
	chatSetAttr.CheckInstall();
	chatSetAttr.RegisterEventHandlers();
});
