// ChatSetAttr version 1.6
// Last Updated: 2017-08-31
// A script to create, modify, or delete character attributes from the chat area or macros.
// If you don't like my choices for --replace, you can edit the replacers variable at your own peril to change them.

var chatSetAttr = chatSetAttr || (function () {
	'use strict';
	const version = '1.6',
		schemaVersion = 3,
		replacers = [
			[/</g, '['],
			[/>/g, ']'],
			[/\~/g, '-'],
			[/\;/g, '?'],
			[/`/g, '@']
		],
		// Basic Setup
		checkInstall = function () {
			log(`-=> ChatSetAttr v${version} <=-`);
			if (!state.ChatSetAttr || state.ChatSetAttr.version !== schemaVersion) {
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
		checkGlobalConfig = function () {
			const s = state.ChatSetAttr,
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
		// Utility functions
		isDef = function (value) {
			return value !== undefined;
		},
		getWhisperPrefix = function (playerid) {
			const player = getObj('player', playerid);
			if (player && player.get('_displayname')) {
				return '/w "' + player.get('_displayname') + '" ';
			}
			else {
				return '/w GM ';
			}
		},
		sendChatMessage = function (msg, from) {
			if (from === undefined) from = 'ChatSetAttr';
			sendChat(from, msg, null, {
				noarchive: true
			});
		},
		setAttribute = function (attr, value) {
			state.ChatSetAttr.useWorkers ? attr.setWithWorker(value) : attr.set(value);
		},
		handleErrors = function (whisper, errors) {
			if (errors.length) {
				const output = whisper +
					'<div style="border:1px solid black;background-color:#FFBABA;padding:3px">' +
					'<h4>Errors</h4>' +
					`<p>${errors.join('<br>')}</p>` +
					'</div>';
				sendChatMessage(output);
				errors.splice(0, errors.length);
			}
		},
		showConfig = function (whisper) {
			const optionsText = [{
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
				}].map(getConfigOptionText).join(''),
				output = whisper + '<div style="border: 1px solid black; background-color: #FFFFFF;' +
				'padding:3px;"><b>ChatSetAttr Configuration</b><div style="padding-left:10px;">' +
				'<p><i>!setattr-config</i> can be invoked in the following format: </p><pre style="' +
				'white-space:normal;word-break:normal;word-wrap:normal;">!setattr-config --option</pre>' +
				'<p>Specifying an option toggles the current setting. There are currently two' +
				' configuration options:</p>' + optionsText + '</div></div>';
			sendChatMessage(output);
		},
		getConfigOptionText = function (o) {
			const button = state.ChatSetAttr[o.name] ?
				'<span style="color:red;font-weight:bold;padding:0px 4px;">ON</span>' :
				'<span style="color:#999999;font-weight:bold;padding:0px 4px;">OFF</span>';
			return '<div style="padding-left:10px;padding-right:20px"><ul>' +
				'<li style="border-top:1px solid #ccc;border-bottom:1px solid #ccc;">' +
				'<div style="float:right;width:40px;border:1px solid black;' +
				`background-color:#ffc;text-align:center;">${button}</div><b>` +
				`<span style="font-family: serif;">${o.command}</span></b>${htmlReplace('-')}` +
				`${o.desc}</li></ul></div><div><b>${o.name}</b> is currently ${button}` +
				`<a href="!setattr-config --${o.command}">Toggle</a></div>`;
		},
		getCharNameById = function (id) {
			const character = getObj('character', id);
			return (character) ? character.get('name') : '';
		},
		escapeRegExp = function (str) {
			return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		},
		htmlReplace = function (str) {
			const entities = {
				'<': 'lt',
				'>': 'gt',
				"'": '#39',
				'*': '#42',
				'@': '#64',
				'{': '#123',
				'|': '#124',
				'}': '#125',
				'[': '#91',
				']': '#93',
				'_': '#95',
				'"': 'quot'
			};
			return str.split('').map(c => (entities[c]) ? ('&' + entities[c] + ';') : c).join('');
		},
		processInlinerolls = function (msg) {
			if (msg.inlinerolls && msg.inlinerolls.length) {
				return msg.inlinerolls.map(v => {
						const ti = v.results.rolls.filter(v2 => v2.table)
							.map(v2 => v2.results.map(v3 => v3.tableItem.name).join(', '))
							.join(', ');
						return (ti.length && ti) || v.results.total || 0;
					})
					.reduce((m, v, k) => m.replace(`$[[${k}]]`, v), msg.content);
			}
			else {
				return msg.content;
			}
		},
		notifyAboutDelay = function (whisper) {
			const chatFunction = () => sendChatMessage(whisper + 'Your command is taking a ' +
				'long time to execute. Please be patient, the process will finish eventually.');
			return setTimeout(chatFunction, 8000);
		},
		getCIKey = function (obj, name) {
			const nameLower = name.toLowerCase();
			let result = false;
			Object.entries(obj).forEach(([k, v]) => {
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
				}
				else {
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
		// Setting attributes happens in a delayed recursive way to prevent the sandbox
		// from overheating.
		delayedGetAndSetAttributes = function (whisper, list, setting, errors, rData, opts) {
			const timeNotification = notifyAboutDelay(whisper),
				cList = [].concat(list),
				feedback = [],
				dWork = function (charid) {
					const attrs = getCharAttributes(charid, setting, errors, rData, opts);
					setCharAttributes(charid, setting, errors, feedback, attrs, opts);
					if (cList.length) {
						setTimeout(dWork, 50, cList.shift());
					}
					else {
						clearTimeout(timeNotification);
						if (!opts.mute) handleErrors(whisper, errors);
						if (!opts.silent) sendFeedback(whisper, feedback, opts);
					}
				}
			dWork(cList.shift());
		},
		setCharAttributes = function (charid, setting, errors, feedback, attrs, opts) {
			const charFeedback = {};
			Object.entries(attrs).forEach(([attrName, attr]) => {
				let newValue;
				charFeedback[attrName]= {};
				const fillInAttrs = setting[attrName].fillin,
					settingValue = _.pick(setting[attrName], ['current', 'max']);
				if (opts.reset) {
					newValue = {
						current: attr.get('max')
					};
				}
				else {
					newValue = (fillInAttrs) ?
						_.mapObject(settingValue, v => fillInAttrValues(charid, v)) : Object.assign({}, settingValue);
				}
				if (opts.evaluate) {
					try {
						newValue = _.mapObject(newValue, function (v) {
							const parsed = eval(v);
							if (_.isString(parsed) || Number.isFinite(parsed) || _.isBoolean(parsed)) {
								return parsed.toString();
							}
							else return v;
						});
					}
					catch (err) {
						errors.push(`Something went wrong with --evaluate` +
							` for the character ${getCharNameById(charid)}.` +
							` You were warned. The error message was: ${err}.` +
							` Attribute ${attrName} left unchanged.`);
						return;
					}
				}
				if (opts.mod || opts.modb) {
					Object.entries(newValue).forEach(([k, v]) => {
						let moddedValue = parseFloat(v) + parseFloat(attr.get(k) || '0');
						if (!_.isNaN(moddedValue)) {
							if (opts.modb && k === 'current') {
								moddedValue = Math.min(Math.max(moddedValue, 0), parseFloat(attr.get('max') || Infinity));
							}
							newValue[k] = moddedValue.toString();
						}
						else {
							delete newValue[k];
							const type = (k === 'max') ? 'maximum ' : '';
							errors.push(`Attribute ${type}${attrName} is not number-valued for ` +
								`character ${getCharNameById(charid)}. Attribute ${type}left unchanged.`);
						}
					});
				}
				charFeedback[attrName] = newValue;
				setAttribute(attr, newValue);
			});
			// Feedback
			if (!opts.silent) {
				if ('fb-content' in opts) {
					const finalFeedback = Object.entries(setting).reduce((m, [attrName, value], k) => {
							return m.replace(`_NAME${k}_`, attrName)
								.replace(`_TCUR${k}_`, htmlReplace(value.current || ''))
								.replace(`_TMAX${k}_`, htmlReplace(value.max || ''))
								.replace(`_CUR${k}_`, htmlReplace(charFeedback[attrName].current || ''))
								.replace(`_MAX${k}_`, htmlReplace(charFeedback[attrName].max || ''));
						}, String(opts['fb-content']).replace('_CHARNAME_', getCharNameById(charid)))
						.replace(/_(?:TCUR|TMAX|CUR|MAX|NAME)\d*_/g, '');
					feedback.push(finalFeedback);
				}
				else {
					const finalFeedback = Object.entries(charFeedback).map(([k, o]) => {
						if ('max' in o && 'current' in o)
							return `${k} to ${htmlReplace(o.current) || '<i>(empty)</i>'} / ${htmlReplace(o.max) || '<i>(empty)</i>'}`;
						else if ('current' in o) return `${k} to ${htmlReplace(o.current) || '<i>(empty)</i>'}`;
						else if ('max' in o) return `${k} to ${htmlReplace(o.max) || '<i>(empty)</i>'} (max)`;
						else return null;
					}).filter(x => !!x).join(', ');
					if (finalFeedback.length) {
						feedback.push(`Setting ${finalFeedback} for character ${getCharNameById(charid)}.`);
					}
					else {
						feedback.push(`Nothing to do for character ${getCharNameById(charid)}.`);
					}
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
		// Getting attributes for a specific character
		getCharAttributes = function (charid, setting, errors, rData, opts) {
			const standardAttrNames = Object.keys(setting).filter(x => !setting[x].repeating),
				rSetting = _.omit(setting, standardAttrNames);
			return Object.assign({},
				getCharStandardAttributes(charid, standardAttrNames, errors, opts),
				getCharRepeatingAttributes(charid, rSetting, errors, rData, opts)
			);
		},
		getCharStandardAttributes = function (charid, attrNames, errors, opts) {
			const attrs = {},
				attrNamesUpper = attrNames.map(x => x.toUpperCase());
			if (attrNames.length === 0) return {};
			findObjs({
				_type: 'attribute',
				_characterid: charid
			}).forEach(attr => {
				const nameIndex = attrNamesUpper.indexOf(attr.get('name').toUpperCase());
				if (nameIndex !== -1) attrs[attrNames[nameIndex]] = attr;
			});
			_.difference(attrNames, Object.keys(attrs)).forEach(key => {
				if (!opts.nocreate && !opts.deletemode) {
					attrs[key] = createObj('attribute', {
						characterid: charid,
						name: key
					});
				}
				else if (!opts.deletemode) {
					errors.push(`Missing attribute ${key} not created for` +
						` character ${getCharNameById(charid)}.`);
				}
			});
			return attrs;
		},
		getCharRepeatingAttributes = function (charid, setting, errors, rData, opts) {
			const allRepAttrs = {},
				attrs = {},
				repRowIds = {},
				repOrders = {};
			if (rData.sections.size === 0) return {};
			rData.sections.forEach(prefix => allRepAttrs[prefix] = {});
			// Get attributes
			findObjs({
				_type: 'attribute',
				_characterid: charid
			}).forEach(o => {
				const attrName = o.get('name');
				rData.sections.forEach((prefix, k) => {
					if (attrName.search(rData.regExp[k]) === 0) {
						allRepAttrs[prefix][attrName] = o;
					}
					else if (attrName === '_reporder_' + prefix) {
						repOrders[prefix] = o.get('current').split(',');
					}
				});
			});
			// Get list of repeating row ids by prefix from allRepAttrs
			rData.sections.forEach((prefix, k) => {
				repRowIds[prefix] = [...new Set(Object.keys(allRepAttrs[prefix])
					.map(n => n.match(rData.regExp[k]))
					.filter(x => !!x)
					.map(a => a[1]))];
				if (repOrders[prefix]) {
					repRowIds[prefix] = _.chain(repOrders[prefix])
						.intersection(repRowIds[prefix])
						.union(repRowIds[prefix])
						.value();
				}
			});
			const repRowIdsLo = _.mapObject(repRowIds, l => l.map(n => n.toLowerCase()));
			rData.toCreate.forEach(prefix => repRowIds[prefix].push(generateRowID()));
			Object.entries(setting).forEach(([attrName, value]) => {
				const p = value.repeating;
				let finalId;
				if (isDef(p.rowNum) && isDef(repRowIds[p.splitName[0]][p.rowNum])) {
					finalId = repRowIds[p.splitName[0]][p.rowNum];
				}
				else if (p.rowIdLo === '-create' && !opts.deletemode) {
					finalId = repRowIds[p.splitName[0]][repRowIds[p.splitName[0]].length - 1];
				}
				else if (isDef(p.rowIdLo) && repRowIdsLo[p.splitName[0]].includes(p.rowIdLo)) {
					finalId = repRowIds[p.splitName[0]][repRowIdsLo[p.splitName[0]].indexOf(p.rowIdLo)];
				}
				else if (isDef(p.rowNum)) {
					errors.push(`Repeating row number ${p.rowNum} invalid for` +
						` character ${getCharNameById(charid)}` +
						` and repeating section ${p.splitName[0]}.`);
				}
				else {
					errors.push(`Repeating row id ${p.rowIdLo} invalid for` +
						` character ${getCharNameById(charid)}` +
						` and repeating section ${p.splitName[0]}.`);
				}
				if (finalId && p.rowMatch) {
					const repRowUpper = (p.splitName[0] + '_' + finalId).toUpperCase();
					Object.entries(allRepAttrs[p.splitName[0]]).forEach(([name, attr]) => {
						if (name.toUpperCase().indexOf(repRowUpper) === 0) {
							attrs[name] = attr;
						}
					});
				}
				else if (finalId) {
					const finalName = p.splitName[0] + '_' + finalId + '_' + p.splitName[1],
						attrNameCased = getCIKey(allRepAttrs[p.splitName[0]], finalName);
					if (attrNameCased) {
						attrs[attrName] = allRepAttrs[p.splitName[0]][attrNameCased];
					}
					else if (!opts.nocreate && !opts.deletemode) {
						attrs[attrName] = createObj('attribute', {
							characterid: charid,
							name: finalName
						});
					}
					else if (!opts.deletemode) {
						errors.push(`Missing attribute ${finalName} not created` +
							` for character ${getCharNameById(charid)}.`);
					}
				}
			});
			return attrs;
		},
		// Deleting attributes
		delayedDeleteAttributes = function (whisper, list, setting, errors, rData, opts) {
			const timeNotification = notifyAboutDelay(whisper),
				cList = [].concat(list),
				feedback = {},
				dWork = function (charid) {
					const attrs = getCharAttributes(charid, setting, errors, rData, opts);
					feedback[charid] = [];
					deleteCharAttributes(charid, attrs, feedback);
					if (cList.length) {
						setTimeout(dWork, 50, cList.shift());
					}
					else {
						clearTimeout(timeNotification);
						if (!opts.silent) sendDeleteFeedback(whisper, feedback, opts);
					}
				}
			dWork(cList.shift());
		},
		deleteCharAttributes = function (charid, attrs, feedback) {
			Object.keys(attrs).forEach(name => {
				attrs[name].remove();
				feedback[charid].push(name);
			});
		},
		// These functions parse the chat input.
		parseOpts = function (content, hasValue) {
			// Input:	content - string of the form command --opts1 --opts2  value --opts3.
			//					values come separated by whitespace.
			//			hasValue - array of all options which come with a value
			// Output:	object containing key:true if key is not in hasValue. and containing
			//			key:value otherwise
			return content.replace(/<br\/>\n/g, ' ')
				.replace(/\s*$/g, '')
				.replace(/({{(.*?)\s*}}$)/g, '$2')
				.split(/\s+--/)
				.slice(1)
				.reduce((m, arg) => {
					const kv = arg.split(/\s(.+)/);
					if (hasValue.includes(kv[0])) {
						m[kv[0]] = kv[1] || '';
					}
					else {
						m[arg] = true;
					}
					return m;
				}, {});
		},
		parseAttributes = function (args, opts, errors) {
			// Input:	args - array containing comma-separated list of strings, every one of which contains
			//				an expression of the form key|value or key|value|maxvalue
			//			replace - true if characters from the replacers array should be replaced
			// Output:	Object containing key|value for all expressions.
			const globalRepeatingData = {
					regExp: new Set(),
					toCreate: new Set(),
					sections: new Set(),
				},
				setting = args.map(str => {
					return str.split(/(\\?(?:#|\|))/g)
						.reduce((m, s) => {
							if ((s === '#' || s === '|')) m[m.length] = '';
							else if ((s === '\\#' || s === '\\|')) m[m.length - 1] += s.slice(-1);
							else m[m.length - 1] += s;
							return m;
						}, ['']);
				})
				.filter(v => !!v)
				// Replace for --replace
				.map(arr => {
					return arr.map((str, k) => {
						if (opts.replace && k > 0) return replacers.reduce((m, rep) => m.replace(rep[0], rep[1]), str);
						else return str;
					});
				})
				// parse out current/max value
				.map(arr => {
					const value = {};
					if (arr.length < 3 || arr[1] !== '') {
						value.current = (arr[1] || '').replace(/^'(.*)'$/, '$1');
					}
					if (arr.length > 2) {
						value.max = arr[2].replace(/^'(.*)'$/, '$1');
					}
					return [arr[0], value];
				})
				// Find out if we need to run %_% replacement
				.map(([name, value]) => {
					if ((value.current && value.current.search(/%(\S.*?)(?:_(max))?%/) !== -1) ||
						(value.max && value.max.search(/%(\S.*?)(?:_(max))?%/) !== -1)) value.fillin = true;
					else value.fillin = false;
					return [name, value];
				})
				// Do repeating section stuff
				.map(([name, value]) => {
					if (name.search(/^repeating_/) === 0) {
						value.repeating = getRepeatingData(name, globalRepeatingData, opts, errors);
					}
					else value.repeating = false;
					return [name, value];
				})
				.filter(([name, value]) => value.repeating !== null)
				.reduce((p, c) => {
					p[c[0]] = Object.assign(p[c[0]] || {}, c[1])
					return p;
				}, {});
			globalRepeatingData.sections.forEach(s => {
				globalRepeatingData.regExp.add(new RegExp(`^${escapeRegExp(s)}_(-[-A-Za-z0-9]+?|\\d+)_`, 'i'));
			});
			globalRepeatingData.regExp = [...globalRepeatingData.regExp];
			globalRepeatingData.toCreate = [...globalRepeatingData.toCreate];
			globalRepeatingData.sections = [...globalRepeatingData.sections];
			return [setting, globalRepeatingData];
		},
		getRepeatingData = function (name, globalData, opts, errors) {
			const match = name.match(/_(\$\d+|-[-A-Za-z0-9]+|\d+)(_)?/),
				output = {};
			if (match && match[1][0] === '$' && match[2] === '_') {
				output.rowNum = parseInt(match[1].slice(1));
			}
			else if (match && match[2] === '_') {
				output.rowId = match[1];
				output.rowIdLo = match[1].toLowerCase();
			}
			else if (match && match[1][0] === '$' && opts.deletemode) {
				output.rowNum = parseInt(match[1].slice(1));
				output.rowMatch = true;
			}
			else if (match && opts.deletemode) {
				output.rowId = match[1];
				output.rowIdLo = match[1].toLowerCase();
				output.rowMatch = true;
			}
			else {
				errors.push(`Could not understand repeating attribute name ${name}.`);
				output = null;
			}
			if (output) {
				output.splitName = name.split(match[0]);
				globalData.sections.add(output.splitName[0]);
				if (output.rowIdLo === '-create' && !opts.deletemode) {
					globalData.toCreate.add(output.splitName[0]);
				}
			}
			return output;
		},
		// These functions are used to get a list of character ids from the input,
		// and check for permissions.
		checkPermissions = function (list, errors, playerid, isGM) {
			return list.filter(id => {
				const character = getObj('character', id);
				if (character) {
					const control = character.get('controlledby').split(/,/);
					if (!(isGM || control.includes('all') || control.includes(playerid))) {
						errors.push(`Permission error for character ${character.get('name')}.`);
						return false;
					}
					else return true;
				}
				else {
					errors.push(`Invalid character id ${id}.`);
					return false;
				}
			});
		},
		getIDsFromTokens = function (selected) {
			return (selected || []).map(obj => getObj('graphic', obj._id))
				.filter(x => !!x)
				.map(token => token.get('represents'))
				.filter(id => getObj('character', id || ''));
		},
		getIDsFromNames = function (charNames, errors) {
			return charNames.split(/\s*,\s*/)
				.map(name => {
					const character = findObjs({
						_type: 'character',
						name: name
					}, {
						caseInsensitive: true
					})[0];
					if (character) {
						return character.id;
					}
					else {
						errors.push(`No character named ${name} found.`);
						return null;
					}
				})
				.filter(x => !!x);
		},
		sendFeedback = function (whisper, feedback, opts) {
			const output = (opts['fb-public'] ? '' : whisper) +
				'<div style="border:1px solid black;background-color:#FFFFFF;padding:3px;">' +
				'<h3>' + (('fb-header' in opts) ? opts['fb-header'] : 'Setting attributes') + '</h3><p>' +
				'<p>' + (feedback.join('<br>') || 'Nothing to do.') + '</p></div>';
			sendChatMessage(output, opts['fb-from']);
		},
		sendDeleteFeedback = function (whisper, feedback, opts) {
			let output = (opts['fb-public'] ? '' : whisper) +
				'<div style="border:1px solid black;background-color:#FFFFFF;padding:3px;">' +
				'<h3>' + (('fb-header' in opts) ? opts['fb-header'] : 'Deleting attributes') + '</h3><p>';
			output += Object.entries(feedback)
				.filter(([charid, arr]) => arr.length)
				.map(([charid, arr]) => `Deleting attribute(s) ${arr.join(', ')} for character ${getCharNameById(charid)}.`)
				.join('<br>') || 'Nothing to do.';
			output += '</p></div>';
			sendChatMessage(output, opts['fb-from']);
		},
		// Main function, called after chat message input
		handleInput = function (msg) {
			if (msg.type !== 'api') return;
			const mode = msg.content.match(/^!(reset|set|del|mod|modb)attr\b(?:-|\s|$)(config)?/),
				whisper = getWhisperPrefix(msg.playerid);
			if (mode && mode[2]) {
				if (playerIsGM(msg.playerid)) {
					const opts = parseOpts(msg.content, []);
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
			}
			else if (mode) {
				// Parsing input
				let charIDList = [],
					errors = [];
				const hasValue = ['charid', 'name', 'fb-header', 'fb-content', 'fb-from'],
					optsArray = ['all', 'allgm', 'charid', 'name', 'allplayers', 'sel', 'deletemode',
						'replace', 'nocreate', 'mod', 'modb', 'evaluate', 'silent', 'reset', 'mute',
						'fb-header', 'fb-content', 'fb-from', 'fb-public'
					],
					opts = parseOpts(processInlinerolls(msg), hasValue),
					isGM = msg.playerid === 'API' || playerIsGM(msg.playerid);
				opts.mod = opts.mod || (mode[1] === 'mod');
				opts.modb = opts.modb || (mode[1] === 'modb');
				opts.reset = opts.reset || (mode[1] === 'reset');
				opts.silent = opts.silent || opts.mute;
				opts.deletemode = (mode[1] === 'del');
				// Sanitise feedback
				if ('fb-from' in opts) opts['fb-from'] = String(opts['fb-from']);
				// Parse desired attribute values
				const [setting, rData] = parseAttributes(Object.keys(_.omit(opts, optsArray)), opts, errors);
				// Fill in header info
				if ('fb-header' in opts) {
					opts['fb-header'] = Object.entries(setting).reduce((m, [n, v], k) => {
						return m.replace(`_NAME${k}_`, n)
							.replace(`_TCUR${k}_`, htmlReplace(v.current || ''))
							.replace(`_TMAX${k}_`, htmlReplace(v.max || ''));
					}, String(opts['fb-header'])).replace(/_(?:TCUR|TMAX|NAME)\d*_/g, '');
				}
				if (opts.evaluate && !isGM && !state.ChatSetAttr.playersCanEvaluate) {
					if (!opts.mute) handleErrors(whisper, ['The --evaluate option is only available to the GM.']);
					return;
				}
				// Get list of character IDs
				if (opts.all && isGM) {
					charIDList = findObjs({
						_type: 'character'
					}).map(c => c.id);
				}
				else if (opts.allgm && isGM) {
					charIDList = findObjs({
							_type: 'character'
						}).filter(c => c.get('controlledby') === '')
						.map(c => c.id);
				}
				else if (opts.allplayers && isGM) {
					charIDList = findObjs({
							_type: 'character'
						}).filter(c => c.get('controlledby') !== '')
						.map(c => c.id);
				}
				else {
					if (opts.charid) charIDList.push(...opts.charid.split(/\s*,\s*/));
					if (opts.name) charIDList.push(...getIDsFromNames(opts.name, errors));
					if (opts.sel) charIDList.push(...getIDsFromTokens(msg.selected));
					charIDList = checkPermissions([...new Set(charIDList)], errors, msg.playerid, isGM);
				}
				if (charIDList.length === 0) {
					errors.push('No target characters. You need to supply one of --all, --allgm, --sel,' +
						' --allplayers, --charid, or --name.');
				}
				if (Object.keys(setting).length === 0) {
					errors.push('No attributes supplied.');
				}
				// Get attributes
				if (!opts.mute) handleErrors(whisper, errors);
				// Set or delete attributes
				if (charIDList.length > 0 && Object.keys(setting).length > 0) {
					if (opts.deletemode) {
						delayedDeleteAttributes(whisper, charIDList, setting, errors, rData, opts);
					}
					else {
						delayedGetAndSetAttributes(whisper, charIDList, setting, errors, rData, opts);
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
