// ChatSetAttr version 0.9.1
// Last Updated: 2016-09-16
// A script to create, modify, or delete character attributes from the chat area or macros.
// If you don't like my choices for --replace, you can edit the replacers variable at your own peril to change them.

var chatSetAttr = chatSetAttr || (function() {
    'use strict';

	const version = '0.9.1',
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
		let output = '/w "' + who
			+ '" <div style="border: 1px solid black; background-color: #FFBABA; padding: 3px 3px;">'
			+ '<h4>Error</h4>'
			+ '<p>'+errorMsg+'</p>'
			+ '</div>';
		sendChat('ChatSetAttr', output, null, {noarchive:true});
	},

	getPlayerName = function(who) {
		let match = who.match(/(.*) \(GM\)/);
		if (match) {
			return match[1];
		} else {
			return who;
		}
	},

	myGetAttrByName = function(charId, attrName, createMissing) {
		// Returns attribute object by name
		let attr = findObjs({type: 'attribute', characterid: charId, name: attrName}, {caseInsensitive: true})[0];
		if (!attr && createMissing) {
			attr = createObj('attribute', {characterid: charId,	name: attrName});
		}
		return attr;
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

	deleteAttributes = function (list, setting) {
		let attr;
		list.forEach(function(charid) {
			_.each(setting, function(attrValue,attrName) {
				if (attrName.search(/^repeating_/) !== -1) {
					attr = getRepeatingAttribute(charid,attrName,false);
					if (attr) {
						attr.remove();
					}
				} else {
					attr = findObjs({type: 'attribute', characterid: charid, name: attrName}, {caseInsensitive: true});
					attr.forEach(a =>  a.remove());
				}
			});
		});
		return;
	},

	setAttributes = function(who, list, setting, createMissing, mod) {
		// Input:	list - array of valid character IDs
		//			setting - object containing attribute names and desired values
		// Output:	null. Attribute values are changed.
		let attr, current, max;
		list.forEach(function(charid) {
			_.each(setting, function(attrValue,attrName) {
				if (attrName.search(/^repeating_/) !== -1) {
					attr = getRepeatingAttribute(charid,attrName,createMissing);
				} else {
					attr = myGetAttrByName(charid,attrName,createMissing);
				}
				if (attr) {
					if (attrValue.current !== undefined) {
						if (mod) {
							current = parseInt(attrValue.current) + parseInt(attr.get('current') || '0');
							if (!_.isNaN(current)) {
								attr.set('current',current);
							} else {
								handleError(who,'Attribute '+attrName+' is not integer-valued for character '+getAttrByName(charid,'character_name')+'. Attribute left unchanged.');
							}
						}
						else {
							attr.set('current', attrValue.current);
						}
					}
					if (attrValue.max !== undefined) {
						if (mod) {
							max = parseInt(attrValue.max) + parseInt(attr.get('max') || '0');
							if (!_.isNaN(max)) {
								attr.set('max',max);
							} else {
								handleError(who,'Attribute maximum of '+attrName+' is not integer-valued for character '+getAttrByName(charid,'character_name')+'. Attribute left unchanged.');
							}
						}
						else {
							attr.set('max',attrValue.max);
						}
					}
				} else if (!createMissing) {
					handleError(who,'Missing attribute '+attrName+' not created for character '+getAttrByName(charid,'character_name')+'.');
				} else {
					handleError(who,'Repeating attribute '+attrName+' invalid for character '+getAttrByName(charid,'character_name')+'.');
				}
			});
		});
		return;
	},

	getRepeatingAttribute = function(charId, attrName, createMissing) {
		let attrMatch = attrName.match(/_\$\d+?_/), attr, attrNameSplit, repSectionIds;
		if (attrMatch) {
			let rowNum = parseInt(attrMatch[0].replace('$','').replace(/_/g,''));
			attrNameSplit = attrName.split(attrMatch[0]);
			repSectionIds = _.chain(findObjs({type: 'attribute', characterid: charId}, {caseInsensitive: true}))
				.map(a => a.get('name').match('^' + attrNameSplit[0] + '_(-[-A-Za-z0-9]+?)_'))
				.compact()
				.map(a => a[1])
				.uniq()
				.value();
			if (!_.isUndefined(repSectionIds[rowNum])) {
 				attr = myGetAttrByName(charId, attrNameSplit[0] + '_' + repSectionIds[rowNum] + '_' + attrNameSplit[1], createMissing);
			}
		} else {
			let idMatch = attrName.match(/_(-[-A-Za-z0-9]+?)_/)[0];
			if (idMatch) {
				let id = idMatch.replace(/_/g,'');
				attrNameSplit = attrName.split(idMatch);
				repSectionIds = _.chain(findObjs({type: 'attribute', characterid: charId}, {caseInsensitive: true}))
					.map(a => a.get('name').match('^' + attrNameSplit[0] + '_(-[-A-Za-z0-9]+?)_'))
					.compact()
					.map(a => a[1])
					.uniq()
					.value();
				if (_.contains(repSectionIds, id) ){
 					attr = myGetAttrByName(charId, attrNameSplit[0] + '_' + id + '_' + attrNameSplit[1], createMissing);
				}
			}
		}
		return attr;
	},

	parseOpts = function(content, hasValue) {
		// Input:	content - string of the form command --opts1 --opts2  value --opts3.
		//					values come separated by whitespace.
		//			hasValue - array of all options which come with a value
		// Output:	object containing key:true if key is not in hasValue. and containing
		//			key:value otherwise
		let args, kv, opts = {};
		args = _.rest(content.split(/\s+--/));
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
		// 			an expression of the form key|value or key|value|maxvalue
		//			replace - true if characters from the replacers array should be replaced
		// Output:	Object containing key|value for all expressions.
		args = _.chain(args)
		.map(str => str.split(/\s*\|\s*/))
		.reject(a => a.length === 0)
		.map(sanitizeAttributeArray)
		.object()
		.value();
		if (replace) {
			args = _.mapObject(args, function(obj) {
				return _.mapObject(obj,	function (str) {
					for (let rep in replacers) {
						str = str.replace(replacers[rep][2],replacers[rep][1]);
					}
					return str;
				});
			});
		}
		return args;
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
				if (o.max !== undefined && o.current !== undefined)	return `${o.current} / ${o.max}`;
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

	handleInput = function(msg) {
		if (msg.type === 'api' && msg.content.search(/^!(set|del)attr\b/) !== -1) {
			// Parsing
			let charIDList;
			let who = getPlayerName(msg.who);
			const hasValue = ['charid','name'],
				optsArray = ['all','allgm','charid','name','silent','sel','replace', 'nocreate','mod'],
				opts = parseOpts(processInlinerolls(msg), hasValue),
				setting = parseAttributes(_.chain(opts).omit(optsArray).keys().value(),opts.replace);
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

			// Set attributes
			if (msg.content.search(/^!delattr\b/) !== -1) {
				deleteAttributes(charIDList, setting);
				if (feedback && !opts.silent && !_.isEmpty(charIDList)) {
					sendDeleteFeedback(who, charIDList, setting);
				}
			}
			else {
				setAttributes(who, charIDList, setting, !opts.nocreate, opts.mod);
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
