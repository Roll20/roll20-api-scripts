// Blades in the Dark Companion Script v2.3
// Last Updated: 2018-07-09
//
// Credit for all graphics goes to Chris McDonald, originally inspired by Sven Düsterwald.
//
// USAGE
//
// Enter !blades help in chat to see instructions for configuration and available commands,
// or just enter !blades to see a menu of common commands.
//

/* global state, log, findObjs, getObj, sendChat, createObj, Campaign, playerIsGM, toFront, getAttrByName, on */
const bladesCompanion = (() => {
	"use strict";
	let myState = state.BladesCompanion;
	// Data
	const version = "2.3",
		clockData = {
			"4": [
				"https://s3.amazonaws.com/files.d20.io/images/35514005/KGnvHj8rXV9e_ptSAGiDFw/thumb.png?1499238433",
				"https://s3.amazonaws.com/files.d20.io/images/35514004/X6W9TBuJuUNI3pNyTX5H8w/thumb.png?1499238433",
				"https://s3.amazonaws.com/files.d20.io/images/35514006/oLpG5gx3pedx7AS6IfuxLQ/thumb.png?1499238433",
				"https://s3.amazonaws.com/files.d20.io/images/35514003/3oqSNO0k82HDxjfXzlbd5A/thumb.png?1499238433",
				"https://s3.amazonaws.com/files.d20.io/images/35514007/FTMqqS_IMjUJcCUAZB4sgA/thumb.png?1499238433"
			],
			"6": [
				"https://s3.amazonaws.com/files.d20.io/images/35514008/x4VQqGYDED0-R_M7xowR2A/thumb.png?1499238433",
				"https://s3.amazonaws.com/files.d20.io/images/35514010/H_L8trySbMhcGci5IR2pGQ/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514013/PWmtubH-YwptGm0BoHFI3g/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514011/8spAob5xL2yzG4TY-LNzow/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514009/cEDUJu3j6C3kGGKf0oC4KA/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514014/xukjwxESXN4TIzVvIm4Alw/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514012/NypxonvUPhqO0NYnqG3O7g/thumb.png?1499238434"
			],
			"8": [
				"https://s3.amazonaws.com/files.d20.io/images/35514015/mJwweMb2l7N_m45gP5Cxwg/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514016/7CL1Ai2a1VZIb7ytiCbXrw/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514017/37g3r5OzCxtrtTkSdhUmPw/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514020/ooGYGtaWzwcwQR0vn1hK8Q/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514019/0jx-6XziI1mKsZzYhSmzIQ/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514018/H1p9Y0UL_FSUEHoU8Me2YQ/thumb.png?1499238434",
				"https://s3.amazonaws.com/files.d20.io/images/35514022/9Vqzn1KRu5UnbBpnNGZoiA/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514021/5AU5vJ2GBwwyNsyYvbUeew/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514023/fXzMAd9R3rt4hfCpcmeemg/thumb.png?1499238435"
			],
			"10": [
				"https://s3.amazonaws.com/files.d20.io/images/38926150/cw3ZmJkS0IVDkovcNq2SXg/thumb.png?1505030885",
				"https://s3.amazonaws.com/files.d20.io/images/38926147/NO0Wi8b1JBAWhjIO_3aLUw/thumb.png?1505030885",
				"https://s3.amazonaws.com/files.d20.io/images/38926151/yYQ3WOnAasfk5jXS9PsMOw/thumb.png?1505030885",
				"https://s3.amazonaws.com/files.d20.io/images/38926146/PSFBhZGEoov-1EfAfvkFMw/thumb.png?1505030885",
				"https://s3.amazonaws.com/files.d20.io/images/38926144/2mY5LLVoCTEBP5MMS8qVtw/thumb.png?1505030885",
				"https://s3.amazonaws.com/files.d20.io/images/38926149/xCGNaUK3yzAcYxDV_49EIA/thumb.png?1505030885",
				"https://s3.amazonaws.com/files.d20.io/images/38926143/cUO80FRPoWUygjm3KtMAGA/thumb.png?1505030885",
				"https://s3.amazonaws.com/files.d20.io/images/38926145/mtuHQr87UxjLrEx_3H11PA/thumb.png?1505030885",
				"https://s3.amazonaws.com/files.d20.io/images/38926148/VUSWwCMvN-lPWPaJ73aEYA/thumb.png?1505030885",
				"https://s3.amazonaws.com/files.d20.io/images/38926142/6nIiZuejpZuUDhCQjvFrRw/thumb.png?1505030885",
				"https://s3.amazonaws.com/files.d20.io/images/38926141/cDnvTKaxGfjd6xNAC1Hmfg/thumb.png?1505030885"
			],
			"12": [
				"https://s3.amazonaws.com/files.d20.io/images/35514024/DhHigc3JKGXcdYHcdkIFyQ/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514025/R7vypCgyZurdCBwqvWS9gg/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514026/a8CcyRWolBPvXA28QYJWeA/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514027/lCUt7GWZZu7QharPaVCqXQ/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514028/G36Y2fgYBK6toXNKXdVKOQ/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514029/XyjxG9F8NVSBFOGj4P2Nhg/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514031/HD4WyjEc3_kSo-1_B49Tng/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514030/QV6CYmr01UGtjrMdgeBqog/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514032/1mMD24lOUreGnq91dzb-qA/thumb.png?1499238435",
				"https://s3.amazonaws.com/files.d20.io/images/35514035/2l3zSg_w_PgLwBNIv5SjPw/thumb.png?1499238436",
				"https://s3.amazonaws.com/files.d20.io/images/35514033/SB4yYBrs_yYn2uhTvzqK6g/thumb.png?1499238436",
				"https://s3.amazonaws.com/files.d20.io/images/35514034/4iOvfBjI6CyTPLc8S8Br5Q/thumb.png?1499238436",
				"https://s3.amazonaws.com/files.d20.io/images/35514036/9ohiSWYdqynOutaZBwbPiQ/thumb.png?1499238436"
			],
		},
		barData = {
			stress: {
				dimensions: {
					height: 40,
					width: 288
				},
				images: [
					"https://s3.amazonaws.com/files.d20.io/images/39697104/nUFlOmvfFReNGHfiGL_84Q/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697107/fyPU4R3wysliHlmGz4hyAw/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697110/o-qPcn_sSrNTPSYWr0fY-g/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697109/APBhbZk3r59LvJGAhNMyKA/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697106/AmG_eBEYa8HBs4X7TaOo4Q/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697117/x8ZOhH5Ub5Qk7nU-ZWw6eg/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697122/23dCYINPU0H3BOoJoUtRGQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697111/-xHrta919DfBFG4beiYR_g/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697108/KXg0OQt-CYl8offATPS5iQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697105/gpQu-AtDo2of8k0TyJOaLg/thumb.png?1506325929"
				]
			},
			stress10: {
				dimensions: {
					height: 40,
					width: 288
				},
				images: [
					"https://s3.amazonaws.com/files.d20.io/images/39697121/QXp5ob_L6uq_si-oF6keLQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697112/5QeUiiIXOWVsla0aTTfsJQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697115/4Zap4CTW4DklvZbo1RJtzQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697120/VXvQMjIWFB5lGMV4_KB25A/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697114/nCqiYoEWKRT2_ZAVn2rs8g/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697116/N9Os4wSB4aGL-ADyYUv2uw/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697118/XkBamgsX3WkTRHJVNfWCHg/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697113/Pm2Zvn7boNwYh60gn3j2eg/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697119/Ut2NAd0eBfSEqddPNCjUhw/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697127/H4PTBULStLXxWyqOuxvMFg/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697123/CirfL-phQd32Y9w70C5XUA/thumb.png?1506325929"
				]
			},
			stress11: {
				dimensions: {
					height: 40,
					width: 288
				},
				images: [
					"https://s3.amazonaws.com/files.d20.io/images/39697124/M7nka3vigvFrnrBF0kPVPQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697126/PwfedxQ4H4dfD0q5CDZ_iw/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697135/VOrawfBntAsWzTc0X-K8FQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697128/m5QGJ3F39kEskZ-wpoDJBw/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697125/ywSDmhoxvjJsGS1aTf_fVw/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697130/c-f3IiECYfcfIE-qfljY6w/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697129/kBvtGKsmhMoeKf9l5kWmfA/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697131/rlhNawocSDNiNh5t1F87_A/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697132/umc4FNHQwy2PciDr5nKMyA/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697133/FbV_IiIRpJymMB9MaNIu0Q/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697156/gc4vS8DChFbkNZSUJMODQA/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697138/_sBAEPK3eMJi53vAlMaG6w/thumb.png?1506325929"
				]
			},
			stress12: {
				dimensions: {
					height: 40,
					width: 288
				},
				images: [
					"https://s3.amazonaws.com/files.d20.io/images/39697134/M1XpsUDjyYEOdxMurj8xrQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697136/I7ylXmtf5ztI7qCKxoWeDw/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697137/LbWRhcS2kJZ0Up2FuFBfUQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697140/WXzyVk4g0oxvgl78_IjLrA/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697141/rPuc1IqiV7aKvMzobOfofA/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697139/cHai62ntavSzT4A6DidlFQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697145/aFqqBFI9696HAAdkNyy9Vg/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697142/s642wIsFuxr6-415TA9-zw/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697143/PRCJZ8TSeN4tz2Wx4uPlkQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697144/E-iQ_I3lv01SkK9C9ONZTg/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697146/9_s_RZLlKbaUjJByf5df2w/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697147/bMCtE-ng44Lj7VA7nbWGQQ/thumb.png?1506325929",
					"https://s3.amazonaws.com/files.d20.io/images/39697148/hYhGtXMu1rDH0eo7E30nCQ/thumb.png?1506325929"
				]
			},
			trauma: {
				dimensions: {
					height: 40,
					width: 100
				},
				images: [
					"https://s3.amazonaws.com/files.d20.io/images/40383701/JvVojDvqsMD0HOqWbyg0ew/thumb.png?1507479734",
					"https://s3.amazonaws.com/files.d20.io/images/40383700/LQ7w5c74sMugKTSsPDgzew/thumb.png?1507479734",
					"https://s3.amazonaws.com/files.d20.io/images/40383699/-p2wzDUZ3kh2HL9FMMYaWQ/thumb.png?1507479734",
					"https://s3.amazonaws.com/files.d20.io/images/40383703/KR4VZucNliNdE2DLil4x6Q/thumb.png?1507479734",
					"https://s3.amazonaws.com/files.d20.io/images/40383702/a7MguC5mTXdBaqoOQWyX6A/thumb.png?1507479734"
				]
			},
			trauma5: {
				dimensions: {
					height: 40,
					width: 100
				},
				images: [
					"https://s3.amazonaws.com/files.d20.io/images/40383716/8A_x8yPvIwdDtEdC_A08zg/thumb.png?1507479742",
					"https://s3.amazonaws.com/files.d20.io/images/40383711/OnLuSfqpjLk-HYUZ-dFI5A/thumb.png?1507479742",
					"https://s3.amazonaws.com/files.d20.io/images/40383713/CE4ATJw4f8pq8NzWVz6pYQ/thumb.png?1507479742",
					"https://s3.amazonaws.com/files.d20.io/images/40383714/pUU6h0WVM_XJhvZT8_d8kQ/thumb.png?1507479742",
					"https://s3.amazonaws.com/files.d20.io/images/40383712/RiCp5z2qZh4J_tHLfsB19g/thumb.png?1507479742",
					"https://s3.amazonaws.com/files.d20.io/images/40383715/o309NTNHyrW1gak7SBkdEQ/thumb.png?1507479742"
				]
			}
		},
		harmData = {
			table: {
				height: 160,
				imgsrc: "https://s3.amazonaws.com/files.d20.io/images/40179767/7Ru7WnLbLmtuGb5bOdbDJA/thumb.png?15071538635",
				width: 388
			},
			textPosition: {
				"harm3": [-22, -35],
				"harm2_1": [-22, 0],
				"harm2_2": [-22, 23],
				"harm1_1": [-22, 46],
				"harm1_2": [-22, 69]
			},
			textStyle: {
				color: "rgb(0, 0, 0)",
				font_family: "Shadows Into Light",
				font_size: 16,
			}
		},
		defaultConfig = {
			autoclock: true,
			clocksize: 52,
			position: [200, 300],
			publicclocks: false,
		},
		// Utility functions
		checkInstall = () => {
			if (!state.BladesCompanion) {
				sendWelcomeMessage();
				state.BladesCompanion = {
					data: [],
					harmData: [],
					config: Object.assign({}, defaultConfig)
				};
			} else if (!("publicclocks" in state.BladesCompanion.config)) {
				state.BladesCompanion.config.publicclocks = false;
			}
			myState = state.BladesCompanion;
			dataCleanup();
			log(`-=> Blades in the Dark Companion Script v${version} <=-`);
		},
		sendChatMessage = (playerid, content) => {
			const divWrapper = text => {
					return `<div style="border:1px solid #888;border-radius:5px;background:#eee;
					padding:1px 3px;margin-left:-12px;">${text}</div>`.replace(/\n\t*/g, " ");
				},
				getWhisperPrefix = id => {
					const player = getObj("player", id || "");
					if (player && player.get("_displayname")) {
						return `/w "${player.get("_displayname")}" `;
					} else return "/w GM ";
				};
			sendChat("Blades", getWhisperPrefix(playerid) + divWrapper(content), null, {
				noarchive: true
			});
		},
		sendWelcomeMessage = () => {
			const output = `<h3>Blades in the Dark Companion Script</h3>
				Welcome to the Blades in the Dark companion script. 
				To get started, enter *!blades* in chat.`;
			sendChatMessage("", output);
		},
		createChatLink = (text, ref) => {
			return `<a style="color:#333;font-weight:bold;margin:2px;padding:1px 3px;background:transparent;border-color:black"
				href="!blades ${ref.replace(/"/g, "&" + "quot" + ";")}">${text}</a>`;
		},
		generateUUID = (() => {
			var a = 0,
				b = [];
			return () => {
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
		})(),
		generateRowID = () => {
			return generateUUID().replace(/_/g, "Z");
		},
		getOrCreateAttribute = (charid, name, current) => {
			return findObjs({
				characterid: charid,
				name: name,
				type: "attribute"
			}, {
				caseInsensitive: true
			})[0] || createObj("attribute", {
				characterid: charid,
				current: current,
				name: name
			});
		},
		checkPermission = (playerid, character, silent) => {
			const control = character && character.get("controlledby").split(/,/);
			if (!playerIsGM(playerid) && control && !control.includes("all") && !control.includes(playerid)) {
				if (!silent) sendChatMessage(playerid, "Permission denied.");
				return false;
			} else {
				return true;
			}
		},
		getGenericTokenData = (playerid) => {
			const data = {
				showplayers_name: true,
				showname: true,
				isdrawing: true,
				layer: "objects",
				left: myState.config.position[0],
				top: myState.config.position[1]
			};
			data._pageid = playerIsGM(playerid) ?
				(getObj("player", playerid).get("_lastpage") || Campaign().get("playerpageid")) :
				Campaign().get("playerpageid");
			return data;
		},
		getClockTokenData = (size, label, charID, playerid, current) => {
			current = (current && Number.isFinite(current) && Number(current) <= Number(size)) ? current : 0;
			const data = Object.assign(getGenericTokenData(playerid), {
				currentSide: 0,
				height: myState.config.clocksize,
				name: label,
				sides: clockData[size].map(encodeURIComponent).join("|"),
				width: myState.config.clocksize
			});
			data.currentSide = current;
			data.imgsrc = clockData[size][current];
			if (charID) data.represents = charID;
			else data.controlledby = playerid;
			return data;
		},
		getBarTokenData = (type, charID, initial, playerid) => {
			return Object.assign(getGenericTokenData(playerid),
				barData[type].dimensions, {
					currentSide: 0,
					imgsrc: barData[type].images[Math.max(Math.min(initial, barData[type].images.length - 1), 0)],
					name: getObj("character", charID).get("name"),
					represents: charID,
					sides: barData[type].images.map(encodeURIComponent).join("|")
				});
		},
		// Output functions
		constructQueries = (playerid) => {
			const validChars = findObjs({
					_type: "character"
				})
					.filter(character => checkPermission(playerid, character, true)),
				charsPresent = validChars.length > 0,
				idTargetQuery = `?{For which character?|${
					validChars.map(ch => `${ch.get("name")},${ch.id}`).join("|")
				}}`,
				clockTargetQuery = `?{Linked to which character?|${
					["None,none", ...validChars.map(ch => `${ch.get("name")},char ${ch.id}`)].join("|")
				}}`,
				sizeQuery = "?{Size?|4|6|8|10|12}",
				barQuery = `?{Type?|${Object.keys(barData).join("|")}}`;
			return {
				BarQuery: barQuery,
				CharsPresent: charsPresent,
				ClockQuery: clockTargetQuery,
				IdQuery: idTargetQuery,
				SizeQuery: sizeQuery
			};
		},
		showConfigMenu = (playerid) => {
			const config = myState.config,
				offOn = config.autoclock ? "off" : "on",
				output = "<h3>BladesCompanion Config</h3>" +
				`<p>The position for new clocks and bars is currently [${
					config.position[0]}, ${config.position[1]}]. ${
					createChatLink("Change", "config position ?{X position} ?{Y position}")}</p>` +
				`<p>The default size for created clocks is currently ${config.clocksize}px. ${
					createChatLink("Change", "config clocksize ?{New size in pixels?}")}</p>` +
				"<p>Creation of new clocks on the tabletop whenever one is created on the sheet is " +
				`currently turned <strong>${config.autoclock ? "on" : "off"}</strong>. ${
					createChatLink(`Turn ${offOn}`, `config autoclock ${offOn}`)}</p>` +
				"<p>Newly-created clocks not linked to a specific character are controllable by " +
				`<strong>${config.publicclocks ? "everyone" : "their creator and the GM"}</strong>. ${
					createChatLink("Toggle", `config publicclocks ${config.publicclocks ? "off" : "on"}`)}</p>`;
			sendChatMessage(playerid, output);
		},
		showMenu = (playerid) => {
			const qData = constructQueries(playerid),
				output = "<h3>BladesCompanion Menu</h3>" +
				createChatLink("Add a clock", `add-clock ${qData.SizeQuery} ${qData.ClockQuery} ?{Name}`) +
				(qData.CharsPresent ? createChatLink("Add a bar", `add-bar ${qData.BarQuery} ${qData.IdQuery} ` +
					"?{Attribute name? stress, trauma, heat, or wanted are probably good choices}") : "") +
				(qData.CharsPresent ? createChatLink("Add harm tracker", `add-harm-tracker ${qData.IdQuery}`) : "") +
				(qData.CharsPresent ? createChatLink("Add clocks from the sheet", `add-sheet-clocks ${qData.IdQuery}`) : "") +
				createChatLink("Create/update macro for adding clocks", "clock-macro") +
				(playerIsGM(playerid) ?
					createChatLink("Create/update macro for adding clocks for all players", "clock-macro all") : "") +
				createChatLink("Show synchronized attributes", "show") +
				(playerIsGM(playerid) ?
					createChatLink("Access configuration", "config-menu") : "") +
				createChatLink("Show help", "help");
			sendChatMessage(playerid, output);
		},
		showState = (playerid) => {
			const normalLinks = myState.data.filter(v => checkPermission(playerid, getObj("character", v.character), true))
				.map(v => `<tr><td>${getObj("character", v.character).get("name")}</td><td>${v.attribute}</td></tr>`).join("");
			const harmLinks = myState.harmData.filter(v => checkPermission(playerid, getObj("character", v.character), true))
				.map(v => `<tr><td>${getObj("character", v.character).get("name")}</td></tr>`).join("");
			const config = Object.entries(myState.config)
				.map(([k, v]) => `<tr><td><b>${k}</b>:</td><td>${v}</td></tr>`).join("");
			const output = `<table style="padding:3px;width:100%">
					<caption style="font-size: 1.1em;font-weight:bold">Synchronisation data</caption>
					<tr><th>Character</th><th>Attribute name</th>
					${normalLinks}
				</table>
				<table style="padding:3px;width:100%">
					<caption style="font-size: 1.1em;font-weight:bold">Harm trackers</caption>
					${harmLinks}
				</table>
				<table style="padding:3px;width:100%">
					<caption style="font-size: 1.1em;font-weight:bold">Configuration</caption>
					${config}
				</table>`;
			sendChatMessage(playerid, output);
		},
		showHelp = (playerid) => {
			const output = `<h3>BladesCompanion v${version}</h3>
				<p>Credit for all graphics goes to Chris McDonald, originally inspired by Sven Düsterwald.</p>
				<h4>CONFIGURATION</h4>
				<ol>
					<li>You can change the URLs in the clockData and barData variables to use different graphics. Due to Roll20 restrictions, they need to be images uploaded to your Roll20 library, and it needs to be the "thumb" size variant.</li>
					<li>The GM configure the script via the following commands (or enter **!blades config-menu** for a graphical menu):
						<ol>
							<li>**!blades config autoclock [on|off]** will turn automatic creation of clocks on the tabletop on or off, respectively (if one is created in a character sheet).</li>
							<li>**!blades config publicclocks [on|off]** will toggle if clocks linked to no character will be controllable by everyone or only their creator and the GM.</li>
							<li>**!blades config clocksize [size]** will set the size for new clocks to [size] pixels (square).</li>
							<li>**!blades config position [x] [y]** will set the position of newly created tokens to the specified [x] and [y] coordinates. Defaults to 200 and 300.</li>
						</ol>
					</li>
				</ol>
				<h4>USAGE</h4>
				<p>Any tokens created by this command will be created on the page you are currently on (if a GM), or on the page the player badge is currently on (otherwise).</p>
				<p>Adding a clock to a character sheet and naming it will automatically create a linked clock on the tabletop. Be careful to set the size first, and then the name, since the size will be locked in once the name has been entered. You can turn this behaviour off via the config command above.</p>
				<p>The following chat commands are available:</p>
				<ul>
					<li>**!blades add-clock &lt;size&gt; none &lt;name&gt;**<br>
						Creates a new clock of size &lt;size&gt; with name &lt;name&gt; on the tabletop. This clock is not linked to any clock on a character sheet. Example:<br>
						!blades add-clock 8 none Drive off the Red Sashes gang
					</li>
					<li>**!blades add-clock &lt;size&gt; char &lt;charid&gt; &lt;name&gt;**<br>
						Creates a new clock of size &lt;size&gt; on the tabletop, linked to the character with id &lt;charid&gt;, with name &lt;name&gt;. If the sheet is a character sheet, it will be put on the character page, if it is a crew sheet, it will be put on the crew page. "Linked" means that changes in either of the clocks will effect changes in the other one. Example:<br>
						!blades add-clock 6 char &#64;{Silver|character_id} Research demon binding</li>
					<li>**!blades add-bar &lt;type&gt; &lt;charid&gt; &lt;attrname&gt;**<br>
						Creates a new bar of type &lt;type&gt; on the tabletop, linked to the attribute &lt;attrname&gt; of the character with id &lt;charid&gt;. Available types are stress, stress10, stress11, stress12, trauma, and trauma5. Example:<br>
						!blades add-bar stress &#64;{Canter Haig|character_id} stress<br>
						!blades add-bar stress &#64;{Bloodletters|character_id} heat<br>
						!blades add-bar trauma &#64;{Canter Haig|character_id} trauma<br>
						!blades add-bar trauma &#64;{Bloodletters|character_id} wanted
					</li>
					<li>**!blades add-by-token &lt;attrname&gt;**<br>
						Starts to link the selected rollable table side with the attribute &lt;attrname&gt; of the character that the rollable table token represents. Example:<br>
						!blades add-by-token stress<br>
						!blades add-by-token trauma
					</li>
					<li>**!blades add-by-id &lt;charid&gt; &lt;attrname&gt;**<br>
						Starts to link the selected rollable table side with the attribute &lt;attrname&gt; of the character with id &lt;charid&gt;. Example:<br>
						!blades add-by-id &#64;{Silver|character_id} stress<br>
						!blades add-by-id &#64;{Silver|character_id} trauma
					</li>
					<li>**!blades add-by-table &lt;charid&gt; &lt;tablename&gt; &lt;attrname&gt;**<br>
						Creates a new token from the rollable table with name &lt;tablename&gt;, linked with attribute &lt;attrname&gt; of the character with id &lt;charid&gt;. Example:<br>
						!blades add-by-table &#64;{Silver|character_id} stress stress
					</li>
					<li>**!blades add-harm-tracker &lt;charid&gt;**<br>
						Creates a harm tracker on the tabletop for character with the specified id.
					</li>
					<li>**!blades clock-macro**<br>
						Creates (or updates) a macro for you which allows for easy creation of clocks on the tabletop via queries. The GM can also use **!blades clock-macro all** to create such a macro for every player.
					</li>
					<li>**!blades show**<br>
						Shows all currently active links between tokens and character atributes.
					</li>
					<li>**!blades config-menu**<br>
						Shows a menu to access configuration options.
					</li>
					<li>**!blades remove**<br>
						Removes any link for the currently selected tokens.
					</li>
					<li>**!blades reset**<br>
						Clears all links between tokens and attributes.
					</li>
					<li>**!blades help**<br>
						Shows this help screen.
					</li>
					<li>**!blades menu**, or just **!blades**<br>
						Shows a handy menu containing the most common options.
					</li>
				</ul>`;
			sendChatMessage(playerid, output);
		},
		// Workhorse functions
		resetState = (playerid) => {
			if (!playerIsGM(playerid)) sendChatMessage(playerid, "Permission denied.");
			else {
				state.BladesCompanion = {
					data: [],
					harmData: [],
					config: Object.assign({}, defaultConfig)
				};
				myState = state.BladesCompanion;
				sendChatMessage(playerid, "State cleared, everything reset to default.");
			}
		},
		updateClockMacro = (playerid, arg) => {
			const IDs = (playerIsGM(playerid) && arg === "all") ?
				findObjs({
					_type: "player",
				}).map(p => p.id) : [playerid];
			IDs.forEach(id => {
				const qData = constructQueries(id),
					macro = findObjs({
						_type: "macro",
						_playerid: id,
						name: "Add-Clock"
					})[0] || createObj("macro", {
						_playerid: id,
						name: "Add-Clock"
					});
				macro.set("action", `!blades add-clock ${qData.SizeQuery} ${qData.ClockQuery} ?{Name}`);
				sendChatMessage(id, "Add-Clock macro created (or updated).");
			});
		},
		createClockFromAttribute = (attribute, toggle, passedSize) => {
			const clockRE = /^(repeating_(?:clock|crewclock|factionclock)_(?:[A-Za-z0-9-]+?))_(name|size)/,
				match = attribute.get("name").match(clockRE),
				charID = attribute.get("characterid"),
				character = getObj("character", charID);
			// Don't create clocks for GM-only characters
			if (!character.get("controlledby")) return;
			// Attribute is a clock name
			else if (toggle && match && match[2] === "name") {
				const size = passedSize || getAttrByName(charID, `${match[1]}_size`),
					progress = parseInt(getAttrByName(charID, `${match[1]}_progress`)) || 0;
				getOrCreateAttribute(charID, `${match[1]}_progress`, progress);
				if (clockData[size]) {
					const token = createObj("graphic", getClockTokenData(size, attribute.get("current"), charID, 0, progress));
					toFront(token);
					myState.data.push({
						character: charID,
						token: token.id,
						attribute: `${match[1]}_progress`.toLowerCase()
					});
					sendChatMessage(null, `New ${size}-clock added for character ${character.get("name")}.`);
				}
			}
			// Attribute is clock size
			else if (toggle && match && match[2] === "size") {
				const nameAttr = findObjs({
					characterid: charID,
					name: `${match[1]}_name`,
					type: "attribute"
				})[0];
				if (nameAttr) createClockFromAttribute(nameAttr, true, attribute.get("current"));
			}
		},
		addBar = (playerid, errors, type, charid, attrName) => {
			if (type in barData && getObj("character", charid) && attrName) {
				const character = getObj("character", charid);
				if (checkPermission(playerid, character)) {
					const currentValue = parseInt(getAttrByName(charid, attrName)) || 0,
						token = createObj("graphic", getBarTokenData(type, charid, currentValue, playerid));
					toFront(token);
					getOrCreateAttribute(charid, attrName, currentValue);
					myState.data.push({
						character: charid,
						token: token.id,
						attribute: attrName.toLowerCase()
					});
					sendChatMessage(playerid, `New bar of type ${type} added for attribute ${attrName} and character ${character.get("name")}.`);
				}
			} else errors.add(true);
		},
		addClock = (playerid, errors, args) => {
			const size = args[0],
				target = args[1],
				charID = (target === "char") ? args[2] : false,
				label = args.slice((target === "char") ? 3 : 2).join(" ");
			if (size in clockData && (!charID || getObj("character", charID))) {
				if (charID && !checkPermission(playerid, getObj("character", charID))) return;
				const clockControl = (myState.config.publicclocks) ? "all" : playerid,
					token = createObj("graphic", getClockTokenData(size, label, charID, clockControl));
				toFront(token);
				if (charID) {
					const rowID = generateRowID(),
						sectionName = (type => {
							if (type === "crew") return "crewclock";
							if (type === "faction") return "factionclock";
							else return "clock";
						})(getAttrByName(charID, "sheet_type")),
						attrName = `repeating_${sectionName}_${rowID}_progress`;
					createObj("attribute", {
						characterid: charID,
						name: `repeating_${sectionName}_${rowID}_size`,
						current: size
					});
					createObj("attribute", {
						characterid: charID,
						name: attrName,
						current: "0"
					});
					createObj("attribute", {
						characterid: charID,
						name: `repeating_${sectionName}_${rowID}_name`,
						current: label
					});
					myState.data.push({
						character: charID,
						token: token.id,
						attribute: attrName.toLowerCase()
					});
					sendChatMessage(playerid, `New ${size}-clock added for ${getObj("character", charID).get("name")}.`);
				} else {
					sendChatMessage(playerid, `New ${size}-clock added.`);
				}
			} else errors.add(true);
		},
		addSheetClocks = (playerid, errors, charid) => {
			if (charid) {
				const character = getObj("character", charid);
				if (checkPermission(playerid, character)) {
					findObjs({
						_type: "attribute",
						_characterid: charid
					})
						.filter(attr => /name$/g.test(attr.get("name")))
						.forEach(attr => createClockFromAttribute(attr, true));
				}
			} else errors.add(true);
		},
		addHarmTracker = (playerid, charid) => {
			if (charid) {
				const character = getObj("character", charid);
				if (checkPermission(playerid, character)) {
					const tokenData = Object.assign(getGenericTokenData(playerid), harmData.table, {
						layer: "map",
						name: character.get("name")
					});
					const token = createObj("graphic", tokenData);
					toFront(token);
					myState.harmData.push({
						character: charid,
						token: token.id
					});
					updateHarmText(myState.harmData[myState.harmData.length - 1]);
				}
			}
		},
		updateHarmText = (data, attr) => {
			const token = getObj("graphic", data.token);
			if (!token) return;
			Object.entries(harmData.textPosition).forEach(([name, coords]) => {
				const text = getObj("text", data[name]) || createObj("text", {
						_pageid: token.get("_pageid"),
						layer: token.get("layer")
					}),
					newText = (attr && attr.get("name") === name) ? attr.get("current") : getAttrByName(data.character, name);
				data[name] = text.id;
				text.set(Object.assign({
					layer: token.get("layer"),
					left: token.get("left") + coords[0],
					rotation: 0,
					text: newText,
					top: token.get("top") + coords[1],
				}, harmData.textStyle));
				toFront(text);
			});
		},
		handleConfig = (playerid, errors, args) => {
			if (!playerIsGM(playerid)) {
				sendChatMessage(playerid, "Permission denied.");
			} else if (args[0] === "autoclock") {
				if (args[1] === "on") {
					myState.config.autoclock = true;
					sendChatMessage(playerid, "Automatic clock creation turned <strong>on</strong>.");
				} else if (args[1] === "off") {
					myState.config.autoclock = false;
					sendChatMessage(playerid, "Automatic clock creation turned <strong>off</strong>.");
				} else errors.add(true);
			} else if (args[0] === "publicclocks") {
				if (args[1] === "on") {
					myState.config.publicclocks = true;
					sendChatMessage(playerid, "Publicly controllable clocks turned <strong>on</strong>.");
				} else if (args[1] === "off") {
					myState.config.publicclocks = false;
					sendChatMessage(playerid, "Publicly controllable clocks turned <strong>off</strong>.");
				} else errors.add(true);
			} else if (args[0] === "position") {
				const x = parseInt(args[1]),
					y = parseInt(args[2]);
				if (isFinite(x) && isFinite(y)) {
					myState.config.position = [x, y];
					sendChatMessage(playerid, `New default position for tokens is [${x},${y}].`);
				} else errors.add(true);
			} else if (args[0] === "clocksize") {
				const size = parseInt(args[1]);
				if (isFinite(size)) {
					myState.config.clocksize = size;
					sendChatMessage(playerid, `New default size for clocks is ${size}px.`);
				} else errors.add(true);
			} else errors.add(true);
		},
		addToSync = (playerid, errors, token, character, attrName) => {
			if (token && token.get("sides") && attrName && character) {
				myState.data.push({
					character: character.id,
					token: token.id,
					attribute: attrName.toLowerCase()
				});
				sendChatMessage(playerid, `Synchronization added for attribute ${attrName} and character ${character.get("name")}.`);
			} else errors.add(true);
		},
		addFromTable = (playerid, errors, charid, tableName, attrName) => {
			const character = getObj("character", charid);
			const table = findObjs({
				type: "rollabletable",
				name: tableName
			}, {
				caseInsensitive: true
			})[0];

			if (checkPermission(playerid) && table && attrName) {
				const sides = findObjs({
					type: "tableitem",
					_rollabletableid: table.id
				})
					.map(x => x.get("avatar"))
					.filter(x => !!x)
					.map(x => x.replace(/max|med/, "thumb"));

				if (sides.length) {
					const currentValue = parseInt(getAttrByName(charid, attrName)) || 0;
					const tokenData = Object.assign(getGenericTokenData(playerid), {
						currentSide: Math.max(Math.min(currentValue, sides.length - 1), 0),
						height: 70,
						imgsrc: sides[Math.max(Math.min(currentValue, sides.length - 1), 0)],
						name: character.get("name"),
						represents: character.id,
						sides: sides.map(encodeURIComponent).join("|"),
						width: 70
					});
					const token = createObj("graphic", tokenData);
					if (!token) {
						sendChatMessage(playerid, "Token creation failed. Perhaps the images are not all in your library?");
					} else {
						toFront(token);
						getOrCreateAttribute(charid, attrName.toLowerCase(), currentValue);
						myState.data.push({
							character: charid,
							token: token.id,
							attribute: attrName.toLowerCase()
						});
						sendChatMessage(playerid, `New token from table ${table.get("name")} added for ` +
							`attribute ${attrName} and character ${character.get("name")}.`);
					}
				} else errors.add(true);
			} else errors.add(true);
		},
		removeSelectedFromSync = (playerid, selected) => {
			myState.data = myState.data.filter(v => {
				if (selected.map(o => o._id).includes(v.token)) {
					const charName = getObj("character", v.character).get("name");
					sendChatMessage(playerid, `Synchronization removed for attribute ${v.attribute} and character ${charName}.`);
					return false;
				} else return true;
			});
			myState.harmData = myState.harmData.filter(v => {
				if (selected.map(o => o._id).includes(v.token)) {
					const charName = getObj("character", v.character).get("name");
					sendChatMessage(playerid, `Harm box removed for character ${charName}.`);
					return false;
				} else return true;
			});
		},
		// Event handlers
		handleInput = (msg) => {
			if (msg.type === "api" && /^!blades/.test(msg.content)) {
				const args = msg.content.split(" ").slice(1) || [""],
					errors = new Set();
				switch (args.shift()) {
				case "config":
					handleConfig(msg.playerid, errors, args);
					break;
				case "add-by-id":
					if (args[0] && args[1] && msg.selected) {
						msg.selected.forEach(o => {
							const token = getObj("graphic", o._id),
								character = getObj("character", args[0]);
							if (checkPermission(msg.playerid, character)) {
								addToSync(msg.playerid, errors, token, character, args[1].toLowerCase());
							}
						});
					} else errors.add(true);
					break;
				case "add-by-token":
					if (args[0] && msg.selected) {
						msg.selected.forEach(o => {
							const token = getObj("graphic", o._id),
								character = getObj("character", token.get("represents"));
							addToSync(msg.playerid, errors, token, character, args[0].toLowerCase());
						});
					} else errors.add(true);
					break;
				case "add-by-table":
					addFromTable(msg.playerid, errors, ...args);
					break;
				case "add-bar":
					addBar(msg.playerid, errors, ...args);
					break;
				case "add-clock":
					addClock(msg.playerid, errors, args);
					break;
				case "add-sheet-clocks":
					addSheetClocks(msg.playerid, errors, args[0]);
					break;
				case "add-harm-tracker":
					addHarmTracker(msg.playerid, args[0]);
					break;
				case "remove":
					removeSelectedFromSync(msg.playerid, msg.selected || []);
					break;
				case "clock-macro":
					updateClockMacro(msg.playerid, args[0]);
					break;
				case "show":
					showState(msg.playerid);
					break;
				case "config-menu":
					showConfigMenu(msg.playerid);
					break;
				case "reset":
					resetState(msg.playerid);
					break;
				case "help":
					showHelp(msg.playerid);
					break;
				default:
					showMenu(msg.playerid);
				}
				if (errors.has(true)) sendChatMessage(msg.playerid, "Something went wrong with your command.");
			}
		},
		handleLinkedSideChange = (token) => {
			myState.data.filter(v => (v.token === token.id)).forEach((data) => {
				const attr = getOrCreateAttribute(data.character, data.attribute, 0);
				attr.set("current", token.get("currentSide"));
			});
		},
		handleLinkedAttributeChange = (attr) => {
			myState.data.filter(v => {
				return (v.character === attr.get("characterid")) && (v.attribute === attr.get("name").toLowerCase());
			}).forEach((data) => {
				const token = getObj("graphic", data.token);
				if (token) {
					const sides = token.get("sides").split("|");
					const current = Math.max(Math.min(parseInt(attr.get("current")) || 0, sides.length - 1), 0);
					const newImgSrc = decodeURIComponent(sides[current]).replace(/(?:max|med|original)\./, "thumb.");

					token.set({
						currentSide: current,
						imgsrc: newImgSrc
					});
				}
			});
		},
		dataCleanup = () => {
			setTimeout(() => {
				myState.data = myState.data.filter(v => {
					return (getObj("graphic", v.token) && getObj("character", v.character) &&
						findObjs({
							characterid: v.character,
							name: v.attribute,
							type: "attribute"
						}, {
							caseInsensitive: true
						}).length);
				});
				myState.harmData = myState.harmData.filter(v => {
					return (getObj("graphic", v.token) && getObj("character", v.character));
				});
			}, 1000);
		},
		handleTextChange = (text, remove) => {
			const data = myState.harmData.find(o => Object.values(o).includes(text.id));
			if (data) {
				const attrName = Object.entries(data).find(([, id]) => text.id === id)[0],
					newText = remove ? "" : text.get("text"),
					attr = getOrCreateAttribute(data.character, attrName, "");
				attr.set("current", newText);
				updateHarmText(data);
			}
		},
		updateHarmFromToken = (token) => {
			myState.harmData.filter(o => o.token === token.id).forEach(updateHarmText);
		},
		updateHarmFromAttr = (attr) => {
			if (/^harm(?:3|2_1|2_2|1_1|1_2)$/.test(attr.get("name"))) {
				myState.harmData.filter(o => o.character === attr.get("_characterid"))
					.forEach(data => updateHarmText(data, attr));
			}
		},
		registerEventHandlers = () => {
			// Chat commands
			on("chat:message", handleInput);
			// Synchronise between token side and attribute
			on("change:graphic:currentSide", handleLinkedSideChange);
			on("change:attribute", handleLinkedAttributeChange);
			on("add:attribute", handleLinkedAttributeChange);
			// Handle harm attribute and position change
			on("change:graphic:left", updateHarmFromToken);
			on("change:graphic:top", updateHarmFromToken);
			on("change:graphic:layer", updateHarmFromToken);
			on("change:attribute", updateHarmFromAttr);
			on("add:attribute", updateHarmFromAttr);
			on("change:text", t => handleTextChange(t));
			on("destroy:text", p => handleTextChange(p, true));
			// Clock creation
			on("add:attribute", attr => createClockFromAttribute(attr, myState.config.autoclock));
			// Cleanup when removing tokens, attributes, or characters
			on("destroy:graphic", dataCleanup);
			on("destroy:character", dataCleanup);
			on("destroy:attribute", dataCleanup);
		};
	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
})();
on("ready", () => {
	"use strict";
	bladesCompanion.CheckInstall();
	bladesCompanion.RegisterEventHandlers();
});
