// ChatSetAttr version 1.2
// Last Updated: 2017-01-18
// A script to create, modify, or delete character attributes from the chat area or macros.
// If you don't like my choices for --replace, you can edit the replacers variable at your own peril to change them.
var chatSetAttr = chatSetAttr || (function () {
	'use strict';
	const version = '1.2',
		schemaVersion = 3,
		replacers = [
			['<', '[', /</g, /\[/g],
			['>', ']', />/g, /\]/g],
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
					playersCanModify: false,
					playersCanEvaluate: false,
					useWorkers: true
				};
			}
			checkGlobalConfig();
		},
		isDef = function (value) {
			return !_.isUndefined(value);
		},
		getWhisperPrefix = function (playerid) {
			let player = getObj('player', playerid);
			if (player && player.get('_displayname')) {
				return '/w "' + player.get('_displayname') + '" ';
			} else {
				return '/w GM ';
			}
		},
		setAttribute = function (attr, value) {
			state.ChatSetAttr.useWorkers ? attr.setWithWorker(value) : attr.set(value);
		},
		checkGlobalConfig = function () {
			let s = state.ChatSetAttr,
				g = globalconfig && globalconfig.chatsetattr;
			if (g && g.lastsaved && g.lastsaved > s.globalconfigCache.lastsaved) {
				log(' > Updating ChatSetAttr from Global Config < [' +
					(new Date(g.lastsaved * 1000)) + ']');
				s.playersCanModify = 'playersCanModify' === g['Players can modify all characters'];
				s.playersCanEvaluate = 'playersCanEvaluate' === g['Players can use --evaluate'];
				s.useWorkers = 'useWorkers' === g['Trigger sheet workers when setting attributes'];
				s.globalconfigCache = globalconfig.chatsetattr;
			}
		},
		handleErrors = function (whisper, errors) {
			if (errors.length) {
				let output = whisper + '<div style="border:1px solid black;' +
					`background-color:#FFBABA;padding:3px"><h4>Errors</h4>` +
					`<p>${errors.join('<br>')}</p></div>`;
				sendChat('ChatSetAttr', output);
				errors.splice(0, errors.length);
			}
		},
		showConfig = function (whisper) {
			let optionsText = _.map([{
				name: 'playersCanModify',
				command: 'players-can-modify',
				desc: 'Determines if players can use <i>--name</i> and <i>--charid</i> to ' +
					'change attributes of characters they do not control.'
			}, {
				name: 'playersCanEvaluate',
				command: 'players-can-evaluate',
				desc: 'Determines if players can use the <i>--evaluate</i> option. <b>' +
					'Be careful</b> in giving players access to this option, because ' +
					'it potentially gives players access to your full API sandbox.'
			}, {
				name: 'useWorkers',
				command: 'use-workers',
				desc: 'Determines if setting attributes should trigger sheet worker operations.'
			}], getConfigOptionText).join('');
			let output = whisper + '<div style="border: 1px solid black; background-color: #FFFFFF;' +
				'padding:3px;"><b>ChatSetAttr Configuration</b><div style="padding-left:10px;">' +
				'<p><i>!setattr-config</i> can be invoked in the following format: </p><pre style="' +
				'white-space:normal;word-break:normal;word-wrap:normal;">!setattr-config --option</pre>' +
				'<p>Specifying an option toggles the current setting. There are currently two' +
				' configuration options:</p>' + optionsText + '</div></div>';
			sendChat('ChatSetAttr', output);
		},
		getConfigOptionText = function (o) {
			let button = (state.ChatSetAttr[o.name] ?
				'<span style="color:red;font-weight:bold;padding:0px 4px;">ON</span>' :
				'<span style="color:#999999;font-weight:bold;padding:0px 4px;">OFF</span>'
			);
			return '<div style="padding-left:10px;padding-right:20px"><ul>' +
				'<li style="border-top:1px solid #ccc;border-bottom:1px solid #ccc;">' +
				'<div style="float:right;width:40px;border:1px solid black;' +
				`background-color:#ffc;text-align:center;">${button}</div><b>` +
				`<span style="font-family: serif;">${o.command}</span></b>${htmlReplace('-')}` +
				`${o.desc}</li></ul></div><div><b>${o.name}</b> is currently ${button}` +
				`<a href="!setattr-config --${o.command}">Toggle</a></div>`;
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
			};
			return _.chain(str.split(''))
				.map(c => (_.has(entities, c)) ? ('&' + entities[c] + ';') : c)
				.value()
				.join('');
		},
		processInlinerolls = function (msg) {
			if (_.has(msg, 'inlinerolls')) {
				return _.chain(msg.inlinerolls)
					.reduce(function (m, v, k) {
						let ti = _.reduce(v.results.rolls, function (m2, v2) {
							if (_.has(v2, 'table')) {
								m2.push(_.reduce(v2.results, function (m3, v3) {
									m3.push(v3.tableItem.name);
									return m3;
								}, []).join(', '));
							}
							return m2;
						}, []).join(', ');
						m['$[[' + k + ']]'] = (ti.length && ti) || v.results.total || 0;
						return m;
					}, {})
					.reduce((m, v, k) => m.replace(k, v), msg.content)
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
		generateUUID = function () {
			"use strict";
			var a = 0,
				b = [];
			return function () {
				var c = (new Date()).getTime() + 0,
					d = c === a;
				a = c;
				for (var e = new Array(8), f = 7; 0 <= f; f--) {
					e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
					c = Math.floor(c / 64);
				}
				c = e.join("");
				if (d) {
					for (f = 11; 0 <= f && 63 === b[f]; f--) {
						b[f] = 0;
					}
					b[f]++;
				} else {
					for (f = 0; 12 > f; f++) {
						b[f] = Math.floor(64 * Math.random());
					}
				}
				for (f = 0; 12 > f; f++) {
					c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
				}
				return c;
			};
		}(),
		generateRowID = function () {
			"use strict";
			return generateUUID().replace(/_/g, "Z");
		},
		// Getting attributes from parsed options. Repeating attributes need special treatment
		// in order to parse row index and not create defective repeating rows.
		addRepeatingAttributes = function (list, attrNames, allAttrs, errors, createMissing, failSilently) {
			let allRepAttrs = {},
				repRowIds = {},
				repRowIdsLo = {},
				rowsToCreate = [],
				repSections = [],
				repOrders = {};
			// Read attribute names, determine row number or id or creation of new row.
			let attrNamesRead = _.reduce(attrNames, function (prev, attrName) {
				let match = attrName.match(/_(\$\d+|-[-A-Za-z0-9]+?|\d+)_/);
				if (match && match[1][0] === '$') {
					prev[attrName] = {
						rowNum: parseInt(match[1].slice(1))
					};
				} else if (match) {
					prev[attrName] = {
						rowIdLo: match[1].toLowerCase()
					};
				} else {
					errors.push(`Could not understand repeating attribute` +
						` name ${attrName}.`);
					return;
				}
				prev[attrName]['sName'] = attrName.split(match[0]);
				repSections.push(prev[attrName]['sName'][0]);
				if (prev[attrName].rowIdLo === '-create') {
					rowsToCreate.push(prev[attrName]['sName'][0]);
				}
				return prev;
			}, {});
			repSections = _.uniq(repSections);
			let repSectionsRegex = _.map(repSections, function (s) {
				return new RegExp('^' + escapeRegExp(s) + '_(-[-A-Za-z0-9]+?|\\d+)_', 'i');
			});
			// Get attributes
			_.each(list, function (charid) {
				allRepAttrs[charid] = {};
				repOrders[charid] = {};
				_.each(repSections, prefix => allRepAttrs[charid][prefix] = {});
			});
			_.each(list, function (charid) {
				_.each(findObjs({_type: 'attribute', _characterid: charid}), function (o) {
					let attrName = o.get('name');
					_.each(repSections, function (prefix, k) {
						if (attrName.search(repSectionsRegex[k]) === 0) {
							allRepAttrs[charid][prefix][attrName] = o;
						} else if (attrName === '_reporder_' + prefix) {
							repOrders[charid][prefix] = o.get('current').split(',');
						}
					});
				});
			});
			// Get list of repeating row ids by charid and prefix from allRepAttrs
			_.each(list, function (charid) {
				repRowIds[charid] = {};
				_.each(repSections, function (prefix, k) {
					repRowIds[charid][prefix] = _.chain(allRepAttrs[charid][prefix])
						.keys()
						.map(n => n.match(repSectionsRegex[k]))
						.compact()
						.map(a => a[1])
						.uniq()
						.value();
					if (repOrders[charid][prefix]) {
						repRowIds[charid][prefix] = _.chain(repOrders[charid][prefix])
							.intersection(repRowIds[charid][prefix])
							.union(repRowIds[charid][prefix])
							.value();
					}
				});
				repRowIdsLo[charid] = _.mapObject(repRowIds[charid],
					l => _.map(l, n => n.toLowerCase()));
				_.each(_.uniq(rowsToCreate), function (prefix) {
					repRowIds[charid][prefix].push(generateRowID());
				});
			});
			// Get correct attribute names and store attributes in allAttrs
			_.each(list, function (charid) {
				_.each(attrNamesRead, function (p, attrName) {
					let finalId;
					if (isDef(p.rowNum) && isDef(repRowIds[charid][p.sName[0]][p.rowNum])) {
						finalId = repRowIds[charid][p.sName[0]][p.rowNum];
					} else if (p.rowIdLo === '-create') {
						finalId = _.last(repRowIds[charid][p.sName[0]]);
					} else if (isDef(p.rowIdLo) && _.contains(repRowIdsLo[charid][p.sName[0]], p.rowIdLo)) {
						let index = _.indexOf(repRowIdsLo[charid][p.sName[0]], p.rowIdLo);
						finalId = repRowIds[charid][p.sName[0]][index];
					} else if (isDef(p.rowNum)) {
						errors.push(`Repeating row number ${p.rowNum} invalid for` +
							` character ${getCharNameById(charid)}` +
							` and repeating section ${p.sName[0]}.`);
					} else {
						errors.push(`Repeating row id ${p.rowIdLo} invalid for` +
							` character ${getCharNameById(charid)}` +
							` and repeating section ${p.sName[0]}.`);
					}
					if (finalId) {
						let finalName = p.sName[0] + '_' + finalId + '_' + p.sName[1];
						let attrNameCased = getCIKey(allRepAttrs[charid][p.sName[0]], finalName);
						if (attrNameCased) {
							allAttrs[charid][attrName] = allRepAttrs[charid][p.sName[0]][attrNameCased];
						} else if (createMissing) {
							allAttrs[charid][attrName] = createObj('attribute', {
								characterid: charid,
								name: finalName
							});
						} else if (!failSilently) {
							errors.push(`Missing attribute ${finalName} not created` +
								` for character ${getCharNameById(charid)}.`);
						}
					}
				});
			});
			return;
		},
		addStandardAttributes = function (list, attrNames, allAttrs, errors, createMissing, failSilently) {
			let attrNamesUpper = attrNames.map(x => x.toUpperCase()),
				nameIndex;
			_.each(list, function (charid) {
				_.each(findObjs({_type: 'attribute', _characterid: charid}), function (o) {
					nameIndex = _.indexOf(attrNamesUpper, o.get('name').toUpperCase());
					if (nameIndex !== -1) {
						allAttrs[charid][attrNames[nameIndex]] = o;
					}
				});
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
				attrNamesRepeating = _.filter(attrNames, str => (str.search(/^repeating_/) === 0));
			_.each(list, charid => allAttrs[charid] = {});
			addStandardAttributes(list, _.difference(attrNames, attrNamesRepeating), allAttrs,
				errors, createMissing, failSilently);
			addRepeatingAttributes(list, attrNamesRepeating, allAttrs, errors, createMissing, failSilently);
			return allAttrs;
		},
		// Setting attributes happens in a delayed recursive way to prevent the sandbox
		// from overheating.
		delayedSetAttributes = function (whisper, list, setting, errors, allAttrs, fillInAttrs, opts) {
			let cList = _.clone(list),
				feedback = [],
				dWork = function (charid) {
					setCharAttributes(charid, setting, errors, feedback, allAttrs[charid],
						fillInAttrs, opts);
					if (cList.length) {
						_.delay(dWork, 50, cList.shift());
					} else {
						handleErrors(whisper, errors);
						(opts.silent) ? null: sendFeedback(whisper, feedback);
					}
				}
			dWork(cList.shift());
		},
		setCharAttributes = function (charid, setting, errors, feedback, attrs, fillInAttrs, opts) {
			let charFeedback = {};
			_.each(attrs, function (attr, attrName) {
				let newValue;
				if (opts.reset) {
					newValue = {
						current: attr.get('max')
					};
				} else {
					newValue = (fillInAttrs[attrName]) ?
						_.mapObject(setting[attrName], v => fillInAttrValues(charid, v)) :
						_.clone(setting[attrName]);
				}
				if (opts.evaluate) {
					try {
						newValue = _.mapObject(newValue, function (v) {
							let parsed = eval(v);
							if (_.isString(parsed) || _.isFinite(parsed) || _.isBoolean(parsed)) {
								return parsed.toString();
							} else return v;
						});
					} catch (err) {
						errors.push(`Something went wrong with --evaluate` +
							` for the character ${getCharNameById(charid)}.` +
							` You were warned. The error message was: ${err}.` +
							` Attribute ${attrName} left unchanged.`);
						return;
					}
				}
				if (opts.mod || opts.modb) {
					_.each(newValue, function (v, k) {
						let moddedValue = parseFloat(v) + parseFloat(attr.get(k) || '0');
						if (!_.isNaN(moddedValue)) {
							if (opts.modb && k === 'current') {
								moddedValue = Math.min(Math.max(moddedValue, 0),
									parseFloat(attr.get('max') || Infinity));
							}
							newValue[k] = moddedValue.toString();
						} else {
							delete newValue[k];
							let type = (k === 'max') ? 'maximum ' : '';
							errors.push(`Attribute ${type}${attrName} is not number-valued` +
								` for character ${getCharNameById(charid)}.` +
								` Attribute ${type}left unchanged.`);
						}
					});
				}
				charFeedback[attrName] = newValue;
				setAttribute(attr, newValue);
			});
			// Feedback
			if (!opts.silent) {
				charFeedback = _.chain(charFeedback)
					.map(function (o, k) {
						if (isDef(o.max) && isDef(o.current))
							return `${k} to ${htmlReplace(o.current) || '<i>(empty)</i>'} / ${htmlReplace(o.max) || '<i>(empty)</i>'}`;
						else if (isDef(o.current)) return `${k} to ${htmlReplace(o.current) || '<i>(empty)</i>'}`;
						else if (isDef(o.max)) return `${k} to ${htmlReplace(o.max) || '<i>(empty)</i>'} (max)`;
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
		deleteAttributes = function (whisper, allAttrs, silent) {
			let feedback = {};
			_.each(allAttrs, function (charAttrs, charid) {
				feedback[charid] = [];
				_.each(charAttrs, function (attr, name) {
					attr.remove();
					feedback[charid].push(name);
				});
			});
			silent ? null : sendDeleteFeedback(whisper, feedback);
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
			//				an expression of the form key|value or key|value|maxvalue
			//			replace - true if characters from the replacers array should be replaced
			// Output:	Object containing key|value for all expressions.
			let setting = _.chain(args)
				.map(str => str.split(/(\\?(?:#|\|))/g))
				.map(function (split) {
					_.each(split, function (str, k) {
						if ((str === '#' || str === '|')) {
							split[k] = null;
						} else if ((str === '\\#' || str === '\\|')) {
							split[k] = (split[k - 1] || '') + str.slice(-1) + (split[k + 1] || '');
							(k > 0) ? (split[k - 1] = null) : null;
							(k < split.length - 1) ? (split[k + 1] = null) : null;
						}
					});
					return _.reject(split, _.isNull);
				})
				.compact()
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
		checkPermissions = function (list, errors, playerid, isGM) {
			let control, character;
			_.each(list, function (id, k) {
				character = getObj('character', id);
				if (character) {
					control = character.get('controlledby').split(/,/);
					if (!(state.ChatSetAttr.playersCanModify || isGM || _.contains(control, 'all') || _.contains(control, playerid))) {
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
				.value();
		},
		getIDsFromNames = function (charNames, errors) {
			return _.chain(charNames.split(/\s*,\s*/))
				.map(function (name) {
					let character = findObjs({
						_type: 'character',
						name: name
					}, {
						caseInsensitive: true
					})[0];
					if (character) {
						return character.id;
					} else {
						errors.push('No character named ' + name + ' found.');
						return null;
					}
				})
				.compact()
				.value();
		},
		sendFeedback = function (whisper, feedback) {
			let output = whisper + '<div style="border:1px solid black;background-color:' +
				'#FFFFFF;padding:3px;"><h3>Setting attributes</h3><p>' +
				(feedback.join('<br>') || 'Nothing to do.') + '</p></div>';
			sendChat('ChatSetAttr', output);
		},
		sendDeleteFeedback = function (whisper, feedback) {
			let output = whisper + '<div style="border:1px solid black;background-color:' +
				'#FFFFFF;padding:3px;"><h3>Deleting attributes</h3><p>';
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
			const mode = msg.content.match(/^!(reset|set|del|mod)attr\b(?:-|\s|$)(config)?/),
				whisper = getWhisperPrefix(msg.playerid);
			if (mode && mode[2]) {
				if (playerIsGM(msg.playerid)) {
					let opts = parseOpts(msg.content, []);
					if (opts['players-can-modify']) {
						state.ChatSetAttr.playersCanModify = !state.ChatSetAttr.playersCanModify;
					}
					if (opts['players-can-evaluate']) {
						state.ChatSetAttr.playersCanEvaluate = !state.ChatSetAttr.playersCanEvaluate;
					}
					if (opts['use-workers']) {
						state.ChatSetAttr.useWorkers = !state.ChatSetAttr.useWorkers;
					}
					showConfig(whisper);
				}
			} else if (mode) {
				// Parsing input
				let charIDList = [],
					fillInAttrs = {},
					errors = [];
				const hasValue = ['charid', 'name'],
					optsArray = ['all', 'allgm', 'charid', 'name', 'allplayers', 'sel',
						'replace', 'nocreate', 'mod', 'modb', 'evaluate', 'silent', 'reset'
					],
					opts = parseOpts(processInlinerolls(msg), hasValue),
					setting = parseAttributes(_.chain(opts).omit(optsArray).keys().value(),
						opts.replace, fillInAttrs),
					deleteMode = (mode[1] === 'del'),
					isGM = msg.playerid === 'API' || playerIsGM(msg.playerid);
				opts.mod = opts.mod || (mode[1] === 'mod');
				opts.reset = opts.reset || (mode[1] === 'reset');
				if (opts.evaluate && !isGM && !state.ChatSetAttr.playersCanEvaluate) {
					handleErrors(whisper, ['The --evaluate option is only available to the GM.']);
					return;
				}
				// Get list of character IDs
				if (opts.all && isGM) {
					charIDList = _.map(findObjs({
						_type: 'character'
					}), c => c.id);
				} else if (opts.allgm && isGM) {
					charIDList = _.chain(findObjs({
							_type: 'character'
						}))
						.filter(c => c.get('controlledby') === '')
						.map(c => c.id)
						.value();
				} else if (opts.allplayers && isGM) {
					charIDList = _.chain(findObjs({
							_type: 'character'
						}))
						.filter(c => c.get('controlledby') !== '')
						.map(c => c.id)
						.value();
				} else {
					(opts.charid) ? charIDList.push(...opts.charid.split(/\s*,\s*/)): null;
					(opts.name) ? charIDList.push(...getIDsFromNames(opts.name, errors)): null;
					(opts.sel) ? charIDList.push(...getIDsFromTokens(msg.selected)): null;
					charIDList = checkPermissions(_.uniq(charIDList), errors, msg.playerid, isGM);
				}
				if (_.isEmpty(charIDList)) {
					errors.push('No target characters. You need to supply one of --all, --allgm, --sel,' +
						' --allplayers, --charid, or --name.');
				}
				if (_.isEmpty(setting)) {
					errors.push('No attributes supplied.');
				}
				// Get attributes
				let allAttrs = getAllAttributes(charIDList, _.keys(setting), errors, !opts.nocreate && !deleteMode, deleteMode);
				handleErrors(whisper, errors);
				// Set or delete attributes
				if (!_.isEmpty(charIDList) && !_.isEmpty(setting)) {
					if (deleteMode) {
						deleteAttributes(whisper, allAttrs, opts.silent);
					} else {
						delayedSetAttributes(whisper, charIDList, setting, errors, allAttrs,
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
