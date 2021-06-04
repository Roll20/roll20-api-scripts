// ChatSetAttr version 1.1
// Last Updated: 2016-11-3
// A script to create, modify, or delete character attributes from the chat area or macros.
// If you don't like my choices for --replace, you can edit the replacers variable at your own peril to change them.

var chatSetAttr = chatSetAttr || (function() {
	'use strict';

	const version = '1.1',
	feedback = true,
	replacers = [ ['<', '[', /</g, /\[/g],
				['>',']' , />/g, /\]/g],
				['#','|', /#/g, /\|/g],
				['~','-', /\~/g, /\-/g],
				[';','?', /\;/g, /\?/g],
				['`','@', /`/g, /@/g]],

	checkInstall = function() {
		log(`-=> ChatSetAttr v${version} <=-`);
	},

	handleError = function(who, errorMsg) {
		let output = '/w "' + who + '" <div style="border:'
			+ ' 1px solid black; background-color: #FFBABA; padding: 3px 3px;">'
			+ '<h4>Error</h4>'+'<p>'+errorMsg+'</p>'+'</div>';
		sendChat('ChatSetAttr', output);
	},

	getPlayerName = function(who) {
		let match = who.match(/(.*) \(GM\)/);
		return (match) ? (match[1] || 'GM') : who;
	},

	escapeRegExp = function (str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	},

	processInlinerolls = function (msg) {
		// Input:	msg - chat message
		// Output:	msg.content, with all inline rolls evaluated
		if (_.has(msg, 'inlinerolls')) {
			return _.chain(msg.inlinerolls)
					.reduce(function(previous, current, index) {
						previous['$[[' + index + ']]'] = current.results.total || 0;
						return previous;
					},{})
					.reduce(function(previous, current, index) {
						return previous.replace(index, current);
					}, msg.content)
					.value();
		} else {
			return msg.content;
		}
	},

	deleteAttributes = function (allAttrs) {
		_.each(allAttrs, function(ch) {
			_.each(ch, function(attr) {
				attr.remove();
			});
		});
	},

	getCIKey = function (obj, name) {
		let nameLower = name.toLowerCase(), result = false;
		_.each(obj, function (v,k) {
			if (k.toLowerCase() === nameLower) {
				result = k;
			}
		});
		return result;
	},

	// Getting attributes from parsed options. Repeating attributes need special treatment
	// in order to parse row index and not create defective repeating rows.
	getRepeatingAttributes = function(who, list, setting, createMissing, failSilently) {
		let allAttrs = {}, allKeys = _.keys(setting), indexMatch, attrNameSplit, id, name,
			repeatingTypeStart, allSectionAttrs, repSectionIds, rowNum, rowId, idMatch,
			repSectionIdsLower;

		list.forEach(function(charid) {
			allAttrs[charid] = {};
		});

		_.each(allKeys, function(attrName) {
			indexMatch = attrName.match(/_\$(\d+)_/);
			allSectionAttrs = {}, repSectionIds = {}, repSectionIdsLower = {};

			_.each(list, function(charid) {
				allSectionAttrs[charid] = {};
			});

			if (indexMatch) {
				rowNum = parseInt(indexMatch[1]);
				attrNameSplit = attrName.split(indexMatch[0]);
			}
			else {
				idMatch = attrName.match(/_(-[-A-Za-z0-9]+?|\d+)_/);
				if (idMatch) {
					rowId = idMatch[1].toLowerCase();
					attrNameSplit = attrName.split(idMatch[0]);
				}
				else {
					handleError(who, 'Could not understand repeating attribute name '
						+ attrName + '.');
					return;
				}
			}

			repeatingTypeStart = new RegExp('^' + escapeRegExp(attrNameSplit[0])
				+ '_(-[-A-Za-z0-9]+?|\\d+)_','i');

			filterObjs(function(o) {
				if (o.get('_type') === 'attribute') {
					id = o.get('_characterid');
					name = o.get('name');
					if (_.contains(list,id) && name.search(repeatingTypeStart) !== -1) {
						allSectionAttrs[id][name] = o;
						return true;
					}
				}
			});

			_.each(list, function(charid) {
				repSectionIds[charid] = _.chain(allSectionAttrs[charid])
					.map((o,n) => n.match(repeatingTypeStart))
					.compact()
					.map(a => a[1])
					.uniq()
					.value();
			});
			if (!indexMatch) {
				 _.each(list, function(charid) {
					 repSectionIdsLower[charid] = _.map(repSectionIds[charid],
						 n => n.toLowerCase());
				 });
			}

			_.each(list, function(charid) {
				if (indexMatch && !_.isUndefined(repSectionIds[charid][rowNum])) {
					let realRepName = attrNameSplit[0] + '_'
						+ repSectionIds[charid][rowNum] + '_' + attrNameSplit[1];
					let nameCI = getCIKey(allSectionAttrs[charid], realRepName);
					if (nameCI) {
						allAttrs[charid][attrName] = allSectionAttrs[charid][nameCI];
					}
					else if (createMissing) {
						allAttrs[charid][attrName] = createObj('attribute',
							{characterid: charid , name: realRepName});
					}
					else if (!failSilently) {
						handleError(who, 'Missing attribute '+ realRepName
						+ ' not created for character '
						+ getAttrByName(charid,'character_name') + '.');
					}
				}
				else if (indexMatch) {
					handleError(who, 'Row number ' + rowNum + ' invalid for character '
						+ getAttrByName(charid,'character_name')
						+ ' and repeating section ' + attrNameSplit[0] + '.');
				}
				else if (_.contains(repSectionIdsLower[charid], rowId)) {
					let realRepName = attrNameSplit[0] + '_'
						+ repSectionIds[charid][_.indexOf(repSectionIdsLower[charid], rowId)]
						+ '_' + attrNameSplit[1];
					let nameCI = getCIKey(allSectionAttrs[charid], realRepName);
					if (nameCI) {
						allAttrs[charid][attrName] = allSectionAttrs[charid][nameCI];
					}
					else if (createMissing) {
						allAttrs[charid][attrName] = createObj('attribute',
							{characterid: charid , name: realRepName});
					}
					else if (!failSilently) {
						handleError(who, 'Missing attribute  '+ realRepName
							+ ' not created for character '
							+ getAttrByName(charid,'character_name') + '.');
					}
				}
				else if (!failSilently) {
					handleError(who, 'Repeating section id ' + rowId
					+ ' invalid for character ' + getAttrByName(charid,'character_name')
					+ ' and repeating section ' + attrNameSplit[0] + '.');
				}
			});
		});
		return allAttrs;
	},

	getStandardAttributes = function(who, list, setting, createMissing, failSilently) {
		let allAttrs = {}, allKeys = _.keys(setting), allKeysUpper, id, name;

		allKeysUpper = allKeys.map(x => x.toUpperCase());

		list.forEach(function(charid) {
			allAttrs[charid] = {};
		});

		filterObjs(function(o) {
			if (o.get('_type') === 'attribute') {
				id = o.get('_characterid');
				name = o.get('name');
				if (_.contains(list,id) && _.contains(allKeysUpper,name.toUpperCase())) {
					allAttrs[id][allKeys[_.indexOf(allKeysUpper, name.toUpperCase())]] = o;
					return true;
				}
			}
		});

		list.forEach(function(charid) {
			_.each(_.difference(allKeys, _.keys(allAttrs[charid])), function (key) {
				if (createMissing) {
					allAttrs[charid][key] = createObj('attribute', {characterid: charid , name: key});
				}
				else if (!failSilently) {
					handleError(who, 'Missing attribute '+key+' not created for character '+getAttrByName(charid,'character_name')+'.');
				}
			});
		});

		return allAttrs;
	},

	getAllAttributes = function(who, list, setting, createMissing, failSilently) {
		let settingRepeating = _.pick(setting, (v,k) =>	(k.search(/^repeating_/) !== -1));
		let settingStandard = _.omit(setting, _.keys(settingRepeating));
		let standardAttrs = getStandardAttributes(who, list, settingStandard, createMissing, failSilently);
		let repeatingAttrs = getRepeatingAttributes(who, list, settingRepeating, createMissing, failSilently);
		let allAttrs = {};

		list.forEach(function(charid) {
			allAttrs[charid] = _.defaults(standardAttrs[charid],repeatingAttrs[charid]);
		});
		return allAttrs;
	},

	// Setting attributes happens in a delayed recursive way to prevent the sandbox
	// from overheating.
	delayedSetAttributes = function(who, list, setting, allAttrs, fillInAttrs, mod, modb, evaluate) {
		let cList = _.clone(list),
			dWork = function(charid) {
				setCharAttributes(who, charid, setting, allAttrs[charid], fillInAttrs, mod, modb, evaluate);
				if (cList.length) {
					_.delay(dWork, 50, cList.shift());
				}
			}
		dWork(cList.shift());
	},

	setCharAttributes = function(who, charid, setting, attrs, fillInAttrs, mod, modb, evaluate) {
		_.chain(setting)
		.pick(_.keys(attrs))
		.each(function (attrValue,attrName) {
			let attr = attrs[attrName];

			let attrNew = (fillInAttrs[attrName]) ?
				_.mapObject(attrValue, v => fillInAttrValues(charid, v)) : _.clone(attrValue);

			if (evaluate) {
				try {
					attrNew = _.mapObject(attrNew, function (v) {
						let parsed = eval(v);
						if (!_.isNaN(parsed) && !_.isUndefined(parsed)) {
							return parsed;
						}
						else return v;
					});
				}
				catch(err) {
					handleError(who,'Something went wrong with --evaluate. '
						+ 'You were warned. The error message was.' + err);
				}
			}

			if (mod || modb) {
				_.each(attrNew, function(v,k) {
					let moddedValue = parseFloat(v) + parseFloat(attr.get(k) || '0');
					if (!_.isNaN(moddedValue)) {
						if (modb && k === 'current') {
							moddedValue = Math.max(moddedValue, 0);
							moddedValue = Math.min(moddedValue, parseFloat(attr.get('max') || Infinity));
						}
						attrNew[k] = moddedValue;
					}
					else {
						delete attrNew[k];
						let type = (k === 'max') ? 'maximum ' : '';
						handleError(who,'Attribute ' + type + attrName+ ' is not number-'
							+ 'valued for character ' + getAttrByName(charid,'character_name')
							+ '. Attribute ' + type + 'left unchanged.');
					}
				});
			}

			attr.set(attrNew);
// 			attr.setWithWorker(attrNew);
		});
		return;
	},

	fillInAttrValues = function(charid, expression) {
		let match = expression.match(/%(\S.*?)(?:_(max))?%/), replacer;
		while (match) {
			replacer = getAttrByName(charid, match[1], match[2] || 'current') || '';
			expression = expression.replace(/%(\S.*?)(?:_(max))?%/, replacer);
			match = expression.match(/%(\S.*?)(?:_(max))?%/);
		}
		return expression;
	},

	//  These functions parse the chat input.
	parseOpts = function(content, hasValue) {
		// Input:	content - string of the form command --opts1 --opts2  value --opts3.
		//					values come separated by whitespace.
		//			hasValue - array of all options which come with a value
		// Output:	object containing key:true if key is not in hasValue. and containing
		//			key:value otherwise
		let args, kv, opts = {};
		args = _.rest(content.replace(/<br\/>\n/g, ' ')
				.replace(/\s*$/g, '')
				.replace(/({{(.*?)\s*}}$)/g, "$2")
				.split(/\s+--/));
		for (let k in args) {
			kv = args[k].split(/\s(.+)/);
			if (_.contains(hasValue, kv[0])) {
				opts[kv[0]] = kv[1];
			} else {
				opts[args[k]] = true;
			}
		}
		return opts;
	},

	parseAttributes = function(args, replace, fillInAttrs) {
		// Input:	args - array containing comma-separated list of strings, every one of which contains
		//			an expression of the form key|value or key|value|maxvalue
		//			replace - true if characters from the replacers array should be replaced
		// Output:	Object containing key|value for all expressions.
		let setting =  _.chain(args)
						.map(str => str.split(/\s*\|\s*/))
						.reject(a => a.length === 0)
						.map(sanitizeAttributeArray)
						.reduce(function (p,c) {
							p[c[0]] = _.extend(p[c[0]] || {}, c[1])
							return p;
						},{})
						.value();

		if (replace) {
			setting = _.mapObject(setting, function(obj) {
				return _.mapObject(obj, function (str) {
					_.each(replacers, function (rep) {
						str = str.replace(rep[2],rep[1]);
					});
					return str;
				});
			});
		}

		_.extend(fillInAttrs, _.mapObject(setting, obj =>
			(obj.current && obj.current.search(/%(\S.*?)(?:_(max))?%/) !== -1)
			|| (obj.max && obj.max.search(/%(\S.*?)(?:_(max))?%/) !== -1)
		));
		return setting;
	},

	sanitizeAttributeArray = function (arr) {
		if (arr.length === 1)
			return [arr[0],{current : ''}];
		if (arr.length === 2)
			return [arr[0],{current : arr[1].replace(/^'(.*)'$/,'$1')}];
		if (arr.length === 3 && arr[1] === '')
			return [arr[0], {max : arr[2].replace(/^'(.*)'$/,'$1')}];
		if (arr.length === 3 && arr[1] === "''")
			return [arr[0], {current : '', max : arr[2].replace(/^'(.*)'$/,'$1')}];
		else if (arr.length === 3)
			return [arr[0], {current : arr[1].replace(/^'(.*)'$/,'$1'), max : arr[2].replace(/^'(.*)'$/,'$1')}];
		if (arr.length > 3) return sanitizeAttributeArray(_.first(arr,3));
	},

	// These functions are used to get a list of character ids from the input,
	// and check for permissions.
	checkPermissions = function (who, list, playerid) {
		let control, character;
		_.each(list, function (id, k) {
			character = getObj('character',id);
			if (character) {
				control = character.get('controlledby').split(/,/);
				if(!(playerIsGM(playerid) || _.contains(control,'all') || _.contains(control,playerid))) {
					list.splice(k,1);
					handleError(who, 'Permission error. Name: ' + character.get('name'));
				}
			} else {
				handleError(who, 'Invalid character id ' + id);
				list.splice(k,1);
			}
		});
		return list;
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

	getIDsFromNames = function(who, charNames, playerid) {
		let charIDList =   _.chain(charNames.split(/\s*,\s*/))
							.map(n => findObjs({type: 'character', name: n},
								{caseInsensitive: true})[0])
							.compact()
							.map(c => c.id)
							.uniq()
							.value();
		return checkPermissions(who, charIDList, playerid);
	},

	getIDsFromList = function(who, charid, playerid) {
		return checkPermissions(who, _.uniq(charid.split(/\s*,\s*/)), playerid);
	},

	sendFeedback = function (who, list, setting, replace, mod, modb) {
		let charNames = list.map(id => getAttrByName(id, "character_name")).join(', ');
		let values = _.chain(setting).values()
			.map(function (o) {
				return _.mapObject(o,function (str) {
					if (replace) {
						_.each(replacers, function (rep) {
							str = str.replace(rep[3],rep[0]);
						});
					}
					return str;
				});})
			.map(function (o) {
				if (o.max !== undefined && o.current !== undefined) return `${o.current} / ${o.max}`;
				if (o.max === undefined) return o.current;
				if (o.current === undefined) return `${o.max} (max)`;
				return '';})
			.value()
			.join(', ');
		let output = '/w "'+ who;
		output += '" <div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;">';
		if (modb) {
			output += `<p>Modifying ${_.keys(setting).join(', ')} by ${values} (within bounds) `;
		}
		else if (mod) {
			output += `<p>Modifying ${_.keys(setting).join(', ')} by ${values} `;
		}
		else {
			output += `<p>Setting ${_.keys(setting).join(', ')} to ${values} `;
		}
		output += `for characters ${charNames}`;
		if (replace) {
			output += ' (replacing '
				+ _.map(replacers, arr => arr[0]).join()
				+ ' by '
				+ _.map(replacers, arr => arr[1]).join()
				+ ')';
		}
		output += '.</p></div>';
		sendChat('ChatSetAttr', output);
	},

	sendDeleteFeedback = function (who, list, setting) {
		let charNames = list.map(id => getAttrByName(id, 'character_name')).join(', ');
		let output = '/w "'+ who + '" <div style="border:' +
			' 1px solid black; background-color: #FFFFFF; padding: 3px 3px;">' +
			'<p>Deleting attributes ' + _.keys(setting).join(', ') +
			' for characters ' + charNames + '.</p></div>';
		sendChat('ChatSetAttr', output);
	},

	// Main function, called after chat message input
	handleInput = function(msg) {
		if (msg.type !== 'api') {
			return;
		}
		let mode = msg.content.match(/^!(reset|set|del)attr\b/);
		if (mode) {
			// Parsing input
			let charIDList, fillInAttrs = {};
			const hasValue = ['charid','name'],
				optsArray = ['all','allgm','charid','name','silent','sel','replace', 'nocreate','mod','modb','evaluate'],
				who = getPlayerName(msg.who),
				opts = parseOpts(processInlinerolls(msg),hasValue),
				setting = parseAttributes(_.chain(opts).omit(optsArray).keys().value(),
					opts.replace, fillInAttrs),
				deleteMode = (mode[1] === 'del');

			if (_.isEmpty(setting)) {
				handleError(who, 'No attributes supplied.');
				return;
			}
			if (opts.evaluate && !playerIsGM(msg.playerid)) {
				handleError(who, 'The --evaluate option is only available to the GM.');
				return;
			}

			// Get list of character IDs
			if (opts.all && playerIsGM(msg.playerid)) {
				charIDList = _.map(findObjs({_type: 'character'}), c => c.id);
			} else if (opts.allgm && playerIsGM(msg.playerid)) {
				charIDList = _.chain(findObjs({_type: 'character'}))
							.filter(c => c.get('controlledby') === '')
							.map(c => c.id)
							.value();
			} else if (opts.charid) {
				charIDList = getIDsFromList(who, opts.charid, msg.playerid);
			} else if (opts.name) {
				charIDList = getIDsFromNames(who, opts.name, msg.playerid);
			} else if (opts.sel && msg.selected) {
				charIDList = getIDsFromTokens(msg.selected);
			} else {
				handleError(who,'No target characters. You need to supply one of --all, --allgm, --sel, --charid, or --name.');
				return;
			}

			// Get attributes
			let allAttrs = getAllAttributes(who, charIDList, setting, !opts.nocreate && !deleteMode, deleteMode);

			// Set or delete attributes
			if (deleteMode) {
				deleteAttributes(allAttrs);
				if (feedback && !opts.silent && !_.isEmpty(charIDList)) {
					sendDeleteFeedback(who, charIDList, setting);
				}
			}
			else {
				delayedSetAttributes(who, charIDList, setting, allAttrs, fillInAttrs, opts.mod, opts.modb, opts.evaluate);
				if (feedback && !opts.silent && !_.isEmpty(charIDList)) {
					sendFeedback(who, charIDList, setting, opts.replace, opts.mod, opts.modb);
				}
			}
		}
		return;
	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());

on('ready',function() {
	'use strict';

	chatSetAttr.CheckInstall();
	chatSetAttr.RegisterEventHandlers();
});
