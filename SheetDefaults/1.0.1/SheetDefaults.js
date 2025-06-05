/*
=========================================================
Name            :   SheetDefaults
GitHub          :   
Roll20 Contact  :   timmaugh
Version         :   1.0.1
Last Update     :   10 MAR 2025
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.SheetDefaults = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.SheetDefaults.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const SheetDefaults = (() => { // eslint-disable-line no-unused-vars
	const apiproject = 'SheetDefaults';
	const version = '1.0.0';
	const apilogo = "https://i.imgur.com/VDdtqpt.png";
	const apilogoalt = "https://i.imgur.com/Pq6mmmB.png";
	const apilogosmall = "https://i.imgur.com/3mafbf8.png";
	const schemaVersion = 0.1;
	API_Meta[apiproject].version = version;
	const vd = new Date(1741657143142);
	const versionInfo = () => {
		log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
	};
	const logsig = () => {
		// initialize shared namespace for all signed projects, if needed
		state.torii = state.torii || {};
		// initialize siglogged check, if needed
		state.torii.siglogged = state.torii.siglogged || false;
		state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
		if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
			const logsig = '\n' +
				'  _____________________________________________   ' + '\n' +
				'   )_________________________________________(    ' + '\n' +
				'     )_____________________________________(      ' + '\n' +
				'           ___| |_______________| |___            ' + '\n' +
				'          |___   _______________   ___|           ' + '\n' +
				'              | |               | |               ' + '\n' +
				'              | |               | |               ' + '\n' +
				'              | |               | |               ' + '\n' +
				'              | |               | |               ' + '\n' +
				'              | |               | |               ' + '\n' +
				'______________|_|_______________|_|_______________' + '\n' +
				'                                                  ' + '\n';
			log(`${logsig}`);
			state.torii.siglogged = true;
			state.torii.sigtime = Date.now();
		}
		return;
	};
	const checkInstall = () => {
		if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
			log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
			switch (state[apiproject] && state[apiproject].version) {

				case 0.1:
				/* falls through */

				case 'UpdateSchemaVersion':
					state[apiproject].version = schemaVersion;
					break;

				default:
					state[apiproject] = {
						settings: {},
						defaults: {},
						version: schemaVersion
					}
					break;
			}
		}
	};
	let stateReady = false;
	const assureState = () => {
		if (!stateReady) {
			checkInstall();
			stateReady = true;
		}
	};
	const manageState = { // eslint-disable-line no-unused-vars
		reset: () => state[apiproject].settings = _.clone(state[apiproject].defaults),
		clone: () => { return _.clone(state[apiproject].settings); },
		set: (p, v) => state[apiproject].settings[p] = v,
		get: (p) => { return state[apiproject].settings[p]; }
	};
	// ==================================================
	//		MESSAGING
	// ==================================================
	let html = {};
	let css = {}; // eslint-disable-line no-unused-vars
	let HE = () => { }; // eslint-disable-line no-unused-vars
	const theme = {
		primaryColor: '#226381',
		primaryTextColor: '#232323',
		primaryTextBackground: '#ededed'
	}
	const localCSS = {
		msgheader: {
			'background-color': theme.primaryColor,
			'color': 'white',
			'font-size': '1.2em',
			'padding-left': '4px'
		},
		msgbody: {
			'color': theme.primaryTextColor,
			'background-color': theme.primaryTextBackground
		},
		msgfooter: {
			'color': theme.primaryTextColor,
			'background-color': theme.primaryTextBackground
		},
		msgheadercontent: {
			'display': 'table-cell',
			'vertical-align': 'middle',
			'padding': '4px 8px 4px 6px'
		},
		msgheaderlogodiv: {
			'display': 'table-cell',
			'max-height': '30px',
			'margin-right': '8px',
			'margin-top': '4px',
			'vertical-align': 'middle'
		},
		logoimg: {
			'background-color': 'transparent',
			'float': 'left',
			'border': 'none',
			'max-height': '30px'
		},
		boundingcss: {
			'background-color': theme.primaryTextBackground
		},
		inlineEmphasis: {
			'font-weight': 'bold'
		},
		tableheader: {
			'color': `${theme.primaryTextColor} !important`
		},
		button: {
			'background-color': theme.primaryColor,
			'color': 'white',
			'border-radius': '6px'
		},
		leftalign: {
			'text-align': 'left'
		},
		rightalign: {
			'text-align': 'right'
		},
		tipContainer: {
			'overflow': 'hidden',
			'width': '100%',
			'border': 'none',
			'max-width': '250px',
			'display': 'block'
		},
		tipBounding: {
			'border-radius': '10px',
			'border': '2px solid #000000',
			'display': 'table-cell',
			'width': '100%',
			'overflow': 'hidden',
			'font-size': '12px'
		},
		tipHeaderLine: {
			'overflow': 'hidden',
			'display': 'table',
			'background-color': theme.primaryColor,
			'width': '100%'
		},
		tipLogoSpan: {
			'display': 'table-cell',
			'overflow': 'hidden',
			'vertical-align': 'middle',
			'width': '40px'
		},
		tipLogoImg: {
			'min-height': '37px',
			'margin-left': '3px',
			'margin-top': '5px',
			'background-image': `url('${apilogosmall}')`,
			'background-repeat': 'no-repeat',
			'backgound-size': 'contain',
			'width': '37px',
			'display': 'inline-block'
		},
		tipContentLine: {
			'overflow': 'hidden',
			'display': 'table',
			'background-color': theme.primaryLightColor,
			'width': '100%'
		},
		tipContent: {
			'display': 'table-cell',
			'overflow': 'hidden',
			'padding': '5px 8px',
			'text-align': 'left',
			'color': '#232323',
			'background-color': theme.primaryLightColor
		},
		tipHeaderTitle: {
			'display': 'table-cell',
			'overflow': 'hidden',
			'padding': '5px 8px',
			'text-align': 'left',
			'color': theme.primaryLightColor,
			'font-size': '1.2em',
			'vertical-align': 'middle',
			'font-weight': 'bold'
		}

	}
	const msgbox = ({
		msg: msg = '',
		title: title = '',
		headercss: headercss = localCSS.msgheader,
		bodycss: bodycss = localCSS.msgbody,
		footercss: footercss = localCSS.msgfooter,
		sendas: sendas = apiproject,
		whisperto: whisperto = 'gm',
		footer: footer = '',
		btn: btn = '',
	} = {}) => {
		if (title) title = html.div(html.div(html.img(apilogo, `${apiproject} Logo`, localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
		Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, footercss: footercss, boundingcss: localCSS.boundingcss, noarchive: true });
	};
	const button = ({
		elem: elem = '',
		label: label = '',
		char: char = '',
		type: type = '!',
		css: css = localCSS.button
	} = {}) => {
		return Messenger.Button({ elem: elem, label: label, char: char, type: type, css: css });
	};
	const getTip = (contents, label, header = '', contentcss = {}) => {
		let contentCSS = Object.assign(_.clone(localCSS.tipContent), contentcss);
		return html.tip(
			label,
			html.span( // container
				html.span( // bounding
					html.span( // header line
						html.span( // left (logo)
							html.span('', localCSS.tipLogoImg),
							localCSS.tipLogoSpan) +
						html.span( // right (content)
							header,
							localCSS.tipHeaderTitle),
						localCSS.tipHeaderLine) /*+
					html.span( // content line
						html.span( // content cell
							contents,
							contentCSS),
						localCSS.tipContentLine)*/,
					localCSS.tipBounding),
				localCSS.tipContainer),
			{ 'display': 'inline-block' }
		);
	};

	// ==================================================
	//		LOGGING
	// ==================================================
	let oLog = {};
	let oData = [];
	const resetLog = () => {
		oLog = {
			actions: [],
			args: [],
			origLength: 0,
			startTime: Date.now()
		};
	};
	class ActionToken {
		constructor({ action: action = '', cid: cid = '', attr: attr, name: name = '', current: current = '' } = {}) {
			this.action = action;
			this.cid = cid;
			this.attr = attr;
			this.name = name;
			this.current = current;
		}

	}

	// ==================================================
	//		HANDLE CHAT
	// ==================================================
	// PROPERTY OBJECTS
	const propObj = {
		w: 'w',
		wtype: 'w',
		whisper: 'w',

		r: 'r',
		rtype: 'r',
		roll: 'r',

		d: 'd',
		dtype: 'd',
		damage: 'd'
	};

	const attrOptions = {
		w: {
			always: '/w gm ',
			never: '',
			toggle: '@{whispertoggle}',
			query: '?{Whisper?|Public Roll,|Whisper Roll,/w gm }'
		},
		r: {
			always: '{{always=1}} {{r2=[[1d20',
			never: '{{normal=1}} {{r2=[[0d20',
			toggle: '@{advantagetoggle}',
			query: '@{queryadvantage}'
		},
		d: {
			auto: 'full',
			yes: 'full',
			no: 'pick'
		}
	};
	let statusButton;

	const handleInquiry = (msg) => {
		if (msg.type !== 'api' || !/^!sheetdefaults-status/i.test(msg.content)) return;
		if (!playerIsGM(msg.playerid)) {
			msgbox({ msg: 'GM access required to run that command.', title: 'GM Required' });
			return;
		}
		if (oData.length) {
			msgbox({ msg: `SheetDefaults has processed ${oLog.actions.length} of ${oLog.origLength} attributes.`, title: `Processing...`, btn: statusButton });
		} else {
			msgbox({ msg: `There is no currently processing SheetDefault operation.`, title: `No Current Process` });
		}
	};
	const handleInput = (msg) => {
		if (msg.type !== 'api' || !/^!sheetdefaults\s/i.test(msg.content)) return;
		if (!playerIsGM(msg.playerid)) {
			msgbox({ msg: 'GM access required to run that command.', title: 'GM Required' });
			return;
		}
		let argObj = Object.fromEntries(
			msg.content
				.split(/\s+--/)
				.slice(1)
				.map(a => a.toLowerCase().split(/#|\|/))
				.filter(a => a.length > 1)
				.map(a => a.slice(0, 2))
				.filter(a => propObj.hasOwnProperty(a[0]) && attrOptions[propObj[a[0]]].hasOwnProperty(a[1]))
				.map(a => [propObj[a[0]], attrOptions[propObj[a[0]]][a[1]]])
		);
		if (!Object.keys(argObj).length) {
			msgbox({ msg: `You must supply one or more of w, d, or r arguments with valid settings. Please consult the script's documentation. Exiting process.`, title: `Invalid Command` });
			return;
		}
		resetLog();
		oLog.args = argObj;
		oData = findObjs({ type: 'character' })
			.reduce((m, c) => {
				Object.keys(argObj).forEach(k => {
					let attrs = findObjs({ type: 'attribute', characterid: c.id, name: `${k}type` });
					if (!attrs.length) {
						m = [
							...m,
							new ActionToken({ action: 'create', cid: c.id, name: `${k}type`, current: argObj[k] })
						];
					} else {
						m = [
							...m,
							...attrs.slice(1).map(a => {
								return new ActionToken({ action: 'delete', cid: c.id, attr: a, name: `${k}type`, current: argObj[k] });
							}),
							new ActionToken({ action: 'change', cid: c.id, attr: attrs[0], name: `${k}type`, current: argObj[k] })
						];
					}
				});
				return m;
			}, []);

		if (oData.length) {
			oLog.origLength = oData.length;
			oLog.startTime = Date.now();
			let formattedTime = new Date(oLog.startTime).toLocaleTimeString();

			let rptObj = Object.assign({ w: 'Not Provided', r: 'Not Provided', d: 'Not Provided' }, oLog.args);
			let tbl = html.table(
				html.tr(
					html.th(getTip('', html.span('ATTR', localCSS.tableheader), 'Attribute'), localCSS.leftalign, localCSS.tableheader) + // attribute name heading
					html.th(getTip('', html.span('VALUE', localCSS.tableheader), 'Value'), localCSS.leftalign, localCSS.tableheader) // value heading
				) +
				Object.keys(rptObj).map(k => {
					if (rptObj[k] === 'Not Provided') {
						return '';
					}
					return html.tr(
						html.td(`${k}type`, localCSS.leftalign) +
						html.td(HE(rptObj[k]), localCSS.leftalign)
					);
				}).join(''));
			msgbox({
				msg: `SheetDefaults began working at ${formattedTime} (Roll20 Server Time). It might take a while before the process completes. Please be patient. Commands in use:${tbl}`,
				title: 'Process Started',
				btn: statusButton
			});
			burndown();
		}
	};
	const outputLog = () => {
		let msg = `Process completed in ${Math.round((Date.now() - oLog.startTime) / 10) / 100} seconds.`;
		let tbl = html.table(
			html.tr(
				html.th(getTip('', html.span('ATTR', localCSS.tableheader),'Attribute'), localCSS.leftalign, localCSS.tableheader) + // attribute name heading
				html.th(getTip('', html.span('VALUE', localCSS.tableheader), 'Value'), localCSS.leftalign, localCSS.tableheader) + // value heading
				html.th(getTip('', '\u{2705}', 'Attributes Changed') + '&nbsp;(' + getTip('', '\u{2A}\u{FE0F}\u{20E3}', 'Attributes Created') + ')', localCSS.rightalign, localCSS.tableheader) + // set(new) heading
				html.th(getTip('', '\u{274C}', 'Attributes Deleted'), localCSS.rightalign, localCSS.tableheader) // deleted heading
			) +
			Object.keys(oLog.args).map(k => {
				let newCount = oLog.actions.filter(a => a.action === 'create' && a.name === `${k}type`).length;
				let setCount = oLog.actions.filter(a => ['create', 'change'].includes(a.action) && a.name === `${k}type`).length;
				let delCount = oLog.actions.filter(a => a.action === 'delete' && a.name === `${k}type`).length;
				return html.tr(
					html.td(`${k}type`, localCSS.leftalign) +
					html.td(HE(oLog.args[k]), localCSS.leftalign) +
					html.td(`${setCount} (${newCount})`, localCSS.rightalign) +
					html.td(delCount, localCSS.rightalign)
				);
			}).join('')
		);
		msgbox({ msg: msg + tbl, title: 'SheetDefaults Log' });
	};
	const burndown = () => {
		if (!oData.length) {
			outputLog();
			return;
		}
		let data = oData.shift();
		let attr;
		switch (data.action) {
			case 'create':
				createObj('attribute', { characterid: data.cid, name: data.name, current: '' })
					.setWithWorker({ current: data.current });
				break;
			case 'delete':
				data.attr.remove();
				break;
			default:
				data.attr.setWithWorker({ current: data.current });
		}
		oLog.actions.push(data);
		setTimeout(burndown, 0);
	};

	const registerEventHandlers = () => {
		on('chat:message', handleInput);
		on('chat:message', handleInquiry);
	};

	const checkDependencies = (deps) => {
		/* pass array of objects like
			{ name: 'ModName', version: '#.#.#' || '', mod: ModName || undefined, checks: [ [ExposedItem, type], [ExposedItem, type] ] }
		*/
		const dependencyEngine = (deps) => {
			const versionCheck = (mv, rv) => {
				let modv = [...mv.split('.'), ...Array(4).fill(0)].slice(0, 4);
				let reqv = [...rv.split('.'), ...Array(4).fill(0)].slice(0, 4);
				return reqv.reduce((m, v, i) => {
					if (m.pass || m.fail) return m;
					if (i < 3) {
						if (parseInt(modv[i]) > parseInt(reqv[i])) m.pass = true;
						else if (parseInt(modv[i]) < parseInt(reqv[i])) m.fail = true;
					} else {
						// all betas are considered below the release they are attached to
						if (reqv[i] === 0 && modv[i] === 0) m.pass = true;
						else if (modv[i] === 0) m.pass = true;
						else if (reqv[i] === 0) m.fail = true;
						else if (parseInt(modv[i].slice(1)) >= parseInt(reqv[i].slice(1))) m.pass = true;
					}
					return m;
				}, { pass: false, fail: false }).pass;
			};

			let result = { passed: true, failures: {}, optfailures: {} };
			deps.forEach(d => {
				let failObj = d.optional ? result.optfailures : result.failures;
				if (!d.mod) {
					if (!d.optional) result.passed = false;
					failObj[d.name] = 'Not found';
					return;
				}
				if (d.version && d.version.length) {
					if (!(API_Meta[d.name].version && API_Meta[d.name].version.length && versionCheck(API_Meta[d.name].version, d.version))) {
						if (!d.optional) result.passed = false;
						failObj[d.name] = `Incorrect version. Required v${d.version}. ${API_Meta[d.name].version && API_Meta[d.name].version.length ? `Found v${API_Meta[d.name].version}` : 'Unable to tell version of current.'}`;
						return;
					}
				}
				d.checks.reduce((m, c) => {
					if (!m.passed) return m;
					let [pname, ptype] = c;
					if (!d.mod.hasOwnProperty(pname) || typeof d.mod[pname] !== ptype) {
						if (!d.optional) m.passed = false;
						failObj[d.name] = `Incorrect version.`;
					}
					return m;
				}, result);
			});
			return result;
		};
		let depCheck = dependencyEngine(deps);
		let failures = '', contents = '', msg = '';
		if (Object.keys(depCheck.optfailures).length) { // optional components were missing
			failures = Object.keys(depCheck.optfailures).map(k => `&bull; <code>${k}</code> : ${depCheck.optfailures[k]}`).join('<br>');
			contents = `<span style="font-weight: bold">${apiproject}</span> utilizies one or more other scripts for optional features, and works best with those scripts installed. You can typically find these optional scripts in the 1-click Mod Library:<br>${failures}`;
			msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
			sendChat(apiproject, `/w gm ${msg}`);
		}
		if (!depCheck.passed) {
			failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
			contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
			msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
			sendChat(apiproject, `/w gm ${msg}`);
			return false;
		}
		return true;
	};

	on('ready', () => {
		versionInfo();
		assureState();
		logsig();

		let reqs = [
			{
				name: 'Messenger',
				version: `1.0.0`,
				mod: typeof Messenger !== 'undefined' ? Messenger : undefined,
				checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'function'], ['Css', 'function']]
			}
		];
		if (!checkDependencies(reqs)) return;
		html = Messenger.Html();
		css = Messenger.Css();
		HE = Messenger.HE;
		statusButton = button({ elem: '!sheetdefaults-status', label: 'Status', type: '!' });

		registerEventHandlers();
		resetLog();
	});
	return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.SheetDefaults.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.SheetDefaults.offset); } }
/* */