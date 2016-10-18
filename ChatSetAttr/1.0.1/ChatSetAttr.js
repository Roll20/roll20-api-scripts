// ChatSetAttr version 1.0.1
// Last Updated: 2016-10-10
// A script to create, modify, or delete character attributes from the chat area or macros.
// If you don't like my choices for --replace, you can edit the replacers variable at your own peril to change them.

var chatSetAttr = chatSetAttr || (function() {
	'use strict';

	const version = '1.0.1',
	feedback = true,
	caseSensitive = false,
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
		let output = '/w "' + who
			+ '" <div style="border: 1px solid black; background-color: #FFBABA; padding: 3px 3px;">'
			+ '<h4>Error</h4>'+'<p>'+errorMsg+'</p>'+'</div>';
		sendChat('ChatSetAttr', output, null, {noarchive:true});
	},

	getPlayerName = function(who) {
		let match = who.match(/(.*) \(GM\)/);
		return (match) ? match[1] : who;
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

	// Getting attributes from parsed options. Repeating attributes need special treatment
	// in order to parse row index and not create defective repeating rows.
	getRepeatingAttributes = function(who, list, setting, createMissing, failSilently) {
		let allAttrs = {}, allKeys = _.keys(setting), indexMatch, attrNameSplit,
			allSectionAttrs, id, name, repSectionIds, rowNum, rowId, idMatch;

		list.forEach(function(charid) {
			allAttrs[charid] = {};
		});

		allKeys.forEach(function(attrName) {
			indexMatch = attrName.match(/_\$\d+?_/);
			allSectionAttrs = {}, repSectionIds = {};

			list.forEach(function(charid) {
				allSectionAttrs[charid] = {};
			});

			if (indexMatch) {
				rowNum = parseInt(indexMatch[0].replace('$','').replace(/_/g,''));
				attrNameSplit = attrName.split(indexMatch[0]);
			}
			else {
				idMatch = attrName.match(/_(-[-A-Za-z0-9]+?)_/)[0], rowId = idMatch.replace(/_/g,'');
				attrNameSplit = attrName.split(idMatch);
			}

			filterObjs(function(o) {
				if (o.get('_type') === 'attribute') {
					id = o.get('_characterid');
					name = o.get('name');
					if (_.contains(list,id) && name.search('^' + attrNameSplit[0] + '_(-[-A-Za-z0-9]+?)_') !== -1) {
						allSectionAttrs[id][name] = o;
						return true;
					}
				}
			});

			list.forEach(function(charid) {
				repSectionIds[charid] = _.chain(allSectionAttrs[charid])
					.map((o,n) => n.match('^' + attrNameSplit[0] + '_(-[-A-Za-z0-9]+?)_'))
					.compact()
					.map(a => a[1])
					.uniq()
					.value();
			});

			list.forEach(function(charid) {
				if (indexMatch && !_.isUndefined(repSectionIds[charid][rowNum])) {
					let realRepName = attrNameSplit[0] + '_' + repSectionIds[charid][rowNum] + '_' + attrNameSplit[1];
					if (_.has(allSectionAttrs[charid], realRepName)) {
						allAttrs[charid][attrName] = allSectionAttrs[charid][realRepName]
					}
					else if (createMissing) {
						allAttrs[charid][attrName] = createObj('attribute', {characterid: charid , name: realRepName});
					}
					else {
						handleError(who, 'Missing attribute '+realRepName+' not created for character '+getAttrByName(charid,'character_name')+'.');
					}
				}

				else if (indexMatch) {
					handleError(who, 'Row number '+rowNum+' invalid for character '+getAttrByName(charid,'character_name')+' and repeating section '+attrNameSplit[0]+'.');
				}
				else if (_.contains(repSectionIds[charid], rowId)) {
					let realRepName = attrNameSplit[0] + '_' + rowId + '_' + attrNameSplit[1];
					if (_.has(allSectionAttrs[charid], realRepName)) {
						allAttrs[charid][attrName] = allSectionAttrs[charid][realRepName]
					}
					else if (createMissing) {
						allAttrs[charid][attrName] = createObj('attribute', {characterid: charid , name: realRepName});
					}
					else if (!failSilently) {
						handleError(who, 'Missing attribute '+realRepName+' not created for character '+getAttrByName(charid,'character_name')+'.');
					}
				}
				else if (!failSilently) {
					handleError(who, 'Repeating section id '+rowId+' invalid for character '+getAttrByName(charid,'character_name')+' and repeating section '+attrNameSplit[0]+'.');
				}

			});
		});
		return allAttrs;
	},

	getStandardAttributes = function(who, list, setting, createMissing, failSilently) {
		let allAttrs = {}, allKeys = _.keys(setting), allKeysUpper, id, name;

		if (!caseSensitive) {
			allKeysUpper = allKeys.map(x => x.toUpperCase());
		}

		list.forEach(function(charid) {
			allAttrs[charid] = {};
		});

		filterObjs(function(o) {
			if (o.get('_type') === 'attribute') {
				id = o.get('_characterid');
				name = o.get('name');
				if (caseSensitive && _.contains(list,id) && _.contains(allKeys,name)) {
					allAttrs[id][name] = o;
					return true;
				}
				else if (_.contains(list,id) && _.contains(allKeysUpper,name.toUpperCase())) {
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
	delayedSetAttributes = function(who, list, setting, allAttrs, mod) {
		let cList = _.clone(list),
			dWork = function(charid) {
				setCharAttributes(who, charid, setting, allAttrs[charid], mod);
				if (cList.length) {
					_.delay(dWork, 50, cList.shift());
				}
			}
		dWork(cList.shift());
	},

	setCharAttributes = function(who, charid, setting, attrs, mod) {
		let current, max;
		_.each(_.pick(setting, _.keys(attrs)), function (attrValue,attrName) {
			let attr = attrs[attrName];
			if (_.has(attrValue,'current')) {
				if (mod) {
					current = parseFloat(attrValue.current) + parseFloat(attr.get('current') || '0');
					if (!_.isNaN(current)) {
						attr.set('current',current);
					}
					else {
						handleError(who,'Attribute '+attrName+' is not integer-valued for character '+getAttrByName(charid,'character_name')+'. Attribute left unchanged.');
					}
				}
				else {
					attr.set('current', attrValue.current);
				}
			}
			if (_.has(attrValue,'max')) {
				if (mod) {
					max = parseFloat(attrValue.max) + parseFloat(attr.get('max') || '0');
					if (!_.isNaN(max)) {
						attr.set('max',max);
					}
					else {
						handleError(who,'Attribute maximum '+attrName+' is not integer-valued for character '+getAttrByName(charid,'character_name')+'. Attribute maximum left unchanged.');
					}
				}
				else {
					attr.set('max', attrValue.max);
				}
			}
		});
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

	parseAttributes = function(args, replace) {
		// Input:	args - array containing comma-separated list of strings, every one of which contains
		//			an expression of the form key|value or key|value|maxvalue
		//			replace - true if characters from the replacers array should be replaced
		// Output:	Object containing key|value for all expressions.
		let setting = _.chain(args)
		.map(str => str.split(/\s*\|\s*/))
		.reject(a => a.length === 0)
		.map(sanitizeAttributeArray)
		.object()
		.value();

		if (replace) {
			setting = _.mapObject(setting, function(obj) {
				return _.mapObject(obj, function (str) {
					for (let rep in replacers) {
						str = str.replace(replacers[rep][2],replacers[rep][1]);
					}
					return str;
				});
			});

		}
		return setting;
	},

	sanitizeAttributeArray = function (arr) {
		if (arr.length === 1)
			return [arr[0],{current : ''}];
		if (arr.length === 2)
			return [arr[0],{current : arr[1].replace(/^'/,'').replace(/\'$/,'')}];
		if (arr.length === 3 && arr[1] === '')
			return [arr[0], {max : arr[2].replace(/^'/,'').replace(/\'$/,'')}];
		if (arr.length === 3 && arr[1] === "''")
			return [arr[0], {current : '', max : arr[2].replace(/^'/,'').replace(/\'$/,'')}];
		else if (arr.length === 3)
			return [arr[0], {current : arr[1].replace(/^'/,'').replace(/\'$/,''), max : arr[2].replace(/^'/,'').replace(/\'$/,'')}];
		if (arr.length > 3) return sanitizeAttributeArray(_.first(arr,3));
	},

	// These functions are used to get a list of character ids from the input,
	// and check for permissions.
	checkPermissions = function (who, list, playerid) {
		let control, character;
		for (let k in list) {
			character = getObj('character',list[k]);
			if (character) {
				control = character.get('controlledby').split(/,/);
				if(!(playerIsGM(playerid) || _.contains(control,'all') || _.contains(control,playerid))) {
					list.splice(k,1);
					handleError(who, 'Permission error. Name: ' + character.get('name'));
				}
			} else {
				handleError(who, 'Invalid character id ' + list[k]);
				list.splice(k,1);
			}
		}
		return _.uniq(list);
	},

	getIDsFromTokens = function (selected) {
		let charIDList = [], characterId, token;
		selected.forEach(function(a) {
			token = getObj('graphic', a._id);
			if (token) {
				characterId = token.get('represents');
				if (characterId) {
					charIDList.push(characterId);
				}
			}
		});
		return _.uniq(charIDList);
	},

	getIDsFromNames = function(who, charNames, playerid) {
		let charIDList = _.chain(charNames.split(/\s*,\s*/))
			.map(function (n) {
				let character = findObjs({type: 'character', name: n}, {caseInsensitive: true})[0];
				if (character) return character.id;
				else return '';})
			.compact()
			.value();
		return checkPermissions(who, charIDList, playerid);
	},

	getIDsFromList = function(who, charid, playerid) {
		return checkPermissions(who, charid.split(/\s*,\s*/), playerid);
	},

	sendFeedback = function (who, list, setting, replace, mod) {
		let charNames = list.map(id => getAttrByName(id, "character_name")).join(', ');
		let values = _.chain(setting).values()
			.map(function (o) {
				return _.mapObject(o,function (str) {
					if (replace) {
						for (let rep in replacers) {
							str = str.replace(replacers[rep][3],replacers[rep][0]);
						}
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
		if (mod) {
			output += `<p>Modifying ${_.keys(setting).join(', ')} by ${values} `;
		} else {
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
		let output = '/w "'+ who +
			'" <div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;">' +
			'<p>Deleting attributes ' + _.keys(setting).join(', ') +
			' for characters ' + charNames +
			'.</p></div>';
		sendChat('ChatSetAttr', output);
	},

	// Main function, called after chat message input
	handleInput = function(msg) {
		if (msg.type === 'api' && msg.content.search(/^!(set|del)attr\b/) !== -1) {
			// Parsing input
			let charIDList;
			const hasValue = ['charid','name'],
				optsArray = ['all','allgm','charid','name','silent','sel','replace', 'nocreate','mod'],
				who = getPlayerName(msg.who),
				opts = parseOpts(processInlinerolls(msg),hasValue),
				setting = parseAttributes(_.chain(opts).omit(optsArray).keys().value(),opts.replace),
				deleteMode = (msg.content.search(/^!delattr\b/) !== -1);

			if (_.isEmpty(setting)) {
				handleError(who, 'No attributes supplied.');
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
				delayedSetAttributes(who, charIDList, setting, allAttrs, opts.mod);
				if (feedback && !opts.silent && !_.isEmpty(charIDList)) {
					sendFeedback(who, charIDList, setting, opts.replace, opts.mod);
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
