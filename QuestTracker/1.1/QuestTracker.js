// Github:	 https://github.com/boli32/QuestTracker/blob/main/QuestTracker.js
// By:		 Boli (Steven Wrighton): Professional Software Developer, Enthusiatic D&D Player since 1993.
// Contact:	 https://app.roll20.net/users/3714078/boli
// Readme	 https://github.com/boli32/QuestTracker/blob/main/README.md 


var QuestTracker = QuestTracker || (function () {
	'use strict';
	const getCalendarAndWeatherData = () => {
		let CALENDARS = {};
		let WEATHER = {};
		if (state.CalenderData) {
			if (state.CalenderData.CALENDARS) CALENDARS = state.CalenderData.CALENDARS;
			if (state.CalenderData.WEATHER) WEATHER = state.CalenderData.WEATHER;
		}
		if (state.QUEST_TRACKER?.calendar) Object.assign(CALENDARS, state.QUEST_TRACKER.calendar);
		return { CALENDARS, WEATHER };
	};
	const { CALENDARS, WEATHER } = getCalendarAndWeatherData();
	const statusMapping = {
		1: 'Unknown',
		2: 'Discovered',
		3: 'Started',
		4: 'Ongoing',
		5: 'Completed',
		6: 'Completed By Someone Else',
		7: 'Failed',
		8: 'Time ran out',
		9: 'Ignored'
	};
	const frequencyMapping = {
		1: "Daily",
		2: "Weekly",
		3: "Monthly",
		4: "Yearly"
	}
	let QUEST_TRACKER_verboseErrorLogging = true;
	let QUEST_TRACKER_globalQuestData = {};
	let QUEST_TRACKER_globalQuestArray = [];
	let QUEST_TRACKER_globalRumours = {};
	let QUEST_TRACKER_Events = {};
	let QUEST_TRACKER_Calendar = {};
	let QUEST_TRACKER_Triggers = {};
	let QUEST_TRIGGER_DeleteList = [];
	let QUEST_TRACKER_TriggerConversion = false;
	let QUEST_TRACKER_QuestHandoutName = "QuestTracker Quests";
	let QUEST_TRACKER_RumourHandoutName = "QuestTracker Rumours";
	let QUEST_TRACKER_EventHandoutName = "QuestTracker Events";
	let QUEST_TRACKER_WeatherHandoutName = "QuestTracker Weather";
	let QUEST_TRACKER_CalendarHandoutName = "QuestTracker Calendar";
	let QUEST_TRACKER_TriggersHandoutName = "QuestTracker Triggers";
	let QUEST_TRACKER_rumoursByLocation = {};
	let QUEST_TRACKER_readableJSON = true;
	let QUEST_TRACKER_pageName = "Quest Tree Page";
	let QUEST_TRACKER_TreeObjRef = {};
	let QUEST_TRACKER_questGrid = [];
	let QUEST_TRACKER_jumpGate = true;
	let QUEST_TRACKER_BASE_QUEST_ICON_URL = ''; // add your own image here.
	let QUEST_TRACKER_ROLLABLETABLE_QUESTS = "qt-quests";
	let QUEST_TRACKER_ROLLABLETABLE_QUESTGROUPS = "qt-quest-groups";
	let QUEST_TRACKER_ROLLABLETABLE_LOCATIONS = "qt-locations";
	let QUEST_TRACKER_calenderType = 'gregorian';
	let QUEST_TRACKER_currentDate = CALENDARS[QUEST_TRACKER_calenderType]?.defaultDate;
	let QUEST_TRACKER_defaultDate = CALENDARS[QUEST_TRACKER_calenderType]?.defaultDate;
	let QUEST_TRACKER_currentWeekdayName = "Thursday";
	let QUEST_TRACKER_Location = 'northern temperate';
	let QUEST_TRACKER_WeatherLocation = 'plains';
	let QUEST_TRACKER_CURRENT_WEATHER = "";
	let QUEST_TRACKER_FILTER = {};
	let QUEST_TRACKER_RUMOUR_FILTER = {};
	let QUEST_TRACKER_FILTER_Visbility = false;
	let QUEST_TRACKER_imperialMeasurements = {
		temperature: false,
		precipitation: false,
		wind: true,
		visibility: true
	};
	let QUEST_TRACKER_WEATHER_TRENDS = {
		dry: 0,
		wet: 0,
		heat: 0,
		cold: 0,
		wind: 0,
		humid: 0,
		visibility: 0,
		cloudy: 0
	};
	let QUEST_TRACKER_FORCED_WEATHER_TRENDS = {
		dry: false,
		wet: false,
		heat: false,
		cold: false,
		wind: false,
		humid: false,
		visibility: false,
		cloudy: false
	};
	let QUEST_TRACKER_HISTORICAL_WEATHER = {};
	let QUEST_TRACKER_WEATHER_DESCRIPTION = {};
	let QUEST_TRACKER_WEATHER = true;
	const loadQuestTrackerData = () => {
		initializeQuestTrackerState();
		QUEST_TRACKER_verboseErrorLogging = state.QUEST_TRACKER.verboseErrorLogging || true;
		QUEST_TRACKER_globalQuestData = state.QUEST_TRACKER.globalQuestData;
		QUEST_TRACKER_globalQuestArray = state.QUEST_TRACKER.globalQuestArray;
		QUEST_TRACKER_globalRumours = state.QUEST_TRACKER.globalRumours;
		QUEST_TRACKER_rumoursByLocation = state.QUEST_TRACKER.rumoursByLocation;
		QUEST_TRACKER_readableJSON = state.QUEST_TRACKER.readableJSON || true;
		QUEST_TRACKER_TreeObjRef = state.QUEST_TRACKER.TreeObjRef || {};
		QUEST_TRACKER_questGrid = state.QUEST_TRACKER.questGrid || [];
		QUEST_TRACKER_jumpGate = state.QUEST_TRACKER.jumpGate || true;
		QUEST_TRACKER_Events = state.QUEST_TRACKER.events || {};
		QUEST_TRACKER_Calendar = state.QUEST_TRACKER.calendar || {};
		QUEST_TRACKER_Triggers = state.QUEST_TRACKER.triggers || {};
		QUEST_TRACKER_TriggerConversion = state.QUEST_TRACKER.triggerConversion || false;
		QUEST_TRACKER_calenderType = state.QUEST_TRACKER.calenderType || 'gregorian';
		QUEST_TRACKER_currentDate = state.QUEST_TRACKER.currentDate || CALENDARS[QUEST_TRACKER_calenderType]?.defaultDate
		QUEST_TRACKER_defaultDate = state.QUEST_TRACKER.defaultDate || CALENDARS[QUEST_TRACKER_calenderType]?.defaultDate
		QUEST_TRACKER_Location = state.QUEST_TRACKER.location || 'northern temperate';
		QUEST_TRACKER_WeatherLocation = state.QUEST_TRACKER.weatherLocation || 'plains';
		QUEST_TRACKER_currentWeekdayName = state.QUEST_TRACKER.currentWeekdayName || 'Thursday';
		QUEST_TRACKER_FILTER = state.QUEST_TRACKER.filter || {};
		QUEST_TRACKER_RUMOUR_FILTER = state.QUEST_TRACKER.rumourFilter || {};
		QUEST_TRACKER_FILTER_Visbility = state.QUEST_TRACKER.filterVisibility || false;
		QUEST_TRACKER_WEATHER_TRENDS = state.QUEST_TRACKER.weatherTrends || {
			dry: 0,
			wet: 0,
			heat: 0,
			cold: 0,
			wind: 0,
			humid: 0,
			visibility: 0,
			cloudy: 0
		};
		QUEST_TRACKER_FORCED_WEATHER_TRENDS = state.QUEST_TRACKER.forcedWeatherTrends || {
			dry: false,
			wet: false,
			heat: false,
			cold: false,
			wind: false,
			humid: false,
			visibility: false,
			cloudy: false
		};
		QUEST_TRACKER_CURRENT_WEATHER = state.QUEST_TRACKER.currentWeather;
		QUEST_TRACKER_HISTORICAL_WEATHER = state.QUEST_TRACKER.historicalWeather || {};
		QUEST_TRACKER_WEATHER_DESCRIPTION = state.QUEST_TRACKER.weatherDescription || {};
		QUEST_TRACKER_WEATHER = state.QUEST_TRACKER.weather || true;
		QUEST_TRACKER_imperialMeasurements = state.QUEST_TRACKER.imperialMeasurements || {
			temperature: false,
			precipitation: false,
			wind: true,
			visibility: true
		}
	};
	const saveQuestTrackerData = () => {
		state.QUEST_TRACKER.verboseErrorLogging = QUEST_TRACKER_verboseErrorLogging;
		state.QUEST_TRACKER.globalQuestData = QUEST_TRACKER_globalQuestData;
		state.QUEST_TRACKER.globalQuestArray = QUEST_TRACKER_globalQuestArray;
		state.QUEST_TRACKER.globalRumours = QUEST_TRACKER_globalRumours;	
		state.QUEST_TRACKER.rumoursByLocation = QUEST_TRACKER_rumoursByLocation;
		state.QUEST_TRACKER.readableJSON = QUEST_TRACKER_readableJSON;
		state.QUEST_TRACKER.questGrid = QUEST_TRACKER_questGrid;
		state.QUEST_TRACKER.jumpGate = QUEST_TRACKER_jumpGate;
		state.QUEST_TRACKER.events = QUEST_TRACKER_Events;
		state.QUEST_TRACKER.calendar = QUEST_TRACKER_Calendar;
		state.QUEST_TRACKER.triggers = QUEST_TRACKER_Triggers;
		state.QUEST_TRACKER.triggerConversion = QUEST_TRACKER_TriggerConversion;
		state.QUEST_TRACKER.currentDate = QUEST_TRACKER_currentDate;
		state.QUEST_TRACKER.defaultDate = QUEST_TRACKER_defaultDate;
		state.QUEST_TRACKER.calenderType = QUEST_TRACKER_calenderType;
		state.QUEST_TRACKER.location = QUEST_TRACKER_Location;
		state.QUEST_TRACKER.weatherLocation = QUEST_TRACKER_WeatherLocation;
		state.QUEST_TRACKER.currentWeekdayName = QUEST_TRACKER_currentWeekdayName;
		state.QUEST_TRACKER.currentWeather = QUEST_TRACKER_CURRENT_WEATHER;
		state.QUEST_TRACKER.weatherTrends = QUEST_TRACKER_WEATHER_TRENDS;
		state.QUEST_TRACKER.forcedWeatherTrends = QUEST_TRACKER_FORCED_WEATHER_TRENDS;
		state.QUEST_TRACKER.historicalWeather = QUEST_TRACKER_HISTORICAL_WEATHER;
		state.QUEST_TRACKER.weatherDescription = QUEST_TRACKER_WEATHER_DESCRIPTION;
		state.QUEST_TRACKER.weather = QUEST_TRACKER_WEATHER;
		state.QUEST_TRACKER.imperialMeasurements = QUEST_TRACKER_imperialMeasurements;
		state.QUEST_TRACKER.TreeObjRef = QUEST_TRACKER_TreeObjRef;
		state.QUEST_TRACKER.filter = QUEST_TRACKER_FILTER;
		state.QUEST_TRACKER.rumourFilter = QUEST_TRACKER_RUMOUR_FILTER;
		state.QUEST_TRACKER.filterVisibility = QUEST_TRACKER_FILTER_Visbility;
	};
	const initializeQuestTrackerState = (forced = false) => {
		if (!state.QUEST_TRACKER || Object.keys(state.QUEST_TRACKER).length === 0 || forced) {
			state.QUEST_TRACKER = {
				verboseErrorLogging: true,
				globalQuestData: {},
				globalQuestArray: [],
				globalRumours: {},
				rumoursByLocation: {},
				generations: {},
				readableJSON: true,
				TreeObjRef: {},
				jumpGate: true,
				events: {},
				calendar: {},
				triggers: {},
				triggerConversion: false,
				calenderType: 'gregorian',
				currentDate: CALENDARS[QUEST_TRACKER_calenderType]?.defaultDate,
				defaultDate: CALENDARS[QUEST_TRACKER_calenderType]?.defaultDate,
				location: 'northern temperate',
				weatherLocation: 'plains',
				currentWeather: null,
				weatherTrends: {
					dry: 0,
					wet: 0,
					heat: 0,
					cold: 0
				},
				forcedWeatherTrends: {
					dry: false,
					wet: false,
					heat: false,
					cold: false
				},
				historicalWeather: {},
				weather: true,
				imperialMeasurements: {
					temperature: false,
					precipitation: false,
					wind: true,
					visibility: true
				},
				filter: {},
				rumourFilter: {},
				filterVisibility: false
			};
			if (!findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTS })[0]) {
				const tableQuests = createObj('rollabletable', { name: QUEST_TRACKER_ROLLABLETABLE_QUESTS });
				tableQuests.set('showplayers', false);
			}
			if (!findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTGROUPS })[0]) {
				const tableQuestGroups = createObj('rollabletable', { name: QUEST_TRACKER_ROLLABLETABLE_QUESTGROUPS });
				tableQuestGroups.set('showplayers', false);
			}
			let locationTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_LOCATIONS })[0];
			if (!locationTable) {
				locationTable = createObj('rollabletable', { name: QUEST_TRACKER_ROLLABLETABLE_LOCATIONS });
				locationTable.set('showplayers', false);
				createObj('tableitem', {
					_rollabletableid: locationTable.id,
					name: 'Everywhere',
					weight: 1
				});
			}
			if (!findObjs({ type: 'handout', name: QUEST_TRACKER_QuestHandoutName })[0]) {
				createObj('handout', { name: QUEST_TRACKER_QuestHandoutName });
			}
			if (!findObjs({ type: 'handout', name: QUEST_TRACKER_RumourHandoutName })[0]) {
				createObj('handout', { name: QUEST_TRACKER_RumourHandoutName });
			}
			if (!findObjs({ type: 'handout', name: QUEST_TRACKER_EventHandoutName })[0]) {
				createObj('handout', { name: QUEST_TRACKER_EventHandoutName });
			}
			if (!findObjs({ type: 'handout', name: QUEST_TRACKER_WeatherHandoutName })[0]) {
				createObj('handout', { name: QUEST_TRACKER_WeatherHandoutName });
			}
			if (!findObjs({ type: 'handout', name: QUEST_TRACKER_CalendarHandoutName })[0]) {
				createObj('handout', { name: QUEST_TRACKER_CalendarHandoutName });
			}
			if (!findObjs({ type: 'handout', name: QUEST_TRACKER_TriggersHandoutName })[0]) {
				createObj('handout', { name: QUEST_TRACKER_TriggersHandoutName });
			}
			Utils.sendGMMessage("QuestTracker has been initialized.");
		}
	};
	const Utils = (() => {
		const H = {
			checkType: (input) => {
				if (typeof input === 'string') {
					if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
						return 'DATE';
					}
					return 'STRING';
				} else if (typeof input === 'boolean') {
					return 'BOOLEAN';
				} else if (typeof input === 'number') {
					return Number.isInteger(input) ? 'INT' : 'STRING';
				} else if (Array.isArray(input)) {
					return 'ARRAY';
				} else if (typeof input === 'object' && input !== null) {
					return 'OBJECT';
				} else {
					return 'STRING';
				}
			}
		};
		const sendGMMessage = (message) => {
			sendChat('Quest Tracker', `/w gm ${message}`, null, { noarchive: true });
		};
		const sendMessage = (message) => {
			sendChat('Quest Tracker', `${message}`);
		};
		const sendDescMessage = (message) => {
			sendChat('', `/desc ${message}`);
		};
		const normalizeKeys = (obj) => {
			if (typeof obj !== 'object' || obj === null) return obj;
			if (Array.isArray(obj)) return obj.map(item => normalizeKeys(item));
			return Object.keys(obj).reduce((acc, key) => {
				const normalizedKey = key.toLowerCase();
				acc[normalizedKey] = normalizeKeys(obj[key]);
				return acc;
			}, {});
		};
		const stripJSONContent = (content) => {
			content = content
				.replace(/<br>/gi, '')
				.replace(/<\/?[^>]+(>|$)/g, '')
				.replace(/&nbsp;/gi, ' ')
				.replace(/&[a-z]+;/gi, ' ')
				.replace(/\+/g, '')
				.replace(/[\r\n]+/g, ' ')
				.replace(/\s{2,}/g, ' ')
				.trim();
			const start = content.indexOf('{');
			const end = content.lastIndexOf('}');
			if (start === -1 || end === -1) {
				log('Error: Valid JSON structure not found after stripping.');
				return '{}';
			}
			const jsonContent = content.substring(start, end + 1).trim();
			return jsonContent;
		};
		const sanitizeInput = (input, type) => {
			if (input === undefined || input === null) {
				Utils.sendGMMessage(`Error: Input is undefined or null.`);
				return null;
			}
			switch (type) {
				case 'STRING':
					if (typeof input !== 'string') {
						errorCheck(1, 'msg', null,`Expected a string, but received "${typeof input}`);
						return null;
					}
					return input.replace(/<[^>]*>/g, '').replace(/["<>]/g, '').replace(/(\r\n|\n|\r)/g, '%NEWLINE%');
				case 'ARRAY':
					if (!Array.isArray(input)) {
						errorCheck(2, 'msg', null,`Expected an array, but received "${typeof input}`);
						return [sanitizeInput(input, 'STRING')];
					}
					return input.map(item => sanitizeInput(item, H.checkType(item))).filter(item => item !== null);
				case 'DATE':
					return /^\d{4}-\d{2}-\d{2}$/.test(input) ? input : null;
				case 'BOOLEAN':
					return typeof input === 'boolean' ? input : input === 'true' || input === 'false' ? input === 'true' : null;
				case 'INT':
					return Number.isInteger(Number(input)) ? Number(input) : null;
				case 'OBJECT':
					if (typeof input !== 'object' || Array.isArray(input)) {
						errorCheck(3, 'msg', null,`Expected an object, but received "${typeof input}`);
						return null;
					}
					const sanitizedObject = {};
					for (const key in input) {
						if (input.hasOwnProperty(key)) {
							const sanitizedKey = sanitizeInput(key, 'STRING');
							const fieldType = H.checkType(input[key]);
							const sanitizedValue = sanitizeInput(input[key], fieldType);
							if (sanitizedKey !== null && sanitizedValue !== null) {
								sanitizedObject[sanitizedKey] = sanitizedValue;
							}
						}
					}
					return sanitizedObject;
				default:
					errorCheck(4, 'msg', null,`Unsupported type "${type}`);
					return null;
			}
		};
		const updateHandoutField = (dataType = 'quest') => {
			let handoutName;
			switch (dataType.toLowerCase()) {
				case 'rumour':
					handoutName = QUEST_TRACKER_RumourHandoutName;
					break;
				case 'event':
					handoutName = QUEST_TRACKER_EventHandoutName;
					break;
				case 'weather':
					handoutName = QUEST_TRACKER_WeatherHandoutName;
					break;
				case 'quest':
					handoutName = QUEST_TRACKER_QuestHandoutName;
					break;
				case 'calendar':
					handoutName = QUEST_TRACKER_CalendarHandoutName;
					break;
				case 'triggers':
					handoutName = QUEST_TRACKER_TriggersHandoutName;
					break;
				default:
					return;
			}
			const handout = findObjs({ type: 'handout', name: handoutName })[0];
			if (errorCheck(146, 'exists', handout,'handout')) return;
			handout.get('gmnotes', (notes) => {
				const cleanedContent = Utils.stripJSONContent(notes);
				let data;
				try {
					data = JSON.parse(cleanedContent);
					data = normalizeKeys(data);
				} catch (error) {
					errorCheck(5, 'msg', null,`Failed to parse JSON data from GM notes: ${error.message}`);
					return;
				}
				let updatedData;
				switch (dataType.toLowerCase()) {
					case 'rumour':
						updatedData = QUEST_TRACKER_globalRumours;
						break;
					case 'event':
						updatedData = QUEST_TRACKER_Events;
						break;
					case 'weather':
						updatedData = QUEST_TRACKER_HISTORICAL_WEATHER;
						break;
					case 'calendar':
						updatedData = QUEST_TRACKER_Calendar;
						break;
					case 'quest':
						updatedData = QUEST_TRACKER_globalQuestData;
						break;
					case 'triggers':
						updatedData = QUEST_TRACKER_Triggers;
						break;
					default:
						return;
				}
				const updatedContent = QUEST_TRACKER_readableJSON 
					? JSON.stringify(updatedData, null, 2)
						.replace(/\n/g, '<br>')
						.replace(/ {2}/g, '&nbsp;&nbsp;')
					: JSON.stringify(updatedData);
				handout.set('gmnotes', updatedContent, (err) => {
					if (err) {
						errorCheck(6, 'msg', null,`Failed to update GM notes for "${handoutName}": ${err.message}`);
						switch (dataType.toLowerCase()) {
							case 'rumour':
								QUEST_TRACKER_globalRumours = JSON.parse(cleanedContent);
								break;
							case 'event':
								QUEST_TRACKER_Events = JSON.parse(cleanedContent);
								break;
							case 'weather':
								QUEST_TRACKER_HISTORICAL_WEATHER = JSON.parse(cleanedContent);
								break;
							case 'calendar':
								QUEST_TRACKER_Calendar = JSON.parse(cleanedContent);
								break;
							case 'quest':
								QUEST_TRACKER_globalQuestData = JSON.parse(cleanedContent);
								break;
							case 'triggers':
								QUEST_TRACKER_TriggersHandoutName = JSON.parse(cleanedContent);
								break;
							default:
								return;
						}
					}
				});
			});
			saveQuestTrackerData();
			if (dataType === 'rumours') {
				Rumours.calculateRumoursByLocation();
			}
		};
		const togglereadableJSON = (value) => {
			QUEST_TRACKER_readableJSON = (value === 'true');
			saveQuestTrackerData();
			updateHandoutField('quest');
			updateHandoutField('rumour');
			updateHandoutField('event');
			updateHandoutField('weather');
			updateHandoutField('calendar');
			updateHandoutField('triggers');
		};
		const toggleWeather = (value) => {
			QUEST_TRACKER_WEATHER = (value === 'true');
			saveQuestTrackerData();
		};
		const toggleJumpGate = (value) => {
			QUEST_TRACKER_jumpGate = (value === 'true');
			saveQuestTrackerData();
		};
		const toggleVerboseError = (value) => {
			QUEST_TRACKER_verboseErrorLogging = (value === 'true');
			saveQuestTrackerData();
		};
		const toggleImperial = (type, value) => {
			QUEST_TRACKER_imperialMeasurements[type] = (value === 'true');
			saveQuestTrackerData();
		};
		const toggleFilterVisibility = (value) => {
			QUEST_TRACKER_FILTER_Visbility = (value === 'true');
			saveQuestTrackerData();
		};
		const sanitizeString = (input) => {
			if (typeof input !== 'string') {
				Utils.sendGMMessage('Error: Expected a string input.');
				return null;
			}
			const sanitizedString = input.replace(/[^a-zA-Z0-9_ ]/g, '_');
			return sanitizedString;
		};
		const roll20MacroSanitize = (text) => {
			return text
				.replace(/\|/g, '&#124;')
				.replace(/,/g, '&#44;')
				.replace(/{/g, '&#123;')
				.replace(/}/g, '&#125;')
				.replace(/&/g, '&#38;')
				.replace(/ /g, '&#160;')
				.replace(/=/g, '&#61;')
				.replace(/_/g, '&#95;')
				.replace(/\(/g, '&#40;')
				.replace(/\)/g, '&#41;')
				.replace(/\[/g, '&#91;')
				.replace(/\]/g, '&#93;')
				.replace(/</g, '&#60;')
				.replace(/>/g, '&#62;')
				.replace(/`/g, '&#96;')
				.replace(/\*/g, '&#42;')
				.replace(/!/g, '&#33;')
				.replace(/"/g, '&#34;')
				.replace(/#/g, '&#35;')
				.replace(/-/g, '&#45;')
				.replace(/@/g, '&#64;')
				.replace(/%/g, '&#37;');
		};
		const inputAlias = (command) => {
			const aliases = {
				'!qt': '!qt-menu action=main',
				'!qt-date advance': '!qt-date action=modify|unit=day|new=1',
				'!qt-date retreat': '!qt-date action=modify|unit=day|new=-1'
			};
			return aliases[command] || command;
		};
		const getNestedProperty = (obj, path) => {
			const keys = path.split('.');
			return keys.reduce((current, key) => (current && current[key] !== undefined ? current[key] : null), obj);
		}
		return {
			sendGMMessage,
			sendDescMessage,
			sendMessage,
			normalizeKeys,
			stripJSONContent,
			sanitizeInput,
			roll20MacroSanitize,
			updateHandoutField,
			togglereadableJSON,
			toggleWeather,
			toggleJumpGate,
			toggleVerboseError,
			toggleImperial,
			toggleFilterVisibility,
			sanitizeString,
			inputAlias,
			getNestedProperty
		};
	})(); 
	const Import = (() => {
		const H = {
			importData: (handoutName, dataType) => {
				let handout = findObjs({ type: 'handout', name: handoutName })[0];
				if (!handout) {
					createObj('handout', { name: handoutName });
				}
				handout.get('gmnotes', (notes) => {
					const cleanedContent = Utils.stripJSONContent(notes);
					try {
						let parsedData = JSON.parse(cleanedContent);
						const convertKeysToLowerCase = (obj) => {
							if (typeof obj !== 'object' || obj === null) {
								return obj;
							}
							if (Array.isArray(obj)) {
								return obj.map(item => convertKeysToLowerCase(item));
							}
							return Object.keys(obj).reduce((acc, key) => {
								const lowercaseKey = key.toLowerCase();
								acc[lowercaseKey] = convertKeysToLowerCase(obj[key]);
								return acc;
							}, {});
						};
						parsedData = convertKeysToLowerCase(parsedData);
						if (dataType === 'Quest') {
							parsedData = Utils.normalizeKeys(parsedData);
							QUEST_TRACKER_globalQuestArray = [];
							Object.keys(parsedData).forEach((questId) => {
								const quest = parsedData[questId];
								quest.relationships = quest.relationships || { logic: 'AND', conditions: [] };
								QUEST_TRACKER_globalQuestArray.push({ id: questId, weight: quest.weight || 1 });
							});
							QUEST_TRACKER_globalQuestData = parsedData;
						} else if (dataType === 'Rumour') {
							parsedData = Utils.normalizeKeys(parsedData);
							Object.keys(parsedData).forEach((questId) => {
								Object.keys(parsedData[questId]).forEach((status) => {
									Object.keys(parsedData[questId][status]).forEach((location) => {
										let rumours = parsedData[questId][status][location];
										if (typeof rumours === 'object' && !Array.isArray(rumours)) {
											parsedData[questId][status][location] = rumours;
										} else {
											parsedData[questId][status][location] = {};
										}
									});
								});
							});
							QUEST_TRACKER_globalRumours = parsedData;
							Rumours.calculateRumoursByLocation();
						} else if (dataType === 'Events') {
							parsedData = Utils.normalizeKeys(parsedData);
							QUEST_TRACKER_Events = parsedData;
						} else if (dataType === 'Weather') {
							parsedData = Utils.normalizeKeys(parsedData);
							QUEST_TRACKER_HISTORICAL_WEATHER = parsedData;
						} else if (dataType === 'Calendar') {
							parsedData = Utils.normalizeKeys(parsedData);
							QUEST_TRACKER_Calendar = parsedData;
						} else if (dataType === 'Triggers') {
							parsedData = Utils.normalizeKeys(parsedData);
							QUEST_TRACKER_Triggers = parsedData;
						}
						saveQuestTrackerData();
						Utils.sendGMMessage(`${dataType} handout "${handoutName}" Imported.`);
					} catch (error) {
						errorCheck(8, 'msg', null,`Error parsing ${dataType} data: ${error.message}`);
					}
				});
			},
			syncQuestRollableTable: () => {
				let questTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTS })[0];
				const questTableItems = findObjs({ type: 'tableitem', rollabletableid: questTable.id });
				const tableItemMap = {};
				questTableItems.forEach(item => {
					tableItemMap[item.get('name')] = item;
				});
				const questIdsInGlobalData = Object.keys(QUEST_TRACKER_globalQuestData);
				questIdsInGlobalData.forEach(questId => {
					if (!tableItemMap[questId]) {
						createObj('tableitem', {
							rollabletableid: questTable.id,
							name: questId,
							weight: 1
						});
					}
				});
				questTableItems.forEach(item => {
					const questId = item.get('name');
					if (!QUEST_TRACKER_globalQuestData[questId]) {
						item.remove();
					}
				});
			},
			validateRelationships: (relationships, questId) => {
				const questName = questId.toLowerCase();
				const validateNestedConditions = (conditions) => {
					if (!Array.isArray(conditions)) return true;
					return conditions.every(condition => {
						if (typeof condition === 'string') {
							const lowerCondition = condition.toLowerCase();
							if (errorCheck(9, 'exists', QUEST_TRACKER_globalQuestData.hasOwnProperty(lowerCondition),`QUEST_TRACKER_globalQuestData.hasOwnProperty(${lowerCondition})`)) return false;
							return true;
						} else if (typeof condition === 'object' && condition.logic && Array.isArray(condition.conditions)) {
							return validateNestedConditions(condition.conditions);
						}
						return false;
					});
				};
				const conditionsValid = validateNestedConditions(relationships.conditions || []);
				const mutuallyExclusive = Array.isArray(relationships.mutually_exclusive)
					? relationships.mutually_exclusive.map(exclusive => exclusive.toLowerCase())
					: [];
				mutuallyExclusive.forEach(exclusive => {
					if (errorCheck(10, 'exists', QUEST_TRACKER_globalQuestData.hasOwnProperty(exclusive),`QUEST_TRACKER_globalQuestData.hasOwnProperty(${exclusive})`)) return true;
					else return false;
				});
			},
			cleanUpDataFields: () => {
				Object.keys(QUEST_TRACKER_globalQuestData).forEach(questId => {
					const quest = QUEST_TRACKER_globalQuestData[questId];
					H.validateRelationships(quest.relationships || {}, questId);
				});
				saveQuestTrackerData();
				Utils.updateHandoutField('quest');
			},
			refreshCalendarData: () => {
				Object.keys(CALENDARS).forEach(key => delete CALENDARS[key]);
				Object.assign(CALENDARS, state.CalenderData.CALENDARS);
				Object.assign(CALENDARS, state.QUEST_TRACKER.calendar);
			}
		};
		const fullImportProcess = () => {
			H.importData(QUEST_TRACKER_QuestHandoutName, 'Quest');
			H.importData(QUEST_TRACKER_RumourHandoutName, 'Rumour');
			H.importData(QUEST_TRACKER_EventHandoutName, 'Events');
			H.importData(QUEST_TRACKER_WeatherHandoutName, 'Weather');
			H.importData(QUEST_TRACKER_CalendarHandoutName, 'Calendar');
			H.importData(QUEST_TRACKER_TriggersHandoutName, 'Triggers');
			H.syncQuestRollableTable();
			Quest.cleanUpLooseEnds();
			H.cleanUpDataFields();
			H.refreshCalendarData();
		};
		return {
			fullImportProcess
		};
	})(); 
	const Triggers = (() => {
		const H = {
			generateNewTriggerId: () => {
				const triggers = QUEST_TRACKER_Triggers;
				const allTriggerIds = Object.values(triggers).flatMap(category =>
					Object.values(category).flatMap(triggerGroup => Object.keys(triggerGroup))
				);
				const highestTriggerNumber = allTriggerIds.reduce((max, id) => {
					const match = id.match(/^trigger_(\d+)$/);
					if (match) {
						const number = parseInt(match[1], 10);
						return number > max ? number : max;
					}
					return max;
				}, 0);
				const newTriggerNumber = highestTriggerNumber + 1;
				return `trigger_${newTriggerNumber}`;
			},
			generateNewEffectId: () => {
				const triggers = QUEST_TRACKER_Triggers;
				const allIds = Object.values(triggers).flatMap(category =>
					Object.values(category).flatMap(triggerGroup =>
						Object.values(triggerGroup)
							.filter(trigger => trigger.effects)
							.flatMap(trigger => Object.keys(trigger.effects))
					)
				);
				const highestIdNumber = allIds.reduce((max, id) => {
					const match = id.match(/^effect_(\d+)$/);
					if (match) {
						const number = parseInt(match[1], 10);
						return number > max ? number : max;
					}
					return max;
				}, 0);
				const newIdNumber = highestIdNumber + 1;
				return `effect_${newIdNumber}`;
			},
			saveData: () => {
				saveQuestTrackerData();
				Utils.updateHandoutField('triggers');
			},
			getTargetStructure: (type) => {
				const structures = {
					quest: QUEST_TRACKER_Triggers.quests,
					date: QUEST_TRACKER_Triggers.dates,
					reaction: QUEST_TRACKER_Triggers.reactions,
				};
				return structures[type] || null;
			},
			cleanUpEmptyKeys: () => {
				const targets = [
					'quests.null',
					'dates.null',
					'reactions.null',
				];
				targets.forEach((path) => {
					const pathParts = path.split('.');
					let current = QUEST_TRACKER_Triggers; 
					for (let i = 0; i < pathParts.length - 1; i++) {
						current = current[pathParts[i]];
					}
					const lastKey = pathParts[pathParts.length - 1];
					if (current[lastKey] && Object.keys(current[lastKey]).length === 0) delete current[lastKey];
				});
			},
			fireTrigger: (triggerId) => {
				const triggerPath = Triggers.locateItem(triggerId, "trigger");
				const trigger = Utils.getNestedProperty(QUEST_TRACKER_Triggers, triggerPath.replace("QUEST_TRACKER_Triggers.", ""));
				if (!trigger || !trigger.effects || Object.keys(trigger.effects).length === 0) return;
				Object.entries(trigger.effects).forEach(([effectId, effect]) => {
					const { questid, type, value } = effect;
					Quest.manageQuestObject({
						action: "update",
						field: type,
						current: questid,
						old: null,
						newItem: value,
					});
				});
				Triggers.checkTriggers('reaction',triggerId);
				QUEST_TRIGGER_DeleteList.push(triggerId);
			}
		};
		const initializeTriggersStructure = () => {
			if (!QUEST_TRACKER_Triggers.quests) QUEST_TRACKER_Triggers.quests = {};
			if (!QUEST_TRACKER_Triggers.dates) QUEST_TRACKER_Triggers.dates = {};
			if (!QUEST_TRACKER_Triggers.reactions) QUEST_TRACKER_Triggers.reactions = {};
		};
		const convertAutoAdvanceToTriggers = () => {
			if (QUEST_TRACKER_TriggerConversion) return;
			let triggersConverted = false;
			initializeTriggersStructure();
			for (const [questId, questData] of Object.entries(QUEST_TRACKER_QuestData)) {
				if (questData.autoadvance) {
					for (const [status, date] of Object.entries(questData.autoadvance)) {
						const newTriggerId = H.generateNewTriggerId();
						const newEffectId = H.generateNewEffectId();
						if (!QUEST_TRACKER_Triggers.dates[date]) QUEST_TRACKER_Triggers.dates[date] = {};
						QUEST_TRACKER_Triggers.dates[date][newTriggerId] = {
							name: "Converted Trigger",
							enabled: true,
							quest_id: questId,
							change: { type: 'status', value: status },
							effects: {
								[newEffectId]: {
									quest_id: questId,
									change: { type: 'status', value: status }
								}
							}
						};
						triggersConverted = true;
					}
					delete questData.autoadvance;
				}
			}
			QUEST_TRACKER_TriggerConversion = true;
			if (triggersConverted) {
				errorCheck(176, 'msg', null, `Autoadvance converted to Triggers (v1.1 update).`);
			}
			H.saveData();
		};
		const addTrigger = () => {
			const newTriggerId = H.generateNewTriggerId();
			initializeTriggersStructure();
			if (!QUEST_TRACKER_Triggers.quests['null']) QUEST_TRACKER_Triggers.quests['null'] = {};
			QUEST_TRACKER_Triggers.quests['null'][newTriggerId] = {
				name: "New Trigger",
				enabled: false,
				action: { type: null, effect: null },
				effects: {}
			};
			H.saveData();
		};
		const initializeTrigger = (type, input = null) => {
			initializeTriggersStructure();
			const sourceType = type === 'quest' ? 'date' : type === 'date' ? 'quest' : 'reaction';
			const sourcePath = locateItem(input, 'trigger');
			const pathParts = sourcePath.split('.');
			const parentPath = pathParts.slice(0, -1).join('.');
			const triggerId = pathParts[pathParts.length - 1];
			const sourceParent = Utils.getNestedProperty(QUEST_TRACKER_Triggers, parentPath.replace('QUEST_TRACKER_Triggers.', ''));
			const sourceTrigger = sourceParent ? sourceParent[triggerId] : null;
			const targetStructure =
				type === 'quest'
					? QUEST_TRACKER_Triggers.quests
					: type === 'date'
					? QUEST_TRACKER_Triggers.dates
					: QUEST_TRACKER_Triggers.reactions;
			let targetParentKey = 'null';
			const targetParent = targetStructure[targetParentKey] || (targetStructure[targetParentKey] = {});
			const updatedTrigger = {
				...sourceTrigger,
				name: sourceTrigger.name || 'New Trigger',
				enabled: sourceTrigger.enabled ?? false,
				effects: sourceTrigger.effects || {},
				action: type === 'quest' ? sourceTrigger.action || { type: null, effect: null } : null,
			};
			if (type !== 'quest') delete updatedTrigger.action;
			if (type !== 'date') delete updatedTrigger.dateKey;
			if (type !== 'reaction') delete updatedTrigger.questId;
			targetParent[triggerId] = updatedTrigger;
			if (sourceParent && sourceParent[triggerId]) {
				delete sourceParent[triggerId];
			}
			H.cleanUpEmptyKeys();
			H.saveData();
		};
		const toggleTrigger = (field, triggerId, value) => {
			initializeTriggersStructure();
			const triggerPath = locateItem(triggerId, 'trigger');
			if (errorCheck(203, 'exists', triggerPath, 'triggerPath')) return;
			const trigger = Utils.getNestedProperty(QUEST_TRACKER_Triggers, triggerPath.replace('QUEST_TRACKER_Triggers.', ''));
			if (!trigger) {
				errorCheck(204, 'msg', null, `Trigger not found at path: ${triggerPath}`);
				return;
			}
			switch (field) {
				case 'enabled':
					trigger.enabled = value === "false" ? false : true;
					break;
				case 'name':
					if (typeof value !== 'string' || value.trim() === '') {
						errorCheck(204, 'msg', null, `Invalid name value: ${value}. Must be a non-empty string.`);
						return;
					}
					trigger.name = value.trim();
					break;
				default:
					errorCheck(205, 'msg', null, `Invalid field: ${field}. Use 'enabled' or 'name'.`);
					return;
			}
			H.saveData();
		};
		const manageTriggerAction = (triggerId, { part, value }) => {
			initializeTriggersStructure();
			const triggerPath = locateItem(triggerId, 'trigger');
			if (errorCheck(192, 'exists', triggerPath, 'triggerPath')) return;
			const trigger = eval(triggerPath);
			switch (part) {
				case 'quest_id': {
					trigger.quest_id = value;
					break;
				}
				case 'triggering_field': {
					trigger.change.type = value;
					break;
				}
				case 'triggering_value': {
					trigger.change.value = value;
					break;
				}
				case 'date': {
					if (!triggerPath.startsWith('QUEST_TRACKER_Triggers.dates')) {
						errorCheck(193, 'msg', null, `Cannot set a date on a non-date trigger.`);
						return;
					}
					trigger.date = value;
					break;
				}
				case 'action': {
					if (!triggerPath.startsWith('QUEST_TRACKER_Triggers.reactions')) {
						errorCheck(195, 'msg', null, `Cannot set an action on a non-reaction trigger.`);
						return;
					}
					trigger.action = value;
					break;
				}
				default: {
					errorCheck(194, 'msg', null, `Invalid part: ${part}.`);
					return;
				}
			}
			H.saveData();
		};
		const manageTriggerEffects = ({ action, value = {}, id = null }) => {
			initializeTriggersStructure();
			const effectPath = locateItem(id, 'effect');
			if (!effectPath && action !== 'add') {
				errorCheck(195, 'msg', null, `Effect with ID ${id} not found.`);
				return;
			}
			let effects, effect;
			if (effectPath) {
				const effectKeyPath = effectPath.split('.effects.')[0];
				effects = eval(effectKeyPath);
				effect = eval(effectPath);
			}
			switch (action) {
				case 'add': {
					if (errorCheck(196, 'exists', effects, 'effects')) return;
					const newEffectId = H.generateNewEffectId();
					effects[newEffectId] = {
						quest_id: null,
						change: { type: null, value: null },
						...value
					};
					break;
				}
				case 'remove': {
					if (errorCheck(197, 'exists', effect, 'effect')) return;
					delete effects[id];
					break;
				}
				case 'edit': {
					if (errorCheck(198, 'exists', effect, 'effect')) return;
					effects[id] = { ...effect, ...value };
					break;
				}
				default:
					errorCheck(199, 'msg', null, `Invalid action: ${action}. Use 'add', 'remove', or 'edit'.`);
					return;
			}
			H.saveData();
		};
		const deleteTrigger = (triggerId) => {
			initializeTriggersStructure();
			const triggerPath = locateItem(triggerId, 'trigger');
			if (errorCheck(177, 'exists', triggerPath, 'triggerPath')) return;
			if (Array.isArray(QUEST_TRIGGER_DeleteList)) {
				const index = QUEST_TRIGGER_DeleteList.indexOf(triggerId);
				if (index !== -1) QUEST_TRIGGER_DeleteList.splice(index, 1);
			} else if (typeof QUEST_TRIGGER_DeleteList === 'object') {
				delete QUEST_TRIGGER_DeleteList[triggerId];
			}
			const parentPath = triggerPath.substring(0, triggerPath.lastIndexOf('.'));
			const triggerKey = triggerId;
			const pathParts = parentPath.split('.');
			if (pathParts.includes("dates")) {
				const dateKey = pathParts[2];
				if (QUEST_TRACKER_Triggers.dates[dateKey]) {
					delete QUEST_TRACKER_Triggers.dates[dateKey][triggerKey];
					if (Object.keys(QUEST_TRACKER_Triggers.dates[dateKey]).length === 0) {
						delete QUEST_TRACKER_Triggers.dates[dateKey];
					}
				}
			} else {
				const triggers = eval(parentPath);
				delete triggers[triggerKey];
				if (Object.keys(triggers).length === 0) {
					const grandparentPath = parentPath.substring(0, parentPath.lastIndexOf('.'));
					const parentKey = parentPath.split('.').pop();
					const parentObject = eval(grandparentPath);
					delete parentObject[parentKey];
				}
			}
			Object.entries(QUEST_TRACKER_Triggers.reactions).forEach(([reactionParent, reactionTriggers]) => {
				Object.entries(reactionTriggers).forEach(([reactionTriggerId, reactionTrigger]) => {
					if (reactionTrigger.action === triggerId) {
						deleteTrigger(reactionTriggerId);
					}
				});
			});
			H.saveData();
		};
		const locateItem = (itemId, field) => {
			for (const [type, category] of Object.entries(QUEST_TRACKER_Triggers)) {
				for (const [parentId, items] of Object.entries(category)) {
					if (field === 'trigger' && items[itemId]) {
						return `QUEST_TRACKER_Triggers.${type}.${parentId}.${itemId}`;
					}
					if (field === 'effect') {
						for (const [triggerId, trigger] of Object.entries(items)) {
							if (trigger.effects && trigger.effects[itemId]) {
								return `QUEST_TRACKER_Triggers.${type}.${parentId}.${triggerId}.effects.${itemId}`;
							}
						}
					}
				}
			}
			return null;
		};
		const managePrompt = (field, triggerId, value) => {
			initializeTriggersStructure();
			const sourcePath = locateItem(triggerId, 'trigger');
			const pathParts = sourcePath.split('.');
			const parentPath = pathParts.slice(0, -1).join('.');
			const sourceParent = Utils.getNestedProperty(QUEST_TRACKER_Triggers, parentPath.replace('QUEST_TRACKER_Triggers.', ''));
			const sourceTrigger = sourceParent ? sourceParent[triggerId] : null;
			let targetStructure;
			switch(field) {
				case 'quest':
					targetStructure = QUEST_TRACKER_Triggers.quests;
					break;
				case 'date':
					targetStructure = QUEST_TRACKER_Triggers.dates;
					break;
				case 'reaction':
					targetStructure = QUEST_TRACKER_Triggers.reactions;
					break;
			}
			let targetParentKey = value || 'null';
			const targetParent = targetStructure[targetParentKey] || (targetStructure[targetParentKey] = {});
			targetParent[triggerId] = {
				...sourceTrigger,
				...(field === 'quest' ? { action: sourceTrigger.action || { type: null, effect: null } } : {}),
				...(field === 'date' ? { dateKey: value || 'null' } : {}),
				...(field === 'reaction' ? { action: value || 'null' } : {}),
			};
			delete sourceParent[triggerId];
			if (Object.keys(sourceParent).length === 0) {
				const sourceStructure = pathParts[1] === 'quests'
					? QUEST_TRACKER_Triggers.quests
					: pathParts[1] === 'dates'
					? QUEST_TRACKER_Triggers.dates
					: QUEST_TRACKER_Triggers.reactions;
				delete sourceStructure[pathParts[2]];
			}
			H.saveData();
		};
		const manageActionEffect = (field, triggerId, type) => {
			Triggers.initializeTriggersStructure();
			const triggerPath = Triggers.locateItem(triggerId, "trigger");
			if (!triggerPath || !triggerPath.startsWith("QUEST_TRACKER_Triggers.quests")) return;
			const trigger = Utils.getNestedProperty(QUEST_TRACKER_Triggers, triggerPath.replace("QUEST_TRACKER_Triggers.", ""));
			if (!trigger || !trigger.action) return;
			switch(field) {
				case 'action':
					trigger.action.type = type;
					trigger.action.effect = null;
					break;
				case 'effect':
					trigger.action.effect = type;
					break;
			}
			H.saveData();
		};
		const manageEffect = (triggerId, effectId, action, key = null, value = null) => {
			Triggers.initializeTriggersStructure();
			const triggerPath = Triggers.locateItem(triggerId, "trigger");
			if (!triggerPath || !triggerPath.startsWith("QUEST_TRACKER_Triggers")) {
				errorCheck(230, "msg", null, `Trigger ID ${triggerId} not found.`);
				return;
			}
			const trigger = Utils.getNestedProperty(QUEST_TRACKER_Triggers, triggerPath.replace("QUEST_TRACKER_Triggers.", ""));
			if (!trigger || !trigger.effects) trigger.effects = {};
			const newEffectId = action === "add" ? H.generateNewEffectId() : null;
			switch (action) {
				case "add":
					trigger.effects[newEffectId] = {
						questid: null,
						type: null,
						value: null
					};
					break;
				case "delete":
					delete trigger.effects[effectId];
					break;
				case "modify":
					trigger.effects[effectId][key] = value;
					break;
			}
			H.saveData();
		};
		const checkTriggers = (type, id = null) => {
			switch (type) {
				case "date": {
					const currentDate = new Date(QUEST_TRACKER_currentDate);
					Object.entries(QUEST_TRACKER_Triggers.dates).forEach(([dateKey, triggers]) => {
						const triggerDate = new Date(dateKey);
						if (triggerDate <= currentDate) {
							Object.entries(triggers).forEach(([triggerId, trigger]) => {
								if (trigger.enabled) {
									H.fireTrigger(triggerId);
								}
							});
						}
					});
					break;
				}
				case "quest": {
					const questTriggers = QUEST_TRACKER_Triggers.quests[id];
					if (!questTriggers || Object.keys(questTriggers).length === 0) return;
					Object.entries(questTriggers).forEach(([triggerId, trigger]) => {
						if (!trigger.enabled || !trigger.action) return;
						const { type, effect } = trigger.action;
						switch (type) {
							case "hidden":
								const isHidden = QUEST_TRACKER_globalQuestData[id]?.hidden;
								if (String(isHidden) === effect) {
									H.fireTrigger(triggerId);
								}
								break;
							case "disabled":
								const isDisabled = QUEST_TRACKER_globalQuestData[id]?.disabled;
								if (String(isDisabled) === effect) {
									H.fireTrigger(triggerId);
								}
								break;
							case "status":
								const currentStatus = Quest.getQuestStatus(id);
								const statusId = Object.keys(statusMapping).find(key => statusMapping[key] === currentStatus);
								if (effect === currentStatus) {
									H.fireTrigger(triggerId);
								}
								break;
						}
					});
					break;
				}
				case "reaction": {
					Object.entries(QUEST_TRACKER_Triggers.reactions).forEach(([reactionTriggerId, reactions]) => {
						Object.entries(reactions).forEach(([triggerId, trigger]) => {
							if (trigger.enabled && trigger.action === id) {
								H.fireTrigger(triggerId);
							}
						});
					});
					break;
				}
			}
			if (QUEST_TRIGGER_DeleteList.length > 0) QUEST_TRIGGER_DeleteList.forEach(id => deleteTrigger(id));
		};
		const removeQuestsFromTriggers = (questId) => {
			Triggers.initializeTriggersStructure();
			if (QUEST_TRACKER_Triggers.quests[questId]) {
				Object.keys(QUEST_TRACKER_Triggers.quests[questId]).forEach((triggerId) => {
					Triggers.deleteTrigger(triggerId);
				});
				delete QUEST_TRACKER_Triggers.quests[questId];
			}
			H.saveData();
		};
		return {
			initializeTriggersStructure,
			convertAutoAdvanceToTriggers,
			addTrigger,
			initializeTrigger,
			toggleTrigger,
			manageTriggerAction,
			manageTriggerEffects,
			deleteTrigger,
			locateItem,
			managePrompt,
			manageActionEffect,
			manageEffect,
			checkTriggers,
			removeQuestsFromTriggers
		};
	})();
	const Quest = (() => {
		const H = {
			traverseConditions: (conditions, callback) => {
				conditions.forEach(condition => {
					if (typeof condition === 'string') {
						callback(condition);
					} else if (typeof condition === 'object' && condition.logic && Array.isArray(condition.conditions)) {
						H.traverseConditions(condition.conditions, callback);
						if (Array.isArray(condition.mutually_exclusive)) {
							condition.mutually_exclusive.forEach(exclusiveQuest => {
								callback(exclusiveQuest);
							});
						}
					}
				});
			},
			updateQuestStatus: (questId, status) => {
				const questTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTS })[0];
				if (!questTable) {
					return;
				}
				const items = findObjs({ type: 'tableitem', rollabletableid: questTable.id });
				const item = items.find(i => i.get('name') === questId);
				if (item) {
					item.set('weight', status);
					QUEST_TRACKER_globalQuestArray = QUEST_TRACKER_globalQuestArray.map(q => {
						if (q.id === questId) {
							q.weight = status;
						}
						return q;
					});
					saveQuestTrackerData();
				}
			},
			removeQuestFromRollableTable: (questId) => {
				const questTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTS })[0];
				if (questTable) {
					const item = findObjs({ type: 'tableitem', rollabletableid: questTable.id })
						.find(i => i.get('name') === questId);
					if (item) {
						item.remove();
					}
				}
			},
			getExclusions: (questId) => {
				const questData = QUEST_TRACKER_globalQuestData[questId];
				if (!questData || !questData.relationships) {
					return [];
				}
				let exclusions = new Set();
				if (Array.isArray(questData.relationships.mutually_exclusive)) {
					questData.relationships.mutually_exclusive.forEach(exclusions.add, exclusions);
				}
				H.traverseConditions(questData.relationships.conditions || [], condition => {
					if (typeof condition === 'string') {
						exclusions.add(condition);
					}
				});
				if (questData.group) {
					Object.keys(QUEST_TRACKER_globalQuestData).forEach(key => {
						const otherQuest = QUEST_TRACKER_globalQuestData[key];
						if (otherQuest.group && otherQuest.group !== questData.group) {
							exclusions.add(key);
						}
					});
				}
				return Array.from(exclusions);
			},
			modifyRelationshipObject: (currentRelationships, action, relationshipType, newItem, groupnum) => {
				switch (relationshipType) {
					case 'mutuallyExclusive':
						switch (action) {
							case 'add':
								currentRelationships.mutually_exclusive = typeof currentRelationships.mutually_exclusive === 'string' ? [currentRelationships.mutually_exclusive] : (currentRelationships.mutually_exclusive || []);
								if (!currentRelationships.mutually_exclusive.includes(newItem)) {
									currentRelationships.mutually_exclusive.push(newItem);
								}
								break;
							case 'remove':
								currentRelationships.mutually_exclusive = currentRelationships.mutually_exclusive.filter(
									exclusive => exclusive && exclusive !== newItem
								);
								break;
							default:
								break;
						}
						break;
					case 'single':
						if (!Array.isArray(currentRelationships.conditions)) {
							currentRelationships.conditions = [];
						}
						if (!currentRelationships.logic) {
							currentRelationships.logic = 'AND';
						}
						switch (action) {
							case 'add':
								const baseIndex = currentRelationships.conditions.findIndex(cond => typeof cond === 'object');
								if (baseIndex === -1) {
									currentRelationships.conditions.push(newItem);
								} else {
									currentRelationships.conditions.splice(baseIndex, 0, newItem);
								}
								break;
							case 'remove':
								currentRelationships.conditions = currentRelationships.conditions.filter(cond => cond !== newItem);
								break;
							default:
								break;
						}
						break;
					case 'group':
						if (groupnum === null || groupnum < 1) {
							return currentRelationships;
						}
						if (groupnum >= currentRelationships.conditions.length || typeof currentRelationships.conditions[groupnum] !== 'object') {
							currentRelationships.conditions[groupnum] = { logic: 'AND', conditions: [] };
						}
						const group = currentRelationships.conditions[groupnum];
						if (typeof group === 'object' && group.logic && Array.isArray(group.conditions)) {
							switch (action) {
								case 'add':
									if (!group.conditions.includes(newItem)) {
										group.conditions.push(newItem);
									}
									break;
								case 'remove':
									group.conditions = group.conditions.filter(cond => cond !== newItem);
									break;
								default:
									break;
							}
						}
						break;
					case 'logic':
						currentRelationships.logic = currentRelationships.logic === 'AND' ? 'OR' : 'AND';
						break;
					case 'grouplogic':
						if (groupnum !== null && groupnum >= 1 && groupnum < currentRelationships.conditions.length) {
							const group = currentRelationships.conditions[groupnum];
							if (typeof group === 'object' && group.logic) {
								group.logic = group.logic === 'AND' ? 'OR' : 'AND';
							}
						}
						break;
					case 'removegroup':
						if (groupnum !== null && groupnum >= 1 && groupnum < currentRelationships.conditions.length) {
							currentRelationships.conditions.splice(groupnum, 1);
						}
						break;
					case 'addgroup':
						currentRelationships.conditions.push({
							logic: 'AND',
							conditions: [newItem]
						});
						break;
					default:
						break;
				}
				return currentRelationships;
			},
			generateNewQuestId: () => {
				const existingQuestIds = Object.keys(QUEST_TRACKER_globalQuestData);
				const highestQuestNumber = existingQuestIds.reduce((max, id) => {
					const match = id.match(/^quest_(\d+)$/);
					if (match) {
						const number = parseInt(match[1], 10);
						return number > max ? number : max;
					}
					return max;
				}, 0);
				const newQuestNumber = highestQuestNumber + 1;
				return `quest_${newQuestNumber}`;
			},
			removeQuestReferences: (questId) => {
				Object.keys(QUEST_TRACKER_globalQuestData).forEach(otherQuestId => {
					if (otherQuestId !== questId) {
						const otherQuestData = QUEST_TRACKER_globalQuestData[otherQuestId];
						if (!otherQuestData || !otherQuestData.relationships) return;
						const { conditions, mutually_exclusive } = otherQuestData.relationships;
						if (Array.isArray(conditions) && conditions.includes(questId)) {
							manageRelationship(otherQuestId, 'remove', 'single', questId);
						}
						if (Array.isArray(mutually_exclusive) && mutually_exclusive.includes(questId)) {
							manageRelationship(otherQuestId, 'remove', 'mutuallyExclusive', questId);
						}
						if (Array.isArray(conditions)) {
							conditions.forEach((condition, index) => {
								if (typeof condition === 'object' && Array.isArray(condition.conditions)) {
									if (condition.conditions.includes(questId)) {
										manageRelationship(otherQuestId, 'remove', 'group', questId, index);
									}
								}
							});
						}
					}
				});
			},
			getAllQuestGroups: () => {
				let groupTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTGROUPS })[0];
				if (!groupTable) return [];
				let groupItems = findObjs({ type: 'tableitem', rollabletableid: groupTable.id });
				return groupItems.map(item => item.get('name'));
			},
			removeQuestsFromGroup: (groupTable, groupId) => {
				const groupObject = findObjs({ type: 'tableitem', rollabletableid: groupTable.id }).find(item => item.get('weight') == groupId);
				if (!groupObject) return;
	
				Object.keys(QUEST_TRACKER_globalQuestData).forEach(questId => {
					const quest = QUEST_TRACKER_globalQuestData[questId] || {};
					if (quest.group === groupId) {
						delete quest.group;
					}
				});
				Utils.updateHandoutField('quest');
			},
			getNewGroupId: (groupTable) => {
				let groupItems = findObjs({ type: 'tableitem', rollabletableid: groupTable.id });
				if (!groupItems || groupItems.length === 0) return 1;
				let maxWeight = groupItems.reduce((max, item) => Math.max(max, item.get('weight')), 0);
				return maxWeight + 1;
			},
			levenshteinDistance: (a, b) => {
				if (!a.length) return b.length;
				if (!b.length) return a.length;
				const matrix = Array.from({ length: a.length + 1 }, (_, i) => Array(b.length + 1).fill(0));
				for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
				for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
				for (let i = 1; i <= a.length; i++) {
					for (let j = 1; j <= b.length; j++) {
						matrix[i][j] =
							a[i - 1] === b[j - 1]
								? matrix[i - 1][j - 1]
								: Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + 1);
					}
				}
				return matrix[a.length][b.length];
			},
			getBestMatchingHandout: (questName) => {
				const handouts = findObjs({ type: 'handout' });
				if (!handouts || handouts.length === 0) return null;
				let bestMatch = null;
				let bestDistance = Infinity;
				handouts.forEach(handout => {
					const handoutName = handout.get('name');
					const distance = H.levenshteinDistance(questName.toLowerCase(), handoutName.toLowerCase());
					if (distance < bestDistance) {
						bestDistance = distance;
						bestMatch = handout;
					}
				});
				if (bestMatch) return bestMatch.id;
				else return null;
			}
		};
		const manageRelationship = (questId, action, relationshipType, newItem = null, groupnum = null) => {
			let questData = QUEST_TRACKER_globalQuestData[questId];
			let currentRelationships = questData.relationships || { logic: 'AND', conditions: [], mutually_exclusive: [] };
			currentRelationships.conditions = currentRelationships.conditions || [];
			currentRelationships.mutually_exclusive = currentRelationships.mutually_exclusive || [];
			if (action === 'add' && newItem) {
				let targetQuest = QUEST_TRACKER_globalQuestData[newItem];
				if (targetQuest && questData.group && !targetQuest.group) {
					targetQuest.group = questData.group;
				} else if (targetQuest && !questData.group && targetQuest.group) {
					questData.group = targetQuest.group;
				}
			}
			let updatedRelationships = H.modifyRelationshipObject(currentRelationships, action, relationshipType, newItem, groupnum);
			Utils.updateHandoutField('quest')
		};
		const getValidQuestsForDropdown = (questId) => {
			const exclusions = H.getExclusions(questId);
			const excludedQuests = new Set([questId, ...exclusions]);
			const validQuests = Object.keys(QUEST_TRACKER_globalQuestData).filter(qId => {
				return !excludedQuests.has(qId);
			});
			if (validQuests.length === 0) {
				return false;
			}
			return validQuests;
		};
		const addQuest = () => {
			const newQuestId = H.generateNewQuestId();
			const defaultQuestData = {
				name: 'New Quest',
				description: 'Description',
				relationships: {},
				hidden: true,
				disabled: false
			};
			const questTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTS })[0];
			QUEST_TRACKER_globalQuestData[newQuestId] = defaultQuestData;
			QUEST_TRACKER_globalQuestArray.push({ id: newQuestId, weight: 1 });
			if (questTable) {
				createObj('tableitem', {
					rollabletableid: questTable.id,
					name: newQuestId,
					weight: 1,
				});
			}
			Utils.updateHandoutField('quest')
		};
		const removeQuest = (questId) => {
			H.removeQuestReferences(questId);
			H.removeQuestFromRollableTable(questId);
			Rumours.removeAllRumoursForQuest(questId);
			Triggers.removeQuestsFromTriggers(questId);
			delete QUEST_TRACKER_globalQuestData[questId];
			QUEST_TRACKER_globalQuestArray = QUEST_TRACKER_globalQuestArray.filter(quest => quest.id !== questId);
			Utils.updateHandoutField('quest');
		};
		const cleanUpLooseEnds = () => {
			const processedPairs = new Set();
			Object.keys(QUEST_TRACKER_globalQuestData).forEach(questId => {
				const quest = QUEST_TRACKER_globalQuestData[questId];
				const mutuallyExclusiveQuests = quest.relationships?.mutually_exclusive || [];
				mutuallyExclusiveQuests.forEach(targetId => {
					const pairKey = [questId, targetId].sort().join('-');
					if (!processedPairs.has(pairKey)) {
						processedPairs.add(pairKey);
						const targetQuest = QUEST_TRACKER_globalQuestData[targetId];
						if (targetQuest) {
							const targetMutuallyExclusive = new Set(targetQuest.relationships?.mutually_exclusive || []);
							if (!targetMutuallyExclusive.has(questId)) {
								manageRelationship(targetId, 'add', 'mutuallyExclusive', questId);
								Utils.sendGMMessage(`Added missing mutually exclusive relationship from ${targetId} to ${questId}.`);
							}
						}
					}
				});
			});
		};
		const getStatusNameByQuestId = (questId, questArray) => {
			let quest = questArray.find(q => q.id === questId);
			if (quest) {
				return statusMapping[quest.weight] || 'Unknown';
			}
			return 'Unknown';
		};
		const getQuestStatus = (questId) => {
			const questTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTS })[0];
			if (!questTable) {
				return 1;
			}
			const questItem = findObjs({ type: 'tableitem', rollabletableid: questTable.id }).find(item => item.get('name') === questId);
			if (!questItem) {
				return 1;
			}
			return questItem.get('weight');
		};
		const manageQuestObject = ({ action, field, current, old = '', newItem }) => {
			const quest = QUEST_TRACKER_globalQuestData[current];
			switch (field) {
				case 'status':
					H.updateQuestStatus(current, newItem);
					QuestPageBuilder.updateQuestStatusColor(current, newItem);
					Rumours.calculateRumoursByLocation();
					break;
				case 'hidden':
					if (action === 'update') {
						quest.hidden = !quest.hidden;
						QuestPageBuilder.updateQuestVisibility(current, quest.hidden);
					}
					break;
				case 'disabled':
					if (action === 'update') {
						quest.disabled = !quest.disabled;
					}
					break;
				case 'name':
					if (action === 'add') {
						quest.name = newItem;
						QuestPageBuilder.updateQuestText(current, newItem);
					} else if (action === 'remove') {
						quest.name = '';
					}
					break;
				case 'description':
					if (action === 'add') {
						quest.description = newItem;
						QuestPageBuilder.updateQuestTooltip(current, newItem);
					} else if (action === 'remove') {
						quest.description = '';
					}
					break;
				case 'group':
					if (action === 'add') {
						quest.group = newItem;
					} else if (action === 'remove') {
						delete quest.group;
					}
					break;
				default:
					errorCheck(11, 'msg', null,`Unsupported action for type ( ${field} )`);
					break;
			}
			Triggers.checkTriggers('quest',current);
			Utils.updateHandoutField('quest');
		};
		const manageGroups = (action, newItem = null, groupId = null) => {
			let groupTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTGROUPS })[0];
			if (!groupTable) {
				errorCheck(12, 'msg', null,`Quest groups table not found.`)
				return;
			}
			switch (action) {
				case 'add':
					const allGroups = findObjs({ type: 'tableitem', rollabletableid: groupTable.id }).map(item => item.get('name').toLowerCase());
					if (allGroups.includes(Utils.sanitizeString(newItem.toLowerCase()))) return;
					const newWeight = H.getNewGroupId(groupTable);
					if (newWeight === undefined || newWeight === null) return;
					let newGroup = createObj('tableitem', {
						rollabletableid: groupTable.id,
						name: newItem,
						weight: newWeight
					});
					break;
				case 'remove':
					if (groupId === 1) return;
					let groupToRemove = findObjs({ type: 'tableitem', rollabletableid: groupTable.id }).find(item => item.get('weight') == groupId);
					H.removeQuestsFromGroup(groupTable, groupId);
					groupToRemove.remove();
					break;
				case 'update':
					const groupList = findObjs({ type: 'tableitem', rollabletableid: groupTable.id }).map(item => item.get('name').toLowerCase());
					if (groupList.includes(Utils.sanitizeString(newItem.toLowerCase()))) return;
					let groupToUpdate = findObjs({ type: 'tableitem', rollabletableid: groupTable.id }).find(item => item.get('weight') == groupId);
					if (groupToUpdate) {
						groupToUpdate.set('name', newItem);
					}
					break;
			}
		};
		const findDirectlyLinkedQuests = (startingQuestId) => {
			const linkedQuests = [];
			const visited = new Set();
			function isDependentOnQuest(conditions, targetQuestId) {
				if (!conditions) return false;
				if (Array.isArray(conditions)) {
					return conditions.every(cond => {
						if (typeof cond === "string") {
							return cond === targetQuestId;
						} else if (typeof cond === "object" && cond.logic === "AND") {
							return isDependentOnQuest(cond.conditions, targetQuestId);
						} else if (typeof cond === "object" && cond.logic === "OR") {
							return false;
						}
						return false;
					});
				} else if (typeof conditions === "string") {
					return conditions === targetQuestId;
				} else if (typeof conditions === "object" && conditions.logic === "AND") {
					return isDependentOnQuest(conditions.conditions, targetQuestId);
				}
				return false;
			}
			function traverse(questId) {
				if (visited.has(questId)) return;
				visited.add(questId);
				Object.entries(QUEST_TRACKER_globalQuestData).forEach(([currentQuestId, quest]) => {
					if (currentQuestId === questId || visited.has(currentQuestId)) return;

					const relationships = quest.relationships;
					if (relationships?.logic === "AND") {
						const conditions = relationships.conditions;
						if (isDependentOnQuest(conditions, questId)) {
							linkedQuests.push(currentQuestId);
							traverse(currentQuestId);
						}
					}
				});
			}
			traverse(startingQuestId);
			return linkedQuests;
		};
		const linkHandout = (questId, key) => {
			const quest = QUEST_TRACKER_globalQuestData[questId];
			if (key === "AUTO") {
				const handoutId = H.getBestMatchingHandout(quest.name);
				if (handoutId) linkHandout(questId, handoutId);
				else {
					const newHandout = createObj('handout', { name: quest.name });
					if (newHandout) linkHandout(questId, newHandout.id);
				}
			}
			else quest.handout = key;
			Utils.updateHandoutField('quest');
		};
		const removeHandout = (questId) => {
			const quest = QUEST_TRACKER_globalQuestData[questId];
			if (quest && quest.handout) {
				delete quest.handout;
			}
			Utils.updateHandoutField('quest');
		};
		return {
			getStatusNameByQuestId,
			getQuestStatus,
			getValidQuestsForDropdown,
			manageRelationship,
			addQuest,
			removeQuest,
			cleanUpLooseEnds,
			manageQuestObject,
			manageGroups,
			findDirectlyLinkedQuests,
			linkHandout,
			removeHandout
		};
	})(); 
	const Calendar = (() => {
		const H = {
			generateNewEventId: () => {
				const existingEventIds = Object.keys(QUEST_TRACKER_Events);
				const highestEventNumber = existingEventIds.reduce((max, id) => {
					const match = id.match(/^event_(\d+)$/);
					return match ? Math.max(max, parseInt(match[1], 10)) : max;
				}, 0);
				return `event_${highestEventNumber + 1}`;
			},
			checkEvent: () => {
				if (!QUEST_TRACKER_Events || typeof QUEST_TRACKER_Events !== "object") {
					return;
				}
				const todayEvents = H.findNextEvents(0, true);
				todayEvents.forEach(([eventDate, eventName, eventID]) => {
					if (eventID) {
						const event = QUEST_TRACKER_Events[eventID];
						if (errorCheck(13, 'exists', event, 'event')) return occurrences;
						if (event.hidden === false) {
							Utils.sendMessage(`${event.name} - ${event.description}`);
						} else {
							Utils.sendGMMessage(`Event triggered: ${event.name} - ${event.description}`);
						}
						if (!event.repeatable) {
							delete QUEST_TRACKER_Events[eventID];
							Utils.updateHandoutField("event");
						} else {
							const frequencyDays = event.frequency || 1;
							const [year, month, day] = event.date.split("-").map(Number);
							const nextDate = new Date(year, month - 1, day + frequencyDays)
								.toISOString()
								.split("T")[0];
							event.date = nextDate;
							Utils.updateHandoutField("event");
						}
					} else {
						Utils.sendMessage(`Today is ${eventName}`);
					}
				});
			},
			evaluateLogic: (logic, year) => {
				if (errorCheck(15, 'exists', logic,'logic')) return false;
				if (errorCheck(16, 'exists', logic.operation,'logic.operation')) return false;
				if (logic.conditions) {
					if (logic.operation === "or") {
						return logic.conditions.some((condition) => H.evaluateLogic(condition, year));
					} else if (logic.operation === "and") {
						return logic.conditions.every((condition) => H.evaluateLogic(condition, year));
					}
					errorCheck(17, 'msg', null,`Unsupported logic operation: ${logic.operation}`);
					return false;
				}
				if (logic.operation === "mod") {
					const result = (year % logic.operand) === logic.equals;
					return logic.negate ? !result : result;
				}
				errorCheck(18, 'msg', null,`Unsupported condition operation: ${logic.operation}`);
				return false;
			},
			getDaysInMonth: (monthIndex, year) => {
				const month = CALENDARS[QUEST_TRACKER_calenderType].months[monthIndex - 1];
				if (month.leap) {
					const isLeapYear = H.evaluateLogic(month.leap.logic, year);
					if (isLeapYear) {
						return month.leap.days;
					}
				}
				return month.days;
			},
			getTotalDaysInYear: (year) => {
				const calendar = CALENDARS[QUEST_TRACKER_calenderType];
				if (errorCheck(19, 'exists', calendar,'calendar')) return;
				if (errorCheck(20, 'exists', calendar.months,'calendar.monthsn')) return;
				return calendar.months.reduce((totalDays, monthObj, index) => {
					const daysInMonth = H.getDaysInMonth(index + 1, year);
					return totalDays + daysInMonth;
				}, 0);
			},
			calculateDateDifference: (target, baseYear, baseMonth, baseDay) => {
				if (!target) return Infinity;
				const calendar = CALENDARS[QUEST_TRACKER_calenderType];
				if (errorCheck(21, 'exists', calendar,'calendar')) return Infinity;
				const { year: targetYear, month: targetMonth, day: targetDay } = target;
				let totalDays = 0;
				if (targetYear === baseYear) {
					if (targetMonth === baseMonth) {
						return targetDay - baseDay;
					}
					totalDays += H.getDaysInMonth(baseMonth, baseYear) - baseDay;
					for (let m = baseMonth + 1; m < targetMonth; m++) {
						totalDays += H.getDaysInMonth(m, baseYear);
					}
					totalDays += targetDay;
					return totalDays;
				}
				totalDays += H.getDaysInMonth(baseMonth, baseYear) - baseDay;
				for (let m = baseMonth + 1; m <= calendar.months.length; m++) {
					totalDays += H.getDaysInMonth(m, baseYear);
				}
				for (let y = baseYear + 1; y < targetYear; y++) {
					totalDays += H.getTotalDaysInYear(y);
				}
				for (let m = 1; m < targetMonth; m++) {
					totalDays += H.getDaysInMonth(m, targetYear);
				}
				totalDays += targetDay;
				return totalDays;
			},
			isEventToday: (event, eventID) => {
				let { date, repeatable, frequency, name, weekdayname } = event;
				let [eventYear, eventMonth, eventDay] = date.split("-").map(Number);
				const [currentYear, currentMonth, currentDay] = QUEST_TRACKER_currentDate.split("-").map(Number);
				if (!repeatable) {
					return date === QUEST_TRACKER_currentDate ? [[QUEST_TRACKER_currentDate, name, eventID]] : [];
				}
				const freqType = frequencyMapping[frequency];
				switch (freqType) {
					case "Daily":
						return [[QUEST_TRACKER_currentDate, name, eventID]];
					case "Weekly":
						if (weekdayname && weekdayname === QUEST_TRACKER_currentWeekdayName) {
							return [[QUEST_TRACKER_currentDate, name, eventID]];
						}
						break;
					case "Monthly":
						const daysInMonth = H.getDaysInMonth(currentMonth, currentYear);
						if (eventDay <= daysInMonth && eventMonth === currentMonth && eventDay === currentDay) {
							return [[QUEST_TRACKER_currentDate, name, eventID]];
						}
						break;
					case "Yearly":
						if (eventMonth === currentMonth && eventDay === currentDay) {
							return [[QUEST_TRACKER_currentDate, name, eventID]];
						}
						break;
					default:
						break;
				}
				return [];
			},
			findNextEvents: (limit = 1, isToday = false) => {
				const calendar = CALENDARS[QUEST_TRACKER_calenderType];
				const daysOfWeek = calendar.daysOfWeek || [];
				const specialDays = calendar.significantDays || {};
				const events = QUEST_TRACKER_Events || {};
				const [currentYear, currentMonth, currentDay] = QUEST_TRACKER_currentDate.split("-").map(Number);
				let upcomingEvents = [];
				const todayEvents = [];
				if (isToday) {
					Object.entries(events).forEach(([eventID, event]) => {
						const todaysOccurrences = H.isEventToday(event, eventID);
						todayEvents.push(...todaysOccurrences);
					});
					Object.entries(specialDays).forEach(([key, name]) => {
						const [eventMonth, eventDay] = key.split("-").map(Number);
						if (eventMonth === currentMonth && eventDay === currentDay) {
							todayEvents.push([QUEST_TRACKER_currentDate, name, null]);
						}
					});
					return todayEvents;
				}
				const calculateNextOccurrences = (event, eventID, maxOccurrences) => {
					let { date, repeatable, frequency, name, weekdayname } = event;
					let [startYear, startMonth, startDay] = date.split("-").map(Number);
					let [currentYear, currentMonth, currentDay] = QUEST_TRACKER_currentDate.split("-").map(Number);
					let [eventYear, eventMonth, eventDay] = [startYear, startMonth, startDay];
					const occurrences = [];
					const freqType = repeatable ? frequencyMapping[frequency] : null;
					if (repeatable) {
						if (`${startYear}-${String(startMonth).padStart(2, "0")}-${String(startDay).padStart(2, "0")}` < QUEST_TRACKER_currentDate) {
							[eventYear, eventMonth, eventDay] = [currentYear, currentMonth, currentDay];
						}
						switch (freqType) {
							case "Daily":
								break;
							case "Weekly":
								if (weekdayname) {
									const targetWeekdayIndex = daysOfWeek.indexOf(weekdayname);
									const currentWeekdayIndex = daysOfWeek.indexOf(QUEST_TRACKER_currentWeekdayName);
									let daysToAdd = (targetWeekdayIndex - currentWeekdayIndex + daysOfWeek.length) % daysOfWeek.length;
									if (daysToAdd === 0 && (eventYear === currentYear && eventMonth === currentMonth && eventDay === currentDay)) {
										daysToAdd = daysOfWeek.length;
									}
									eventDay += daysToAdd;
									if (eventDay > H.getDaysInMonth(eventMonth, eventYear)) {
										eventDay -= H.getDaysInMonth(eventMonth, eventYear);
										eventMonth++;
										if (eventMonth > calendar.months.length) {
											eventMonth = 1;
											eventYear++;
										}
									}
								}
								break;
							case "Monthly":
								while (
									eventYear < currentYear ||
									(eventYear === currentYear && eventMonth < currentMonth)
								) {
									eventMonth++;
									if (eventMonth > calendar.months.length) {
										eventMonth = 1;
										eventYear++;
									}
								}
								eventDay = Math.min(eventDay, H.getDaysInMonth(eventMonth, eventYear));
								break;
							case "Yearly":
								if (eventYear < currentYear) {
									eventYear = currentYear;
								}
								break;
							default:
								break;
						}
					}
					let occurrencesCount = 0;
					while (occurrencesCount < maxOccurrences) {
						const eventDate = `${eventYear}-${String(eventMonth).padStart(2, "0")}-${String(eventDay).padStart(2, "0")}`;
						if (eventDate >= date) {
							occurrences.push([eventDate, name, eventID]);
							occurrencesCount++;
						}
						switch (freqType) {
							case "Daily":
								eventDay++;
								if (eventDay > H.getDaysInMonth(eventMonth, eventYear)) {
									eventDay -= H.getDaysInMonth(eventMonth, eventYear);
									eventMonth++;
									if (eventMonth > calendar.months.length) {
										eventMonth = 1;
										eventYear++;
									}
								}
								break;
							case "Weekly":
								eventDay += daysOfWeek.length;
								if (eventDay > H.getDaysInMonth(eventMonth, eventYear)) {
									eventDay -= H.getDaysInMonth(eventMonth, eventYear);
									eventMonth++;
									if (eventMonth > calendar.months.length) {
										eventMonth = 1;
										eventYear++;
									}
								}
								break;
							case "Monthly":
								eventMonth++;
								if (eventMonth > calendar.months.length) {
									eventMonth = 1;
									eventYear++;
								}
								eventDay = Math.min(eventDay, H.getDaysInMonth(eventMonth, eventYear));
								break;
							case "Yearly":
								eventYear++;
								break;
							default:
								break;
						}
						if (!repeatable) break;
					}
					return occurrences;
				};
				Object.entries(events).forEach(([eventID, event]) => {
					const eventOccurrences = calculateNextOccurrences(event, eventID, 5);
					upcomingEvents.push(...eventOccurrences);
				});
				Object.entries(specialDays).forEach(([key, name]) => {
					const [eventMonth, eventDay] = key.split("-").map(Number);
					let eventYear = currentYear;
					if (eventMonth < currentMonth || (eventMonth === currentMonth && eventDay < currentDay)) {
						eventYear++;
					}
					if (H.getDaysInMonth(eventMonth, eventYear) >= eventDay) {
						const eventDate = `${eventYear}-${String(eventMonth).padStart(2, "0")}-${String(eventDay).padStart(2, "0")}`;
						if (isToday) {
							if (eventDate === QUEST_TRACKER_currentDate) {
								todayEvents.push([eventDate, name, null]);
							}
						} else {
							if (eventDate > QUEST_TRACKER_currentDate) {
								upcomingEvents.push([eventDate, name, null]);
							}
						}
					}
				});
				upcomingEvents.sort((a, b) => {
					const [aYear, aMonth, aDay] = a[0].split("-").map(Number);
					const [bYear, bMonth, bDay] = b[0].split("-").map(Number);
					return H.calculateDateDifference({ year: aYear, month: aMonth, day: aDay }, currentYear, currentMonth, currentDay)
						- H.calculateDateDifference({ year: bYear, month: bMonth, day: bDay }, currentYear, currentMonth, currentDay);
				});

				return upcomingEvents.slice(0, limit);
			},
			calculateWeekday: (year, month, day) => {
				if (errorCheck(23, 'calendar', CALENDARS[QUEST_TRACKER_calenderType])) return;
				const calendar = CALENDARS[QUEST_TRACKER_calenderType];
				if (errorCheck(24, 'calendar.daysOfWeek', calendar.daysOfWeek)) return;
				if (errorCheck(25, 'calendar.startingWeekday', calendar.startingWeekday)) return;
				if (errorCheck(26, 'calendar.startingYear', calendar.startingYear)) return;
				const daysOfWeek = calendar.daysOfWeek;
				const startingWeekday = calendar.startingWeekday;
				const startingYear = calendar.startingYear;
				let totalDays = 0;
				for (let y = startingYear; y < year; y++) {
					totalDays += H.getTotalDaysInYear(y);
				}
				for (let m = 1; m < month; m++) {
					totalDays += typeof calendar.months[m - 1].days === "function"
						? calendar.months[m - 1].days(year)
						: calendar.months[m - 1].days;
				}
				totalDays += day - 1;
				return daysOfWeek[(daysOfWeek.indexOf(startingWeekday) + totalDays) % daysOfWeek.length];
			}
		};
		const determineWeather = (date) => {
			const W = {
				getSeasonBoundaries: (year) => {				
					if (errorCheck(27, 'exists', CALENDARS[QUEST_TRACKER_calenderType]?.climates[QUEST_TRACKER_Location], `CALENDARS[${QUEST_TRACKER_calenderType}]?.climates[${QUEST_TRACKER_Location}]`)) return;
					const climate = CALENDARS[QUEST_TRACKER_calenderType]?.climates[QUEST_TRACKER_Location];
					const boundaries = [];
					const seasonStart = climate.seasonStart || {};
					for (const [seasonName, startMonth] of Object.entries(seasonStart)) {
						let startDayOfYear = 0;
						const calendar = CALENDARS[QUEST_TRACKER_calenderType];
						for (let i = 0; i < startMonth - 1; i++) {
							const monthObj = calendar.months[i];
							startDayOfYear += typeof monthObj.days === "function" ? monthObj.days(year) : monthObj.days;
						}
						boundaries.push({ season: seasonName, startDayOfYear });
					}
					boundaries.sort((a, b) => a.startDayOfYear - b.startDayOfYear);
					const totalDaysInYear = H.getTotalDaysInYear(year);
					boundaries.forEach((boundary, i) => {
						const nextIndex = (i + 1) % boundaries.length;
						boundary.endDayOfYear =
							boundaries[nextIndex].startDayOfYear - 1 >= 0
								? boundaries[nextIndex].startDayOfYear - 1
								: totalDaysInYear - 1;
					});
					return boundaries;
				},
				getCurrentSeason: (date) => {
					const [year, month, day] = date.split("-").map(Number);
					const boundaries = W.getSeasonBoundaries(year);
					if (!boundaries || boundaries.length === 0) return null;
					let dayOfYear = 0;
					const calendar = CALENDARS[QUEST_TRACKER_calenderType];
					for (let i = 0; i < month - 1; i++) {
						const monthObj = calendar.months[i];
						dayOfYear += typeof monthObj.days === "function" ? monthObj.days(year) : monthObj.days;
					}
					dayOfYear += day;
					for (const { season, startDayOfYear, endDayOfYear } of boundaries) {
						if (startDayOfYear <= endDayOfYear) {
							if (dayOfYear >= startDayOfYear && dayOfYear <= endDayOfYear) {
								return { season, dayOfYear };
							}
						} else {
							if (dayOfYear >= startDayOfYear || dayOfYear <= endDayOfYear) {
								return { season, dayOfYear };
							}
						}
					}
					return null;
				},
				getSuddenSeasonalChangeProbability: (dayOfYear, boundaries) => {
					const buffer = 5;
					for (const { startDayOfYear, endDayOfYear } of boundaries) {
						if (Math.abs(dayOfYear - startDayOfYear) <= buffer || Math.abs(dayOfYear - endDayOfYear) <= buffer) {
							return 0.25;
						}
					}
					return 0.05;
				},
				applyForcedTrends: (rolls) => {
					const { temperatureRoll, precipitationRoll, windRoll, humidityRoll, visibilityRoll, cloudCoverRoll } = rolls;
					return {
						temperatureRoll: QUEST_TRACKER_FORCED_WEATHER_TRENDS.heat
							? Math.min(100, temperatureRoll + 20)
							: QUEST_TRACKER_FORCED_WEATHER_TRENDS.cold
							? Math.max(1, temperatureRoll - 20)
							: temperatureRoll,
						precipitationRoll: QUEST_TRACKER_FORCED_WEATHER_TRENDS.wet
							? Math.min(100, precipitationRoll + 20)
							: QUEST_TRACKER_FORCED_WEATHER_TRENDS.dry
							? Math.max(1, precipitationRoll - 20)
							: precipitationRoll,
						windRoll: QUEST_TRACKER_FORCED_WEATHER_TRENDS.wind
							? Math.min(100, windRoll + 20)
							: windRoll,
						humidityRoll: QUEST_TRACKER_FORCED_WEATHER_TRENDS.humid
							? Math.min(100, humidityRoll + 20)
							: humidityRoll,
						visibilityRoll: QUEST_TRACKER_FORCED_WEATHER_TRENDS.visibility
							? Math.min(100, visibilityRoll + 20)
							: visibilityRoll,
						cloudCoverRoll: QUEST_TRACKER_FORCED_WEATHER_TRENDS.cloudy
							? Math.min(100, cloudCoverRoll + 20)
							: cloudCoverRoll,
					};
				},
				applyTrends: (rolls) => {
					const { temperatureRoll, precipitationRoll, windRoll, humidityRoll, visibilityRoll, cloudCoverRoll } = rolls;
					return {
						temperatureRoll:
							temperatureRoll +
							(QUEST_TRACKER_WEATHER_TRENDS.heat || 0) * 2 -
							(QUEST_TRACKER_WEATHER_TRENDS.cold || 0) * 2,
						precipitationRoll:
							precipitationRoll +
							(QUEST_TRACKER_WEATHER_TRENDS.wet || 0) * 2 -
							(QUEST_TRACKER_WEATHER_TRENDS.dry || 0) * 2,
						windRoll: windRoll + (QUEST_TRACKER_WEATHER_TRENDS.wind || 0) * 2,
						humidityRoll: humidityRoll + (QUEST_TRACKER_WEATHER_TRENDS.humid || 0) * 2,
						visibilityRoll: visibilityRoll + (QUEST_TRACKER_WEATHER_TRENDS.visibility || 0) * 2,
						cloudCoverRoll: cloudCoverRoll + (QUEST_TRACKER_WEATHER_TRENDS.cloudy || 0) * 2,
					};
				},
				updateTrends: (rolls) => {
					["heat", "cold", "wet", "dry", "wind", "visibility", "cloudy"].forEach((trendType) => {
						const roll = rolls[`${trendType}Roll`];
						if (["wind", "visibility", "cloudy"].includes(trendType) && roll < 75) {
							QUEST_TRACKER_WEATHER_TRENDS[trendType] = 0;
						} else if (roll > 75) {
							QUEST_TRACKER_WEATHER_TRENDS[trendType] =
								(QUEST_TRACKER_WEATHER_TRENDS[trendType] || 0) + 1;
						} else if (QUEST_TRACKER_WEATHER_TRENDS[trendType]) {
							QUEST_TRACKER_WEATHER_TRENDS[trendType] = 0;
						}
					});
					if (rolls.precipitationRoll > 75) QUEST_TRACKER_WEATHER_TRENDS.dry = 0;
					if (rolls.temperatureRoll > 75) QUEST_TRACKER_WEATHER_TRENDS.cold = 0;
					if (rolls.temperatureRoll < 25) QUEST_TRACKER_WEATHER_TRENDS.heat = 0;
				},
				generateBellCurveRoll: (adj = 0) => {
					const randomGaussian = () => {
						let u = 0, v = 0;
						while (u === 0) u = Math.random();
						while (v === 0) v = Math.random();
						return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
					};
					const center = 50 + adj;
					const lowerBound = Math.max(0, center - 25);
					const upperBound = Math.min(100, center + 25);
					let roll = Math.random() * (upperBound - lowerBound) + lowerBound;
					let bias = roll <= center
						? Math.pow((roll - lowerBound) / (center - lowerBound), 2)
						: Math.pow((upperBound - roll) / (upperBound - center), 2);
					if (Math.random() < bias) {
						return Math.round(roll * 100) / 100;
					} else {
						return W.generateBellCurveRoll(adj);
					}
				},
				adjustDailyFluctuation: (date, trendAdjustedRolls, suddenChangeProbability, seasonBoundary) => {
					const previousWeather = QUEST_TRACKER_HISTORICAL_WEATHER[Object.keys(QUEST_TRACKER_HISTORICAL_WEATHER).reverse().find(d => d < date)];
					if (!previousWeather) return trendAdjustedRolls;
					const maxChange = suddenChangeProbability > 0.05 ? 10 : 5;
					const maxBoundaryChange = suddenChangeProbability > 0.05 ? 20 : 10;
					const adjustedRolls = { ...trendAdjustedRolls };
					Object.keys(adjustedRolls).forEach((key) => {
						const prevValue = previousWeather[key];
						if (prevValue !== undefined) {
							const boundaryLimit = seasonBoundary ? maxBoundaryChange : maxChange;
							const change = adjustedRolls[key] - prevValue;
							if (Math.abs(change) > boundaryLimit) {
								adjustedRolls[key] = prevValue + Math.sign(change) * boundaryLimit;
							}
						}
					});
					return adjustedRolls;
				}
			};
			const [year, month, day] = date.split("-").map(Number);
			const currentSeasonData = W.getCurrentSeason(date);
			if (!currentSeasonData) return;
			const { season, dayOfYear } = currentSeasonData;
			const boundaries = W.getSeasonBoundaries(year);
			const suddenChangeProbability = W.getSuddenSeasonalChangeProbability(dayOfYear, boundaries);
			const rolls = {
				temperatureRoll: W.generateBellCurveRoll(),
				precipitationRoll: W.generateBellCurveRoll(),
				windRoll: W.generateBellCurveRoll(-15),
				humidityRoll: W.generateBellCurveRoll(),
				visibilityRoll: W.generateBellCurveRoll(15),
				cloudCoverRoll: W.generateBellCurveRoll(),
			};
			const forcedAdjustedRolls = W.applyForcedTrends(rolls);
			const trendAdjustedRolls = W.applyTrends(forcedAdjustedRolls);
			W.updateTrends(trendAdjustedRolls);
			const climateModifiers = CALENDARS[QUEST_TRACKER_calenderType]?.climates[QUEST_TRACKER_Location]?.modifiers;
			trendAdjustedRolls.temperatureRoll += climateModifiers?.temperature?.[season] || 0;
			trendAdjustedRolls.precipitationRoll += climateModifiers?.precipitation?.[season] || 0;
			trendAdjustedRolls.windRoll += climateModifiers?.wind?.[season] || 0;
			trendAdjustedRolls.humidityRoll += climateModifiers?.humid?.[season] || 0;
			trendAdjustedRolls.visibilityRoll += climateModifiers?.visibility?.[season] || 0;
			const nearBoundary = suddenChangeProbability > 0.05;
			const isBoundaryDay = boundaries.some(({ startDayOfYear, endDayOfYear }) =>
				Math.abs(dayOfYear - startDayOfYear) <= 1 || Math.abs(dayOfYear - endDayOfYear) <= 1
			);
			const finalAdjustedRolls = W.adjustDailyFluctuation(date, trendAdjustedRolls, suddenChangeProbability, isBoundaryDay);
			Object.keys(finalAdjustedRolls).forEach((key) => {
				finalAdjustedRolls[key] = Math.max(1, Math.min(100, finalAdjustedRolls[key]));
			});
			const weather = {
				date,
				season,
				...finalAdjustedRolls,
				trends: { ...QUEST_TRACKER_WEATHER_TRENDS },
				forcedTrends: { ...QUEST_TRACKER_FORCED_WEATHER_TRENDS },
				nearBoundary,
			};
			QUEST_TRACKER_HISTORICAL_WEATHER[date] = weather;
			saveQuestTrackerData();
			Utils.updateHandoutField("weather");
		};
		const modifyDate = ({ type = "day", amount = 1, newDate = null }) => {
			const calendar = CALENDARS[QUEST_TRACKER_calenderType];
			if (errorCheck(28, 'exists', calendar,'calendar')) return;
			const L = {
				formatDate: (year, month, day) => {
					return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
				},
				wrapAround: () => {
					while (day > H.getDaysInMonth(month, year)) {
						day -= H.getDaysInMonth(month, year);
						month++;
						if (month > calendar.months.length) {
							month = 1;
							year++;
						}
					}
					while (day < 1) {
						month--;
						if (month < 1) {
							month = calendar.months.length;
							year--;
						}
						day += H.getDaysInMonth(month, year);
					}
				},
				generateDateArray: () => {
					const dates = [];
					let targetDate = null;
					if (type === "event") {
						const closestEvent = H.findNextEvents(1);
						if (!closestEvent || closestEvent.length === 0) {
							Utils.sendGMMessage("No upcoming festivals, events, or significant dates found.");
							return [];
						}
						targetDate = closestEvent[0][0];
					}
					while (steps >= 0 || targetDate) {
						dates.push(L.formatDate(year, month, day));
						if (type === "event" && targetDate) {
							const [targetYear, targetMonth, targetDay] = targetDate.split("-").map(Number);
							while (
								year !== targetYear ||
								month !== targetMonth ||
								day !== targetDay
							) {
								day += direction;
								L.wrapAround();
								dates.push(L.formatDate(year, month, day));
							}
							break;
						}
						switch (type) {
							case "day":
								day += direction;
								L.wrapAround();
								break;
							case "week":
								day += direction * calendar.daysOfWeek.length;
								L.wrapAround();
								break;
							case "month":
								month += direction;
								if (month > calendar.months.length) {
									month -= calendar.months.length;
									year++;
								} else if (month < 1) {
									month += calendar.months.length;
									year--;
								}
								day = Math.min(day, H.getDaysInMonth(month, year));
								break;
							case "year":
								year += direction;
								day = Math.min(day, H.getDaysInMonth(month, year));
								break;
							default:
								break;
						}
						steps--;
					}
					return dates;
				},
				generateCompleteDateList: (startDate, endDate) => {
					const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
					const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
					let currentYear = startYear, currentMonth = startMonth, currentDay = startDay;
					const dateList = [];
					while (
						currentYear < endYear ||
						(currentYear === endYear && currentMonth < endMonth) ||
						(currentYear === endYear && currentMonth === endMonth && currentDay <= endDay)
					) {
						dateList.push(L.formatDate(currentYear, currentMonth, currentDay));
						currentDay++;
						if (currentDay > H.getDaysInMonth(currentMonth, currentYear)) {
							currentDay = 1;
							currentMonth++;
							if (currentMonth > calendar.months.length) {
								currentMonth = 1;
								currentYear++;
							}
						}
					}
					dateList.push(L.formatDate(endYear, endMonth, endDay));
					return dateList;
				},
				validateISODate: (date) => {
					const [y, m, d] = date.split("-").map(Number);
					if (!y || !m || !d || m < 1 || m > calendar.months.length) {
						errorCheck(29, 'msg', null,`Invalid ISO date format or date out of range for calendar: ${date}`);
						return null;
					}
					const daysInMonth = H.getDaysInMonth(m, y);
					if (d < 1 || d > daysInMonth) {
						errorCheck(30, 'msg', null,`Day out of range for the specified month: ${date}`);
						return null;
					}
					return { year: y, month: m, day: d };
				},
				isAfterCurrentDate: (eventYear, eventMonth, eventDay) => {
					if (eventYear > year) return true;
					if (eventYear === year && eventMonth > month) return true;
					if (eventYear === year && eventMonth === month && eventDay > day) return true;
					return false;
				}
			};
			let [year, month, day] = QUEST_TRACKER_currentDate.split("-").map(Number);
			if (type === "set") {
				const { year: newYear, month: newMonth, day: newDay } = L.validateISODate(newDate);
				QUEST_TRACKER_currentDate = L.formatDate(newYear, newMonth, newDay);
				saveQuestTrackerData();
				return;
			}
			let steps = Math.abs(amount);
			let direction = Math.sign(amount);
			const dateArray = L.generateDateArray();
			if (QUEST_TRACKER_WEATHER && dateArray.length > 0) {
				dateArray.forEach((date) => {
					if (!QUEST_TRACKER_HISTORICAL_WEATHER[date]) {
						determineWeather(date);
					}
				});
			}
			const [finalYear, finalMonth, finalDay] = dateArray[dateArray.length - 1].split("-").map(Number);
			year = finalYear;
			month = finalMonth;
			day = finalDay;
			QUEST_TRACKER_currentDate = L.formatDate(year, month, day);
			QUEST_TRACKER_currentWeekdayName = H.calculateWeekday(year, month, day);
			H.checkEvent();
			Triggers.checkTriggers('date');
			describeWeather();
			saveQuestTrackerData();
			Utils.sendMessage(`Date is now: ${Calendar.formatDateFull()}`)
			Utils.sendDescMessage(QUEST_TRACKER_CURRENT_WEATHER['description']);
			Menu.buildWeather({ isMenu: false });
		};
		const addEvent = () => {
			const newEventId = H.generateNewEventId();
			const defaultEventData = {
				name: 'New Event',
				description: 'Description',
				date: `${QUEST_TRACKER_defaultDate}`,
				hidden: true,
				repeatable: false,
				frequency: null
			};
			QUEST_TRACKER_Events[newEventId] = defaultEventData;
			Utils.updateHandoutField('event');
		};
		const getNextEvents = (number) => {
			return H.findNextEvents(number);
		};
		const removeEvent = (eventId) => {
			delete QUEST_TRACKER_Events[eventId];
			Utils.updateHandoutField('event');
		};
		const manageEventObject = ({ action, field, current, old = '', newItem, date }) => {
			const event = QUEST_TRACKER_Events[current];
			switch (field) {
				case 'hidden':
					event.hidden = !event.hidden;
					break;
				case 'repeatable':
					event.repeatable = !event.repeatable;
					event.frequency = 1;
					break;
				case 'frequency':
					event.frequency = newItem;
					if (newItem === "2") {
						const [year, month, day] = date.split("-").map(Number);
						event.weekdayname = H.calculateWeekday(year, month, day);
					}
					break;
				case 'name':
					event.name = newItem;
					break;
				case 'date':
					event.date = newItem;
					if (event.frequency === "2" && event.repeatable) {
						const [year, month, day] = newItem.split("-").map(Number);
						event.weekdayname = H.calculateWeekday(year, month, day);
					}
					break;
				case 'description':
					event.description = newItem;
					break;
				default:
					errorCheck(31, 'msg', null,`Unknown field command: ${field}`);
					break;
			}
			Utils.updateHandoutField('event');
		};
		const setCalender = (calender) => {
			QUEST_TRACKER_calenderType = calender;
			const calendar = CALENDARS[calender];
			QUEST_TRACKER_currentDate = calendar.defaultDate;
			QUEST_TRACKER_defaultDate = calendar.defaultDate;
			const [year, month, day] = QUEST_TRACKER_currentDate.split("-").map(Number);
			QUEST_TRACKER_currentWeekdayName = H.calculateWeekday(year, month, day);
			const firstClimate = Object.keys(calendar.climates)[0];
			if (firstClimate) {
				setClimate(firstClimate);
			}
			saveQuestTrackerData();
		};
		const setClimate = (climate) => {
			const calendar = CALENDARS[QUEST_TRACKER_calenderType];
			QUEST_TRACKER_Location = climate;
			saveQuestTrackerData();
		};
		const setWeatherTrend = (type, amount) => {
			QUEST_TRACKER_WEATHER_TRENDS[type] = parseInt(QUEST_TRACKER_WEATHER_TRENDS[type], 10) || 0;
			amount = parseInt(amount, 10);
			QUEST_TRACKER_WEATHER_TRENDS[type] += amount;
			saveQuestTrackerData();
		};
		const formatDateFull = () => {
			const [year, month, day] = QUEST_TRACKER_currentDate.split("-").map(Number);
			const calendar = CALENDARS[QUEST_TRACKER_calenderType];
			const monthName = calendar.months[month - 1].name;
			const format = calendar.dateFormat || "{day}{ordinal} of {month}, {year}";
			const ordinal = (n) => {
				const s = ["th", "st", "nd", "rd"];
				const v = n % 100;
				return s[(v - 20) % 10] || s[v] || s[0];
			};
			return format
				.replace("{day}", day)
				.replace("{ordinal}", ordinal(day))
				.replace("{month}", monthName)
				.replace("{year}", year);
		};
		const forceWeatherTrend = (field) => {
			const fieldList = ["dry", "wet", "heat", "cold"];
			const isCurrentlyTrue = QUEST_TRACKER_FORCED_WEATHER_TRENDS[field];
			QUEST_TRACKER_FORCED_WEATHER_TRENDS[field] = !isCurrentlyTrue;
			if (QUEST_TRACKER_FORCED_WEATHER_TRENDS[field] === true) {
				fieldList
					.filter((f) => f !== field)
					.forEach((f) => {
						QUEST_TRACKER_FORCED_WEATHER_TRENDS[f] = false;
					});
			}
			saveQuestTrackerData();
		};
		const getLunarPhase = (date, moonId) => {
			const calendar = CALENDARS[QUEST_TRACKER_calenderType];
			if (errorCheck(153, 'exists', calendar.lunarCycle, `calendar.lunarCycle`)) return;
			if (errorCheck(154, 'exists', calendar.lunarCycle[moonId], `calendar.lunarCycle[${moonId}]`)) return;
			const { baselineNewMoon, cycleLength, phases, name } = calendar.lunarCycle[moonId];
			const baselineDate = new Date(baselineNewMoon);
			const currentDate = new Date(date);
			const daysSinceBaseline = (currentDate - baselineDate) / (1000 * 60 * 60 * 24);
			const phase = (daysSinceBaseline % cycleLength + cycleLength) % cycleLength;
			for (const { name: phaseName, start, end } of phases) {
				if (phase >= start && phase < end) {
					return `${name}: ${phaseName}`;
				}
			}
			return `${name}: Unknown Phase`;
		};
		const describeWeather = () => {
			const L = {
				meetsCondition: (value, cond) => {
					if (cond.gte !== undefined && value < cond.gte) return false;
					if (cond.lte !== undefined && value > cond.lte) return false;
					return true;
				},
				matchesConditions: (rolls, conditions, ignoreKeys = []) => {
					for (const [metric, cond] of Object.entries(conditions)) {
						if (ignoreKeys.includes(metric)) continue;
						const val = rolls[metric];
						if (val === undefined) return false;
						if (!L.meetsCondition(val, cond)) return false;
					}
					return true;
				},
				countMatches: (rolls, conditions, ignoreKeys = []) => {
					let matchCount = 0;
					for (const [metric, cond] of Object.entries(conditions)) {
						if (ignoreKeys.includes(metric)) continue;
						const val = rolls[metric];
						if (val !== undefined && L.meetsCondition(val, cond)) {
							matchCount++;
						}
					}
					return matchCount;
				},
				determineWeatherType: (rolls) => {
					const WEATHER_TYPES = WEATHER.weather;
					let matches = [];
					for (const [typeName, typeData] of Object.entries(WEATHER_TYPES)) {
						if (L.matchesConditions(rolls, typeData.conditions)) {
							matches.push(typeName);
						}
					}
					if (matches.length > 0) {
						const chosenMatch = matches[Math.floor(Math.random() * matches.length)];
						return { type: chosenMatch };
					}
					matches = [];
					for (const [typeName, typeData] of Object.entries(WEATHER_TYPES)) {
						if (L.matchesConditions(rolls, typeData.conditions, ['visibility'])) {
							matches.push(typeName);
						}
					}
					if (matches.length > 0) {
						const chosenMatch = matches[Math.floor(Math.random() * matches.length)];
						return { type: chosenMatch };
					}
					matches = [];
					for (const [typeName, typeData] of Object.entries(WEATHER_TYPES)) {
						if (L.matchesConditions(rolls, typeData.conditions, ['visibility', 'cloudCover'])) {
							matches.push(typeName);
						}
					}
					if (matches.length > 0) {
						const chosenMatch = matches[Math.floor(Math.random() * matches.length)];
						return { type: chosenMatch };
					}
					let bestType = null;
					let bestCount = -1;
					for (const [typeName, typeData] of Object.entries(WEATHER_TYPES)) {
						const count = L.countMatches(rolls, typeData.conditions);
						if (count > bestCount) {
							bestCount = count;
							bestType = typeName;
						}
					}
					if (bestType) {
						return { type: bestType };
					}
					return { type: "unclassified normal weather" };
				},
				getScaleDescription: (metric, value) => {
					const scaleEntries = Object.entries(WEATHER.scales[metric]);
					const numericKeys = scaleEntries.map(([k]) => parseInt(k,10)).sort((a,b) => a - b);
					let chosenKey = numericKeys[0];
					for (let k of numericKeys) {
						if (k <= value) {
							chosenKey = k;
						} else {
							break;
						}
					}
					return WEATHER.scales[metric][chosenKey.toString()].description;
				}
			};
			const todayWeather = QUEST_TRACKER_HISTORICAL_WEATHER[QUEST_TRACKER_currentDate];
			if (!todayWeather) return;
			const rolls = {
				temperature: todayWeather.temperatureRoll,
				precipitation: todayWeather.precipitationRoll,
				wind: todayWeather.windRoll,
				humidity: todayWeather.humidityRoll,
				cloudCover: todayWeather.cloudCoverRoll,
				visibility: todayWeather.visibilityRoll
			};
			const result = L.determineWeatherType(rolls);
			const chosenType = result.type;
			let chosenWeatherData;
			if (WEATHER.weather[chosenType]) {
				chosenWeatherData = WEATHER.weather[chosenType];
			} else {
				chosenWeatherData = {
					descriptions: {
						[QUEST_TRACKER_WeatherLocation]: {
							"1": "Unclassified normal weather conditions."
						}
					}
				};
			}
			const envDescriptions = chosenWeatherData.descriptions[QUEST_TRACKER_WeatherLocation] || { "1": "No description available." };
			const envDescriptionKeys = Object.keys(envDescriptions);
			const randomDescKey = envDescriptionKeys[Math.floor(Math.random() * envDescriptionKeys.length)];
			const chosenDescription = envDescriptions[randomDescKey];
			QUEST_TRACKER_CURRENT_WEATHER = {
				weatherType: chosenType,
				description: chosenDescription,
				environment: WEATHER.enviroments[QUEST_TRACKER_WeatherLocation] ? WEATHER.enviroments[QUEST_TRACKER_WeatherLocation].name : QUEST_TRACKER_WeatherLocation,
				rolls: { ...rolls },
				scaleDescriptions: {
					temperature: L.getScaleDescription("temperature", rolls.temperature),
					humidity: L.getScaleDescription("humidity", rolls.humidity),
					wind: L.getScaleDescription("wind", rolls.wind),
					precipitation: L.getScaleDescription("precipitation", rolls.precipitation),
					cloudCover: L.getScaleDescription("cloudCover", rolls.cloudCover),
					visibility: L.getScaleDescription("visibility", rolls.visibility)
				}
			};
		};
		const adjustLocation = (location) => {
			if (WEATHER.enviroments.hasOwnProperty(location)) {
				QUEST_TRACKER_WeatherLocation = location;
				saveQuestTrackerData();
			} else return;
		};
		return {
			modifyDate,
			addEvent,
			removeEvent,
			manageEventObject,
			setCalender,
			formatDateFull,
			setClimate,
			setWeatherTrend,
			forceWeatherTrend,
			getLunarPhase,
			getNextEvents,
			adjustLocation
		};
	})();
	const QuestPageBuilder = (() => {
		const vars = {
			DEFAULT_PAGE_UNIT: 70,
			AVATAR_SIZE: 70,
			TEXT_FONT_SIZE: 14,
			PAGE_HEADER_WIDTH: 700,
			PAGE_HEADER_HEIGHT: 150,
			ROUNDED_RECT_WIDTH: 280,
			ROUNDED_RECT_HEIGHT: 60,
			ROUNDED_RECT_CORNER_RADIUS: 10,
			VERTICAL_SPACING: 100,
			HORIZONTAL_SPACING: 160,
			DEFAULT_FILL_COLOR: '#CCCCCC',
			DEFAULT_STATUS_COLOR: '#000000',
			QUESTICON_WIDTH: 305,
			GROUP_SPACING: 800,
			QUESTICON_HEIGHT: 92
		};
		const H = {
			adjustPageSettings: (page) => {
				page.set({
					showgrid: false,
					snapping_increment: 0,
					diagonaltype: 'facing',
					scale_number: 1,
				});
			},
			adjustPageSizeToFitPositions: (page, questPositions) => {
				const positions = Object.values(questPositions);
				if (positions.length === 0) return;
				const minX = Math.min(...positions.map(pos => pos.x));
				const maxX = Math.max(...positions.map(pos => pos.x));
				const minY = Math.min(...positions.map(pos => pos.y));
				const maxY = Math.max(...positions.map(pos => pos.y));
				const requiredWidthInPixels = (maxX - minX) + vars.ROUNDED_RECT_WIDTH + vars.HORIZONTAL_SPACING * 2;
				const requiredHeightInPixels = (maxY - minY) + vars.ROUNDED_RECT_HEIGHT + vars.VERTICAL_SPACING * 2 + vars.PAGE_HEADER_HEIGHT;
				const requiredWidthInUnits = Math.ceil(requiredWidthInPixels / vars.DEFAULT_PAGE_UNIT);
				const requiredHeightInUnits = Math.ceil(requiredHeightInPixels / vars.DEFAULT_PAGE_UNIT);
				page.set({ width: requiredWidthInUnits, height: requiredHeightInUnits });
			},
			clearPageObjects: (pageId, callback) => {
				const pageElements = [
					...findObjs({ _type: 'graphic', _pageid: pageId }),
					...findObjs({ _type: 'path', _pageid: pageId }),
					...findObjs({ _type: 'text', _pageid: pageId })
				];
				pageElements.forEach(obj => obj.remove());
				if (typeof callback === 'function') callback();
			},
			buildPageHeader: (page) => {
				const titleText = 'Quest Tracker Quest Tree';
				const descriptionText = 'A visual representation of all quests.';
				const pageWidth = page.get('width') * vars.DEFAULT_PAGE_UNIT;
				const titleX = pageWidth / 2;
				const titleY = 70;
				D.drawText(page.id, titleX, titleY, titleText, '#000000', 'map', 32, 'Contrail One', null, 'center', 'middle');
				const descriptionY = titleY + 40;
				D.drawText(page.id, titleX, descriptionY, descriptionText, '#666666', 'map', 18, 'Contrail One', null, 'center', 'middle');
			},
			storeQuestRef: (questId, type, objRef, target = null) => {
				if (!QUEST_TRACKER_TreeObjRef[questId]) {
					QUEST_TRACKER_TreeObjRef[questId] = { paths: {} };
				}
				if (type === 'paths' && target) {
					if (!QUEST_TRACKER_TreeObjRef[questId][type][target]) {
						QUEST_TRACKER_TreeObjRef[questId][type][target] = [];
					}
					QUEST_TRACKER_TreeObjRef[questId][type][target].push(objRef);
				} else {
					QUEST_TRACKER_TreeObjRef[questId][type] = objRef;
				}
				saveQuestTrackerData();
			},
			replaceImageSize: (imgsrc) => {
				return imgsrc.replace(/\/(med|original|max|min)\.(gif|jpg|jpeg|bmp|webp|png)(\?.*)?$/i, '/thumb.$2$3');
			},
			trimText: (text, maxLength = 150) => {
				if (text.length > maxLength) {
					return text.slice(0, maxLength - 3) + '...';
				}
				return text;
			},
			getStatusColor: (status) => {
				switch (status) {
					case 'Unknown':
						return '#A9A9A9';
					case 'Discovered':
						return '#ADD8E6';
					case 'Started':
						return '#87CEFA';
					case 'Ongoing':
						return '#FFD700';
					case 'Completed':
						return '#32CD32';
					case 'Completed By Someone Else':
						return '#4682B4';
					case 'Failed':
						return '#FF6347';
					case 'Time ran out':
						return '#FF8C00';
					case 'Ignored':
						return '#D3D3D3';
					default:
						return '#CCCCCC';
				}
			},
			buildDAG: (questData, vars) => {
				const questPositions = {};
				const groupMap = {};
				const mutualExclusivityClusters = [];
				const visitedForClusters = new Set();
				const enabledQuests = Object.keys(questData).filter((questId) => !questData[questId]?.disabled);
				function findMutualExclusivityCluster(startQuestId) {
					const cluster = new Set();
					const stack = [startQuestId];
					while (stack.length > 0) {
						const questId = stack.pop();
						if (!cluster.has(questId)) {
							cluster.add(questId);
							visitedForClusters.add(questId);
							const mutuallyExclusiveQuests =
								questData[questId]?.relationships?.mutually_exclusive || [];
							mutuallyExclusiveQuests.forEach((meQuestId) => {
								if (!cluster.has(meQuestId) && enabledQuests.includes(meQuestId)) {
									stack.push(meQuestId);
								}
							});
						}
					}
					return cluster;
				}
				enabledQuests.forEach((questId) => {
					if (!visitedForClusters.has(questId)) {
						const cluster = findMutualExclusivityCluster(questId);
						mutualExclusivityClusters.push(cluster);
					}
				});
				const questIdToClusterIndex = {};
				mutualExclusivityClusters.forEach((cluster, index) => {
					cluster.forEach((questId) => {
						questIdToClusterIndex[questId] = index;
					});
				});
				const calculateInitialLevels = (questId, visited = new Set()) => {
					if (visited.has(questId)) return questData[questId].level || 0;
					visited.add(questId);
					const prereqs = questData[questId]?.relationships?.conditions || [];
					if (prereqs.length === 0) {
						questData[questId].level = 0;
						return 0;
					}
					const prereqLevels = prereqs.map((prereq) => {
						let prereqId;
						if (typeof prereq === "string") {
							prereqId = prereq;
						} else if (typeof prereq === "object" && prereq.conditions) {
							prereqId = prereq.conditions[0]; // Simplification
						}
						return calculateInitialLevels(prereqId, new Set(visited)) + 1;
					});
					const level = Math.max(...prereqLevels);
					questData[questId].level = level;
					return level;
				};
				enabledQuests.forEach((questId) => calculateInitialLevels(questId));
				enabledQuests.forEach((questId) => {
					const group = questData[questId]?.group || "Default Group";
					if (!groupMap[group]) groupMap[group] = [];
					groupMap[group].push(questId);
				});
				const groupWidths = {};
				const groupOrder = Object.keys(groupMap);
				Object.entries(groupMap).forEach(([groupName, groupQuests]) => {
					const levels = {};
					groupQuests.forEach((questId) => {
						const level = questData[questId].level;
						if (!levels[level]) levels[level] = [];
						levels[level].push(questId);
					});
					const sortedLevels = Object.keys(levels).map(Number).sort((a, b) => a - b);
					let maxLevelWidth = 0;
					sortedLevels.forEach((level) => {
						let questsAtLevel = levels[level];
						const totalQuests = questsAtLevel.length;
						const clustersAtLevel = {};
						questsAtLevel.forEach((questId) => {
							const clusterIndex = questIdToClusterIndex[questId] || null;
							if (clusterIndex !== null) {
								if (!clustersAtLevel[clusterIndex]) clustersAtLevel[clusterIndex] = new Set();
								clustersAtLevel[clusterIndex].add(questId);
							} else {
								if (!clustersAtLevel["no_cluster"]) clustersAtLevel["no_cluster"] = new Set();
								clustersAtLevel["no_cluster"].add(questId);
							}
						});
						const arrangedQuests = [];
						Object.values(clustersAtLevel).forEach((cluster) => {
							arrangedQuests.push(...Array.from(cluster));
						});
						levels[level] = arrangedQuests;
						const levelWidth =
							arrangedQuests.length * vars.ROUNDED_RECT_WIDTH +
							(arrangedQuests.length - 1) * vars.HORIZONTAL_SPACING;
						maxLevelWidth = Math.max(maxLevelWidth, levelWidth);
					});
					groupWidths[groupName] = maxLevelWidth;
				});
				const totalTreeWidth = groupOrder.reduce((sum, groupName, index) => {
					return sum + groupWidths[groupName] + (index > 0 ? vars.GROUP_SPACING : 0);
				}, 0);
				let cumulativeGroupWidth = -totalTreeWidth / 2;
				groupOrder.forEach((groupName) => {
					const groupQuests = groupMap[groupName];
					const levels = {};
					groupQuests.forEach((questId) => {
						const level = questData[questId].level;
						if (!levels[level]) levels[level] = [];
						levels[level].push(questId);
					});
					const sortedLevels = Object.keys(levels).map(Number).sort((a, b) => a - b);
					sortedLevels.forEach((level) => {
						let questsAtLevel = levels[level];
						const totalQuests = questsAtLevel.length;
						const arrangedQuests = levels[level];
						const levelWidth =
							arrangedQuests.length * vars.ROUNDED_RECT_WIDTH +
							(arrangedQuests.length - 1) * vars.HORIZONTAL_SPACING;
						const levelStartX = cumulativeGroupWidth + (groupWidths[groupName] - levelWidth) / 2;
						arrangedQuests.forEach((questId, index) => {
							const x =
								levelStartX + index * (vars.ROUNDED_RECT_WIDTH + vars.HORIZONTAL_SPACING);
							const y = level * (vars.ROUNDED_RECT_HEIGHT + vars.VERTICAL_SPACING);
							questPositions[questId] = {
								x: x,
								y: y,
								group: groupName,
							};
						});
					});
					cumulativeGroupWidth += groupWidths[groupName] + vars.GROUP_SPACING;
				});
				return questPositions;
			}
		};
		const D = {
			drawQuestTreeFromPositions: (page, questPositions, callback) => {
				const totalWidth = page.get('width') * vars.DEFAULT_PAGE_UNIT;
				Object.entries(questPositions).forEach(([questId, position]) => {
					const questData = QUEST_TRACKER_globalQuestData[questId];
					if (!questData) {
						errorCheck(32, 'msg', null,`Quest data for "${questId}" is missing.`);
						return;
					}
					const x = position.x + totalWidth / 2;
					const y = position.y + vars.PAGE_HEADER_HEIGHT + vars.VERTICAL_SPACING;
					const isHidden = questData.hidden || false;
					D.drawQuestGraphics(questId, questData, page.id, x, y, isHidden);
				});
				if (typeof callback === 'function') callback();
			},
			drawQuestGraphics: (questId, questData, pageId, x, y, isHidden) => {
				const questTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTS })[0];
				if (!questTable) {
					errorCheck(33, 'msg', null,`Quests rollable table not found.`);
					return;
				}
				const questTableItems = findObjs({ type: 'tableitem', rollabletableid: questTable.id });
				const questTableItem = questTableItems.find(item => item.get('name').toLowerCase() === questId.toLowerCase());
				if (!questTableItem) {
					errorCheck(34, 'msg', null,`Rollable table item for quest "${questId}" not found.`);
					return;
				}
				const statusWeight = questTableItem.get('weight');
				const statusName = statusMapping[statusWeight] || 'Unknown';
				const statusColor = H.getStatusColor(statusName);
				let imgsrc = questTableItem.get('avatar');
				if (!imgsrc || !imgsrc.includes('https://')) {
					imgsrc = QUEST_TRACKER_BASE_QUEST_ICON_URL;
				} else {
					imgsrc = H.replaceImageSize(imgsrc);
				}
				D.drawRoundedRectangle(pageId, x, y, vars.ROUNDED_RECT_WIDTH, vars.ROUNDED_RECT_HEIGHT, vars.ROUNDED_RECT_CORNER_RADIUS, statusColor, isHidden ? 'gmlayer' : 'map', questId);
				const avatarSpacing = 10;
				const avatarX = x;
				const avatarY = y - (vars.ROUNDED_RECT_HEIGHT / 2) - (vars.AVATAR_SIZE / 2) - avatarSpacing;
				if (imgsrc !== '') D.placeAvatar(pageId, avatarX, avatarY, vars.AVATAR_SIZE, imgsrc, isHidden ? 'gmlayer' : 'objects', questId);
			},
			drawQuestTextAfterGraphics: (page, questPositions) => {
				const totalWidth = page.get('width') * vars.DEFAULT_PAGE_UNIT;
				Object.entries(questPositions).forEach(([questId, position]) => {
					const questData = QUEST_TRACKER_globalQuestData[questId];
					if (!questData) {
						errorCheck(35, 'msg', null,`Quest data for "${questId}" is missing.`);
						return;
					}
					const x = position.x + totalWidth / 2;
					const y = position.y + vars.PAGE_HEADER_HEIGHT + vars.VERTICAL_SPACING;
					const isHidden = questData.hidden || false;
					const textLayer = isHidden ? 'gmlayer' : 'objects';
					D.drawText(
						page.id,
						x,
						y,
						questData.name,
						'#000000',
						textLayer,
						vars.TEXT_FONT_SIZE,
						'Contrail One',
						questId,
						'center',
						'middle'
					);
				});
			},
			drawQuestConnections: (pageId, questPositions) => {
				const page = getObj('page', pageId);
				const pageWidth = page.get('width') * vars.DEFAULT_PAGE_UNIT;
				const offsetX = pageWidth / 2;
				const incomingPaths = {};
				Object.entries(questPositions).forEach(([questId, position]) => {
					const questData = QUEST_TRACKER_globalQuestData[questId];
					if (!questData) {
						errorCheck(36, 'msg', null,`Quest data for "${questId}" is missing.`);
						return;
					}
					(questData.relationships?.conditions || []).forEach(prereq => {
						let prereqId = prereq;
						if (typeof prereq === 'object' && prereq.conditions) {
							prereqId = prereq.conditions[0];
						}
						if (!incomingPaths[prereqId]) {
							incomingPaths[prereqId] = [];
						}
						incomingPaths[prereqId].push(questId);
					});
				});
				Object.entries(questPositions).forEach(([questId, position]) => {
					const questData = QUEST_TRACKER_globalQuestData[questId];
					if (!questData) {
						errorCheck(37, 'msg', null,`Quest data for "${questId}" is missing.`);
						return;
					}
					const startX = position.x + offsetX;
					const startY = position.y + vars.PAGE_HEADER_HEIGHT + vars.VERTICAL_SPACING;
					const startPos = {
						x: startX,
						y: startY
					};
					(questData.relationships?.conditions || []).forEach(prereq => {
						let prereqId = prereq;
						if (typeof prereq === 'object' && prereq.conditions) {
							prereqId = prereq.conditions[0];
						}
						const prereqPosition = questPositions[prereqId];
						if (!prereqPosition) {
							errorCheck(38, 'msg', null,`Position data for prerequisite "${prereqId}" is missing.`);
							return;
						}
						const endX = prereqPosition.x + offsetX;
						const endY = prereqPosition.y + vars.PAGE_HEADER_HEIGHT + vars.VERTICAL_SPACING;
						const endPos = {
							x: endX,
							y: endY
						};
						let midY;
						if (incomingPaths[prereqId].length > 1) {
							midY = endPos.y + vars.VERTICAL_SPACING / 2;
						} else {
							midY = (startPos.y + endPos.y) / 2;
						}
						const isHidden = questData.hidden || QUEST_TRACKER_globalQuestData[prereqId]?.hidden;
						const connectionColor = isHidden ? '#CCCCCC' : '#000000';
						const connectionLayer = isHidden ? 'gmlayer' : 'map';
						D.drawPath(pageId, startPos, endPos, connectionColor, connectionLayer, questId, prereqId, midY);
					});
				});
			},
			drawPath: (pageId, startPos, endPos, color = '#FF0000', layer = 'objects', questId, pathToQuestId, controlY = null, isMutualExclusion = false) => {
				let pathData;
				let left, top, width, height;
				controlY = (controlY === null) ? (startPos.y + endPos.y) / 2 : controlY;
				if (isMutualExclusion) {
					pathData = [
						['M', startPos.x, startPos.y],
						['L', endPos.x, endPos.y]
					];
				} else {
					pathData = [
						['M', startPos.x, startPos.y],
						['L', startPos.x, controlY],
						['L', endPos.x, controlY],
						['L', endPos.x, endPos.y]
					];
				}
				const minX = Math.min(startPos.x, endPos.x);
				const maxX = Math.max(startPos.x, endPos.x);
				const minY = Math.min(startPos.y, endPos.y, controlY);
				const maxY = Math.max(startPos.y, endPos.y, controlY);
				left = (minX + maxX) / 2;
				top = (minY + maxY) / 2;
				width = maxX - minX;
				height = maxY - minY;
				const adjustedPathData = pathData.map(command => {
					const [cmd, ...coords] = command;
					const adjustedCoords = coords.map((coord, index) => {
						return coord - (index % 2 === 0 ? left : top);
					});
					return [cmd, ...adjustedCoords];
				});
				const pathObj = createObj('path', {
					_pageid: pageId,
					layer: layer,
					stroke: color,
					fill: 'transparent',
					path: JSON.stringify(adjustedPathData),
					stroke_width: 2,
					controlledby: '',
					left: left,
					top: top,
					width: width,
					height: height
				});
				if (pathObj) {
					if (isMutualExclusion) {
						H.storeQuestRef(questId, 'mutualExclusion', pathObj.id, pathToQuestId);
						H.storeQuestRef(pathToQuestId, 'mutualExclusion', pathObj.id, questId);
					} else {
						H.storeQuestRef(questId, 'paths', pathObj.id, pathToQuestId);
						H.storeQuestRef(pathToQuestId, 'paths', pathObj.id, questId);
					}
				}
			},
			drawMutuallyExclusiveConnections: (pageId, questPositions) => {
				const page = getObj('page', pageId);
				const pageWidth = page.get('width') * vars.DEFAULT_PAGE_UNIT;
				const offsetX = pageWidth / 2;
				const mutualExclusions = [];
				Object.entries(QUEST_TRACKER_globalQuestData).forEach(([questId, questData]) => {
					const mutuallyExclusiveWith = questData.relationships?.mutually_exclusive || [];
					mutuallyExclusiveWith.forEach(otherQuestId => {
						if (questId < otherQuestId) {
							mutualExclusions.push([questId, otherQuestId]);
						}
					});
				});
				mutualExclusions.forEach(([questId1, questId2]) => {
					const position1 = questPositions[questId1];
					const position2 = questPositions[questId2];
					if (!position1 || !position2) {
						errorCheck(39, 'msg', null,`Position data for quests "${questId1}" or "${questId2}" is missing.`);
						return;
					}
					const x1 = position1.x + offsetX;
					const y1 = position1.y + vars.PAGE_HEADER_HEIGHT + vars.VERTICAL_SPACING;
					const x2 = position2.x + offsetX;
					const y2 = position2.y + vars.PAGE_HEADER_HEIGHT + vars.VERTICAL_SPACING;
					const startPos = { x: x1, y: y1 };
					const endPos = { x: x2, y: y2 };
					const questData1 = QUEST_TRACKER_globalQuestData[questId1];
					const questData2 = QUEST_TRACKER_globalQuestData[questId2];
					const isHidden = questData1.hidden || questData2.hidden;
					const connectionLayer = isHidden ? 'gmlayer' : 'map';
					D.drawPath(pageId, startPos, endPos, '#FF0000', connectionLayer, questId1, questId2, null, true);
				});
			},
			drawText: (pageId, x, y, textContent, color = '#000000', layer = 'objects', font_size = vars.TEXT_FONT_SIZE, font_family = 'Arial', questId, text_align = 'center', vertical_align = 'middle') => {
				const textObj = createObj('text', {
					_pageid: pageId,
					left: x,
					top: y,
					text: textContent,
					font_size: font_size,
					color: color,
					layer: layer,
					font_family: font_family,
					text_align: text_align
				});
				if (textObj) {
					if (vertical_align !== 'middle') {
						const textHeight = font_size;
						let adjustedTop = y;
						if (vertical_align === 'top') {
							adjustedTop = y - (textHeight / 2);
						} else if (vertical_align === 'bottom') {
							adjustedTop = y + (textHeight / 2);
						}
						textObj.set('top', adjustedTop);
					}
					if (questId) {
						H.storeQuestRef(questId, 'text', textObj.id);
					}
				}
			},
			placeAvatar: (pageId, x, y, avatarSize, imgsrc, layer = 'objects', questId) => {
				const questData = QUEST_TRACKER_globalQuestData[questId];
				let tooltipText = `${questData.description || 'No description available.'}`;
				let trimmedText = H.trimText(tooltipText, 150);
				let handoutLink = questData.handout ? `[Open Handout](http://journal.roll20.net/handout/${questData.handout})` : '';
				const avatarObj = createObj('graphic', {
					_pageid: pageId,
					left: x,
					top: y,
					width: avatarSize,
					height: avatarSize,
					layer: layer,
					imgsrc: imgsrc,
					tooltip: trimmedText,
					controlledby: '',
					gmnotes: `
						[Open Quest](!qt-menu action=quest|id=${questId})
						[Toggle Visibilty](!qt-quest action=update|field=hidden|current=${questId}|old=${questData.hidden}|new=${questData.hidden ? 'false ' : 'true'})
						[Change Status](!qt-quest action=update|field=status|current=${questId}|new=?{Change Status|Unknown,1|Discovered,2|Started,3|Ongoing,4|Completed,5|Completed By Someone Else,6|Failed,7|Time ran out,8|Ignored,9})
						<hr>${handoutLink}
					`,
					name: `${questData.name || 'No description available.'}`
				});
				if (avatarObj) {
					H.storeQuestRef(questId, 'avatar', avatarObj.id);
				}
			},
			drawRoundedRectangle: (pageId, x, y, width, height, radius, statusColor, layer = 'objects', questId) => {
				let pathData = [];
				const w = width;
				const h = height;
				pathData = [
					['M', -w / 2, -h / 2],
					['L', w / 2, -h / 2],
					['L', w / 2, h / 2],
					['L', -w / 2, h / 2],
					['L', -w / 2, -h / 2],
					['Z']
				];
				const rectObj = createObj('path', {
					_pageid: pageId,
					layer: layer,
					stroke: statusColor,
					fill: "#FAFAD2",
					path: JSON.stringify(pathData),
					stroke_width: 4,
					controlledby: '',
					left: x,
					top: y,
					width: width,
					height: height
				});
				if (rectObj) {
					H.storeQuestRef(questId, 'rectangle', rectObj.id);
				}
			},
			redrawQuestText: (questId) => {
				let pageObj = findObjs({ _type: 'page', name: QUEST_TRACKER_pageName })[0];
				if (!pageObj) return;
				const pageId = pageObj.id;
				if (!QUEST_TRACKER_TreeObjRef[questId] || !QUEST_TRACKER_TreeObjRef[questId].text) return;
				const textObjId = QUEST_TRACKER_TreeObjRef[questId].text;
				const textObj = getObj('text', textObjId);				
				if (textObj) {
					const questData = QUEST_TRACKER_globalQuestData[questId];
					if (!questData) {
						errorCheck(152, 'msg', null,`Quest data for "${questId}" is missing.`);
						return;
					}
					const isHidden = questData.hidden || false;
					const textLayer = isHidden ? 'gmlayer' : 'objects';
					const x = textObj.get('left');
					const y = textObj.get('top');
					textObj.remove();
					D.drawText(pageId, x, y, questData.name, '#000000', textLayer, vars.TEXT_FONT_SIZE, 'Contrail One', questId);
				}
			}
		};
		const buildQuestTreeOnPage = () => {
			let questTreePage = findObjs({ _type: 'page', name: QUEST_TRACKER_pageName })[0];
			if (!questTreePage) {
				errorCheck(40, 'msg', null,`Page "${QUEST_TRACKER_pageName}" not found. Please create the page manually.`);
				return;
			}
			H.adjustPageSettings(questTreePage);
			H.clearPageObjects(questTreePage.id, () => {
				const questPositions = H.buildDAG(QUEST_TRACKER_globalQuestData, vars);
				H.adjustPageSizeToFitPositions(questTreePage, questPositions);
				H.buildPageHeader(questTreePage);
				QUEST_TRACKER_TreeObjRef = {};
				D.drawQuestConnections(questTreePage.id, questPositions);
				D.drawMutuallyExclusiveConnections(questTreePage.id, questPositions);
				D.drawQuestTreeFromPositions(questTreePage, questPositions, () => {
					D.drawQuestTextAfterGraphics(questTreePage, questPositions);
					saveQuestTrackerData();
				});
			});
		};
		const updateQuestText = (questId, newText) => {
			if (!QUEST_TRACKER_TreeObjRef[questId] || !QUEST_TRACKER_TreeObjRef[questId].text) return;
			const textObjId = QUEST_TRACKER_TreeObjRef[questId].text;
			const textObj = getObj('text', textObjId);
			if (!textObj) return;
			textObj.set('text', newText);
			saveQuestTrackerData();
		};
		const updateQuestTooltip = (questId, newTooltip) => {
			if (!QUEST_TRACKER_TreeObjRef[questId] || !QUEST_TRACKER_TreeObjRef[questId].avatar) return;
			const avatarObjId = QUEST_TRACKER_TreeObjRef[questId].avatar;
			const avatarObj = getObj('graphic', avatarObjId);
			if (!avatarObj) return;
			const trimmedTooltip = H.trimText(newTooltip, 150);
			avatarObj.set('tooltip', trimmedTooltip);
			saveQuestTrackerData();
		};
		const updateQuestStatusColor = (questId, statusNumber) => {
			if (!QUEST_TRACKER_TreeObjRef[questId] || !QUEST_TRACKER_TreeObjRef[questId].rectangle) return;
			const rectangleObjId = QUEST_TRACKER_TreeObjRef[questId].rectangle;
			const rectangleObj = getObj('path', rectangleObjId);
			if (!rectangleObj) return;
			const statusName = statusMapping[statusNumber] || 'Unknown';
			const statusColor = H.getStatusColor(statusName);
			rectangleObj.set('stroke', statusColor);
			D.redrawQuestText(questId);
			saveQuestTrackerData();
		};
		const updateQuestVisibility = (questId, makeHidden) => {
			if (!QUEST_TRACKER_TreeObjRef[questId]) return;
			const pageId = findObjs({ type: 'page', name: QUEST_TRACKER_pageName })[0].id;
			if (typeof makeHidden === 'string') makeHidden = makeHidden.toLowerCase() === 'true';
			const targetLayer = makeHidden ? 'gmlayer' : 'map';
			const avatarLayer = makeHidden ? 'gmlayer' : 'objects';
			const textLayer = makeHidden ? 'gmlayer' : 'objects';
			for (const sourceQuestId in QUEST_TRACKER_TreeObjRef) {
				const pathsToQuest = QUEST_TRACKER_TreeObjRef[sourceQuestId]?.paths?.[questId];
				if (pathsToQuest) {
					pathsToQuest.forEach(segmentId => {
						const pathObj = getObj('path', segmentId);
						if (pathObj) {
							pathObj.set({
								layer: targetLayer,
								stroke: makeHidden ? '#CCCCCC' : '#000000'
							});
						}
					});
				}
			}
			['rectangle', 'avatar', 'text'].forEach(element => {
				const objId = QUEST_TRACKER_TreeObjRef[questId][element];
				const obj = getObj(element === 'rectangle' ? 'path' : 'graphic', objId);
				if (obj) {
					const layer = element === 'avatar' ? avatarLayer : textLayer;
					obj.set('layer', layer);
				}
			});
			D.redrawQuestText(questId);
			if (!makeHidden) {
				saveQuestTrackerData();
			}
		};
		return {
			buildQuestTreeOnPage,
			updateQuestText,
			updateQuestTooltip,
			updateQuestStatusColor,
			updateQuestVisibility
		};
	})();
	const Rumours = (() => {
		const H = {
			getNewRumourId: () => {
				const existingRumourIds = [];
				Object.values(QUEST_TRACKER_globalRumours).forEach(quest => {
					Object.values(quest).forEach(category => {
						Object.values(category).forEach(location => {
							Object.keys(location).forEach(rumourId => {
								const match = rumourId.match(/^rumour_(\d+)$/);
								if (match) {
									existingRumourIds.push(parseInt(match[1], 10));
								}
							});
						});
					});
				});
				const highestRumourNumber = existingRumourIds.length > 0 ? Math.max(...existingRumourIds) : 0;
				const newRumourId = `rumour_${highestRumourNumber + 1}`;
				return newRumourId;
			},
			getNewLocationId: (locationTable) => {
				let locationItems = findObjs({ type: 'tableitem', rollabletableid: locationTable.id });
				let maxWeight = locationItems.reduce((max, item) => {
					return Math.max(max, item.get('weight'));
				}, 0);
				let newWeight = maxWeight + 1;
				return newWeight;
			},
			removeRumours: (locationTable, locationid) => {
				const locationObject = findObjs({ type: 'tableitem', rollabletableid: locationTable.id }).find(item => item.get('weight') == locationid);
				if (!locationObject) return;
				const cleanData = Utils.sanitizeString(locationObject.get('name')).toLowerCase();
				Object.keys(QUEST_TRACKER_globalRumours).forEach(questId => {
					const questRumours = QUEST_TRACKER_globalRumours[questId] || {};
					Object.keys(questRumours).forEach(status => {
						const statusRumours = questRumours[status] || {};
						if (statusRumours[cleanData]) {
							Object.keys(statusRumours[cleanData]).forEach(rumourKey => {
							});
							delete statusRumours[cleanData];
						}
					});
				});
				Utils.updateHandoutField('rumour');
				calculateRumoursByLocation();
			}
		};
		const calculateRumoursByLocation = () => {
			let rumoursByLocation = {};
			let questTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTS })[0];
			if (errorCheck(146, 'exists', questTable, `questTable`)) return;
			let questItems = findObjs({ type: 'tableitem', rollabletableid: questTable.id });
			if (errorCheck(147, 'exists', questItems, `questItems`)) return;
			Object.keys(QUEST_TRACKER_globalRumours).forEach(questId => {
				let relevantItem = questItems.find(item => item.get('name').toLowerCase() === questId.toLowerCase());
				if (errorCheck(148, 'exists', relevantItem, `relevantItem for questId: ${questId}`)) return;
				let relevantStatus = statusMapping[relevantItem.get('weight').toString()].toLowerCase();
				let questRumours = QUEST_TRACKER_globalRumours[questId] || {};
				if (questRumours[relevantStatus]) {
					Object.keys(questRumours[relevantStatus] || {}).forEach(location => {
						let locationRumours = questRumours[relevantStatus][location] || {};
						if (!rumoursByLocation[location]) rumoursByLocation[location] = [];
						Object.keys(locationRumours).forEach(rumourKey => {
							const rumourText = locationRumours[rumourKey];
							rumoursByLocation[location].push(rumourText);
						});
					});
				}
			});
			QUEST_TRACKER_rumoursByLocation = rumoursByLocation;
			saveQuestTrackerData();
		};
		const sendRumours = (locationId, numberOfRumours) => {
			let allRumours = [];
			let locationTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_LOCATIONS })[0];
			if (errorCheck(41, 'exists', locationTable,`locationTable`)) return;
			let locationItems = findObjs({ type: 'tableitem', rollabletableid: locationTable.id });
			let location = locationItems.find(loc => loc.get('weight').toString() === locationId.toString());
			if (errorCheck(42, 'exists', location,`location`)) return;
			const normalizedLocationId = Utils.sanitizeString(location.get('name')).toLowerCase();
			if (normalizedLocationId === 'everywhere') {
				allRumours = Object.values(QUEST_TRACKER_rumoursByLocation['everywhere'] || {}).map((rumour, index) => `${index}|${Utils.sanitizeInput(rumour, 'STRING')}`);
			} else {
				const locationRumoursObj = QUEST_TRACKER_rumoursByLocation[normalizedLocationId] || {};
				const everywhereRumoursObj = QUEST_TRACKER_rumoursByLocation['everywhere'] || {};
				const locationRumours = Object.values(locationRumoursObj).map(rumour => Utils.sanitizeInput(rumour, 'STRING'));
				const everywhereRumours = Object.values(everywhereRumoursObj).map(rumour => Utils.sanitizeInput(rumour, 'STRING'));
				locationRumours.forEach((rumour, index) => {
					for (let i = 0; i < 3; i++) {
						allRumours.push(`${index}|${rumour}`);
					}
				});
				everywhereRumours.forEach((rumour, index) => {
					allRumours.push(`${locationRumours.length + index}|${rumour}`);
				});
			}
			if (allRumours.length === 0) {
				Utils.sendGMMessage(`No rumours available for this location.`);
				return;
			}
			let selectedRumours = [];
			while (selectedRumours.length < numberOfRumours && allRumours.length > 0) {
				let randomIndex = Math.floor(Math.random() * allRumours.length);
				let selectedRumour = allRumours[randomIndex];
				let [rumourKey, rumourText] = selectedRumour.split('|', 2);
				selectedRumours.push(rumourText);
				allRumours = allRumours.filter(rumour => !rumour.startsWith(`${rumourKey}|`));
			}
			selectedRumours.forEach(rumour => {
				Utils.sendDescMessage(rumour);
			});
		};
		const getLocationNameById = (locationId) => {
			const locationTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_LOCATIONS })[0];
			if (errorCheck(43, 'exists', locationTable,`locationTable`)) return null;
			const locationItems = findObjs({ type: 'tableitem', rollabletableid: locationTable.id });
			const locationItem = locationItems.find(item => item.get('weight').toString() === locationId.toString());
			if (errorCheck(44, 'exists', locationItem,`locationItem`)) return null;
			return locationItem.get('name');
		};
		const removeAllRumoursForQuest = (questId) => {
			if (!QUEST_TRACKER_globalRumours[questId]) return;
			Object.keys(QUEST_TRACKER_globalRumours[questId]).forEach(status => {
				const statusRumours = QUEST_TRACKER_globalRumours[questId][status] || {};
				Object.keys(statusRumours).forEach(location => {
					delete statusRumours[location];
				});
				delete QUEST_TRACKER_globalRumours[questId][status];
			});
			delete QUEST_TRACKER_globalRumours[questId];
			Utils.updateHandoutField('rumour');
			calculateRumoursByLocation();
		};
		const getAllLocations = () => {
			let rollableTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_LOCATIONS })[0];
			if (errorCheck(45, 'exists', rollableTable,`rollableTable`)) return [];
			const tableItems = findObjs({ _type: 'tableitem', _rollabletableid: rollableTable.id });
			const locations = tableItems.map(item => item.get('name'));
			return locations;
		};
		const manageRumourLocation = (action, newItem = null, locationid = null) => {
			const allLocations = Rumours.getAllLocations();
			let locationTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_LOCATIONS })[0];
			if (errorCheck(46, 'exists', locationTable,`locationTable`)) return;
			switch (action) {
				case 'add':
					if (!newItem) return;
					if (allLocations.some(loc => Utils.sanitizeString(loc.toLowerCase()) === Utils.sanitizeString(newItem.toLowerCase()))) return;
					const newWeight = H.getNewLocationId(locationTable);
					if (newWeight === undefined || newWeight === null) return;
					let newLocation = createObj('tableitem', {
						rollabletableid: locationTable.id,
						name: newItem,
						weight: newWeight
					});
					break;
				case 'remove':
					if (!locationid || locationid === 1) return;
					let locationR = findObjs({ type: 'tableitem', rollabletableid: locationTable.id }).find(item => item.get('weight') == locationid);
					H.removeRumours(locationTable,locationid)
					locationR.remove();
					break;
				case 'update':
					if (allLocations.some(loc => Utils.sanitizeString(loc.toLowerCase()) === Utils.sanitizeString(newItem.toLowerCase())) || Utils.sanitizeString(newItem.toLowerCase()) === 'everywhere') return;
					let locationU = findObjs({ type: 'tableitem', rollabletableid: locationTable.id }).find(item => item.get('weight') == locationid);
					locationU.set('name', newItem);
					break;
			}
		};
		const manageRumourObject = ({ action, questId, newItem = '', status, location, rumourId = ''}) => {
			let locationString = getLocationNameById(location)
			const sanitizedLocation = locationString ? Utils.sanitizeString(locationString.toLowerCase()) : '';
			if (!QUEST_TRACKER_globalRumours[questId]) QUEST_TRACKER_globalRumours[questId] = {};
			if (!QUEST_TRACKER_globalRumours[questId][status]) QUEST_TRACKER_globalRumours[questId][status] = {};
			const questRumours = QUEST_TRACKER_globalRumours[questId];
			const statusRumours = questRumours[status];
			switch (action) {
				case 'add':
					if (!statusRumours[sanitizedLocation]) {
						statusRumours[sanitizedLocation] = {};
					}
					const newRumourKey = rumourId === '' ? H.getNewRumourId() : rumourId;
					statusRumours[sanitizedLocation][newRumourKey] = newItem;
					break;
				case 'remove':
					if (statusRumours[sanitizedLocation] && statusRumours[sanitizedLocation][rumourId]) {
						delete statusRumours[sanitizedLocation][rumourId];
						if (Object.keys(statusRumours[sanitizedLocation]).length === 0) {
							delete statusRumours[sanitizedLocation];
						}
					}
					break;
				default:
					break;
			}
			Utils.updateHandoutField('rumour');
			calculateRumoursByLocation();
		};
		return {
			calculateRumoursByLocation,
			sendRumours,
			manageRumourLocation,
			getLocationNameById,
			removeAllRumoursForQuest,
			getAllLocations,
			manageRumourObject
		};
	})();
	const Menu = (() => {
		const styles = {
			menu: 'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px; overflow: hidden;',
			button: 'margin-top: 1px; display: inline-block; background-color: #000; border: 1px solid #292929 ; border-radius: 3px; padding: 2px; color: #fff; text-align: center;',
			buttonDisabled: 'pointer-events: none; background-color: #666; border: 1px solid #292929; border-radius: 3px; padding: 2px; text-align: center; color: #000000;',
			spanInline: 'display: inline-block; margin-top: 1px;',
			smallButton: 'display: inline-block; width: 12px; height:16px;',
			smallButtonMagnifier: 'display: inline-block; width: 16px; height:16px; background-color:#fff;',
			smallButtonContainer: 'text-align:center; width: 20px; padding:1px',
			smallButtonAdd: 'text-align:right; width: 20px; padding:1px margin-right:1px',
			smallerText: 'font-size: smaller',
			list: 'list-style none; padding: 0; margin: 0; overflow: hidden;',
			label: 'float: left; font-weight: bold;',
			topBorder: 'border-top: 1px solid #ddd;',
			bottomBorder: 'border-bottom: 1px solid #ddd;',
			topMargin: 'margin-top: 20px;',
			column: 'overflow: hidden; padding: 5px 0;',
			marginRight: 'margin-right: 2px',
			strikethrough: 'text-decoration: line-through;',
			floatLeft: 'float: left;',
			floatRight: 'float: right;',
			floatClearRight: 'float: right; clear: right;',
			overflow: 'overflow: hidden; margin:1px',
			rumour: 'text-overflow: ellipsis;overflow: hidden;width: 165px;display: block;word-break: break-all;white-space: nowrap;',
			link: 'color: #007bff; text-decoration: underline; cursor: pointer;',
			questlink: 'color: #007bff; text-decoration: none; cursor: pointer; background-color: #FFFFFF;',
			filterlink: 'color: #007bff; text-decoration: none; cursor: pointer; background-color: #FFFFFF; padding:0px;',
			paddedfilterlink: 'color: #007bff; text-decoration: none; cursor: pointer; background-color: #FFFFFF; padding:5px;',
			treeStyle: 'display: inline-block; position: relative; text-align: center; margin-top: 0px;',
			questBox50: 'display: inline-block; width: 15px; height: 6px; padding: 5px; border: 1px solid #000; border-radius: 5px; background-color: #f5f5f5; text-align: center; position: relative; margin-right: 20px;',
			verticalLineStyle: 'position: absolute; width: 2px; background-color: black;',
			lineHorizontalRed: 'position: absolute; width: 24px; height: 2px; background-color: red; left: 57%;',
			lineHorizontal: 'position: absolute; height: 2px; background-color: black;',
			treeContainerStyle: 'position: relative; width: 100%; height: 100%; text-align: center; margin-top: 20px;',
			ulStyle: 'list-style: none; position: relative; padding: 0; margin: 0; display: block; text-align: center;',
			liStyle: 'display: inline-block; text-align: center; position: relative;',
			spanText: 'bottom: -1px; position: absolute; left: -1px; right: 0px;',
			centreImage: 'display: block; margin: auto; text-align: center;'
		};
		const H = {
			showActiveQuests: () => {
				let AQMenu = "";
				const activeStatuses = [2, 3, 4];
				const activeQuests = QUEST_TRACKER_globalQuestArray
					.filter(quest => {
						const status = parseInt(Quest.getQuestStatus(quest.id), 10);
						return activeStatuses.includes(status);
					})
					.map(quest => quest.id);
				if (activeQuests.length === 0) {
					AQMenu += `<ul>
						<li style="${styles.overflow}">
							<span style="${styles.floatLeft}"><small>No Active Quests</small></span>
						</li>
					</ul>`;
				} else {
					AQMenu += `<ul style="${styles.list}">`;
					activeQuests.forEach(quest => {
						let questData = QUEST_TRACKER_globalQuestData[quest];
						AQMenu += `
						<li style="${styles.overflow}">
							<span style="${styles.floatLeft}"><small>${questData.name}</small></span>
							<span style="${styles.floatRight}">
								<a style="${styles.button}" href="!qt-menu action=quest|id=${quest}">Inspect</a>
							</span>
						</li>`;
					});
					AQMenu += `</ul>`;
				}
				return AQMenu;
			},
			showActiveRumours: () => {
				let menu = `<ul style="${styles.list}">`;
				let locationTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_LOCATIONS })[0];
				if (locationTable) {
					let locationItems = findObjs({ type: 'tableitem', rollabletableid: locationTable.id });
					locationItems.sort((a, b) => a.get('weight') - b.get('weight')).forEach(location => {
						let locationName = location.get('name');
						let locationKey = Utils.sanitizeString(locationName).toLowerCase();
						let locationWeight = location.get('weight');
						let rumourCount = QUEST_TRACKER_rumoursByLocation[locationKey] ? Object.keys(QUEST_TRACKER_rumoursByLocation[locationKey]).length : 0;
						let everywhereRumourCount = QUEST_TRACKER_rumoursByLocation['everywhere'] ? Object.keys(QUEST_TRACKER_rumoursByLocation['everywhere']).length : 0;
						let displayRumourCount = locationKey !== 'everywhere' && everywhereRumourCount > 0
							? `${rumourCount} (+${everywhereRumourCount})`
							: `${rumourCount}`;
						let totalRumourCount = locationKey === 'everywhere' ? rumourCount : rumourCount + everywhereRumourCount;
						if (rumourCount > 0 || locationKey === 'everywhere') {
							menu += `
							<li style="${styles.column}">
								<span style="${styles.floatLeft}">${locationName}<br><small>${displayRumourCount} Rumours</small></span>
								<span style="${styles.floatRight}">
									<a style="${styles.button}" href="!qt-rumours action=send|location=${locationWeight}|number=?{How Many Rumours? (Max: ${totalRumourCount})|1}">Show</a>
								</span>
							</li>`;
						}
					});
				}
				menu += `</ul>`;
				return menu;
			},
			calculateStartingGroupNum: (conditions, isInLogicGroup = false) => {
				let count = 0;
				if (isInLogicGroup) return count;
				for (let i = 0; i < conditions.length; i++) {
					if (typeof conditions[i] === 'object' && conditions[i].logic) {
						break;
					}
					if (typeof conditions[i] === 'string') {
						count++;
					}
				}
				return count;
			},
			calculateGroupNum: (condition, conditions, groupnum) => {
				let count = 0;
				for (let i = 0; i < conditions.length; i++) {
					if (conditions[i] === condition) {
						break;
					}
					if (typeof conditions[i] === 'object' && conditions[i].logic) {
						count++;
					}
				}
				return groupnum + count;
			},
			formatConditions: (questId, conditions, parentLogic = 'AND', indent = false, groupnum = 0, isInLogicGroup = false) => {
				if (!Array.isArray(conditions)) return '';
				let spanOrAnchor = `${H.buildDropdownString(questId) === '' ? 'span' : 'a'}`;
				let renderButtonStyle = `${H.buildDropdownString(questId) === '' ? styles.buttonDisabled : styles.button}`;
				groupnum += H.calculateStartingGroupNum(conditions, isInLogicGroup);
				return conditions.map((condition, index) => {
					const currentGroupNum = H.calculateGroupNum(condition, conditions, groupnum);
					const displayIndex = index + 1;
					const isLastCondition = displayIndex === conditions.length;
					const isLastnonGroupCondition = (index + 1 < conditions.length && typeof conditions[index + 1] === 'object') || index === conditions.length - 1;
					const isOnlyGroupCondition = conditions.length === 1 && typeof conditions[0] === 'object';
					if (typeof condition === 'string') {
						return `
							<tr>
								${indent ? `<td>&nbsp;</td><td>` : `<td colspan="2">`}
									<a style="${styles.questlink}" href="!qt-menu action=quest|id=${condition}">${H.getQuestName(condition)}</a>
								</td>
								<td style="${styles.smallButtonContainer}">
									<a style="${styles.button} ${styles.smallButton}" href="!qt-questrelationship currentquest=${questId}|oldquest=${condition}|action=update|type=${indent ? `group|groupnum=${currentGroupNum}` : `single`}|quest=${H.buildDropdownString(questId, condition)}">c</a>
								</td>
								<td style="${styles.smallButtonContainer}">
									<a style="${styles.button} ${styles.smallButton}" href="!qt-questrelationship currentquest=${questId}|action=remove|type=${indent ? `group|groupnum=${currentGroupNum}|confirmation=DELETE` : `single`}|quest=${condition}">-</a>
								</td>
							</tr>
							${indent && isLastCondition ? `
							<tr>
								<td>&nbsp;</td>
								<td colspan="2">
									<small>Add Relationship</small>
								</td>
								<td style="${styles.smallButtonContainer}">
									<${spanOrAnchor} href="!qt-questrelationship currentquest=${questId}|action=add|type=group|groupnum=${currentGroupNum}|quest=${H.buildDropdownString(questId)}" style="${renderButtonStyle} ${styles.smallButton}">+</a>
								</td>
							</tr>
							` : ''}
							${!indent && isLastnonGroupCondition ? `
							<tr>
								<td colspan="3">
									<small>Add Relationship</small>
								</td>
								<td style="${styles.smallButtonContainer}">
									<${spanOrAnchor} href="!qt-questrelationship currentquest=${questId}|action=add|type=single|quest=${H.buildDropdownString(questId)}" style="${renderButtonStyle} ${styles.smallButton}">+</a>
								</td>
							</tr>
							` : ''}
						`;
					} else if (typeof condition === 'object' && condition.logic && Array.isArray(condition.conditions)) {
						const subLogic = H.formatConditions(questId, condition.conditions, condition.logic, true, currentGroupNum, true);
						const reverseLogic = condition.logic === 'AND' ? 'OR' : 'AND';
						let addRelasionshipRow = ''
						if (currentGroupNum === 0) {
							addRelasionshipRow += `
								<tr style="${styles.topBorder}">
									<td colspan="3" style="${styles.topBorder}">
										<small>Add Relationship</small>
									</td>
									<td style="${styles.smallButtonContainer}">
										<${spanOrAnchor} href="!qt-questrelationship currentquest=${questId}|action=add|type=single|quest=${H.buildDropdownString(questId)}" style="${renderButtonStyle} ${styles.smallButton}">+</a>
									</td>
								</tr>`;
						}
						return `
							${addRelasionshipRow}
							<tr>
								<td>&nbsp;</td><td>
									${condition.logic}
								</td>
								<td style="${styles.smallButtonContainer}">
									<a style="${styles.button} ${styles.smallButton}" href="!qt-questrelationship currentquest=${questId}|action=update|type=grouplogic|groupnum=${currentGroupNum}">c</a>
								</td>
								<td style="${styles.smallButtonContainer}">
									<a style="${styles.button} ${styles.smallButton}" href="!qt-questrelationship currentquest=${questId}|action=remove|type=removegroup|groupnum=${currentGroupNum}|confirmation=?{Type DELETE to confirm removal of this Group Logic|}">-</a>
								</td>
							</tr>
							${subLogic}
						`;
					}
				}).join('');
			},
			buildDropdownString: (questId) => {
				if (!Quest.getValidQuestsForDropdown(questId)) return '';
				else {
					const validQuests = Quest.getValidQuestsForDropdown(questId);
					if (validQuests.length === 1) return validQuests[0];
					validQuests.sort((a, b) => H.getQuestName(a).localeCompare(H.getQuestName(b)));
					const dropdownString = validQuests.map(questId => {
						return `${H.getQuestName(questId)},${questId}`;
					}).join('|');
					return `?{Choose Quest|${dropdownString}}`;
				}
			},
			getQuestName: (questId) => {
				return QUEST_TRACKER_globalQuestData[questId]?.name.replace(/[{}|&?]/g, '') || 'Unnamed Quest';
			},
			relationshipMenu: (questId) => {
				const quest = QUEST_TRACKER_globalQuestData[questId];
				let htmlOutput = "";
				let spanOrAnchor = `${H.buildDropdownString(questId) === '' ? 'span' : 'a'}`;
				let renderButtonStyle = `${H.buildDropdownString(questId) === '' ? styles.buttonDisabled : styles.button}`;
				if (!quest || !quest.relationships || !Array.isArray(quest.relationships.conditions) || quest.relationships.conditions.length === 0) {
					htmlOutput += `<br><table style="width:100%;">
										<tr style="${styles.topBorder}">
											<td colspan="3" style="${styles.topBorder}">
												<small>Add Relationship</small>
											</td>
											<td style="${styles.smallButtonContainer}">
												<${spanOrAnchor} href="!qt-questrelationship currentquest=${questId}|action=add|type=single|quest=${H.buildDropdownString(questId)}" style="${renderButtonStyle} ${styles.smallButton}">+</a>
											</td>
										</tr>
										<tr style="${styles.bottomBorder}">
											<td colspan="3"><small>Add Relationship Group</small></td>
											<td style="${styles.smallButtonContainer}">
												<${spanOrAnchor} href="!qt-questrelationship currentquest=${questId}|action=add|type=addgroup|quest=${H.buildDropdownString(questId)}" style="${renderButtonStyle} ${styles.smallButton}">+</a>
											</td>
										</tr>
									</table>`;
				} else {
					const conditionsHtml = H.formatConditions(questId, quest.relationships.conditions, quest.relationships.logic || 'AND');
					htmlOutput += `
						<table style="width:100%;">
							${quest.relationships.conditions.length > 1 ? `<tr>
								<td colspan="3" style="${styles.topBorder}">
									${quest.relationships.logic || 'AND'}
								</td>
								<td style="${styles.smallButtonContainer}">
									<a href="!qt-questrelationship currentquest=${questId}|action=update|type=logic" style="${styles.button} ${styles.smallButton}">c</a>
								</td>
							</tr>` : ''}
							${conditionsHtml}
							<tr style="${styles.bottomBorder}">
								<td colspan="3">
									<small>Add Relationship Group</small>
								</td>
								<td style="${styles.smallButtonContainer}">
									<${spanOrAnchor} href="!qt-questrelationship currentquest=${questId}|action=add|type=addgroup|quest=${H.buildDropdownString(questId)}" style="${renderButtonStyle} ${styles.smallButton}">+</a>
								</td>
							</tr>
						</table>`;
				}
				let mutuallyExclusiveHtml = "";
				if (Array.isArray(quest.relationships.mutually_exclusive) && quest.relationships.mutually_exclusive.length > 0) {
					mutuallyExclusiveHtml += quest.relationships.mutually_exclusive.map(exclusive => `
						<tr>
							<td colspan="2">
								<a style="${styles.questlink}" href="!qt-menu action=quest|id=${exclusive}">${H.getQuestName(exclusive)}</a>
							</td>
							<td style="${styles.smallButtonContainer}">
								<a href="!qt-questrelationship currentquest=${questId}|action=update|type=mutuallyexclusive|oldquest=${exclusive}|quest=${H.buildDropdownString(questId)}" style="${styles.button} ${styles.smallButton}">c</a>
							</td>
							<td style="${styles.smallButtonContainer}">
								<a href="!qt-questrelationship currentquest=${questId}|action=remove|type=mutuallyexclusive|quest=${exclusive}" style="${styles.button} ${styles.smallButton}">-</a>
							</td>
						</tr>
					`).join('');				
				} else {
					mutuallyExclusiveHtml += `<tr><td colspan="4"><small>No mutually exclusive quests available.</small></td></tr>`;
				}
				htmlOutput += `
					<br>
					<h4>Mutually Exclusive Quests</h4>
					<table style="width:100%;">
						${mutuallyExclusiveHtml}
						<tr>
							<td colspan="3"></td>
							<td style="${styles.smallButtonContainer}">
								<${spanOrAnchor} href="!qt-questrelationship currentquest=${questId}|action=add|type=mutuallyexclusive|quest=${H.buildDropdownString(questId)}" style="${renderButtonStyle} ${styles.smallButton}">+</a>
							</td>
						</tr>
					</table>`;
				return htmlOutput;
			},
			getValidQuestGroups: (questId) => {
				let result = '';
				const quest = QUEST_TRACKER_globalQuestData[questId];
				const questGroupsTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTGROUPS })[0];
				if (!questGroupsTable) return result;
				const questGroups = findObjs({ type: 'tableitem', rollabletableid: questGroupsTable.id });
				if (quest && quest.group) {
					if (questGroups.length === 1) {
						return "remove";
					}
					else {
						result += 'Remove from Group,remove|';
					}
				}
				result += questGroups
					.filter(group => parseInt(quest.group) !== parseInt(group.get('weight')))
					.map(group => `${group.get('name')},${group.get('weight')}`)
					.join('|');
				if (result.includes('|')) return "?{Change Quest Grouping|" + result + "}";
				else {
					const [f,s] = result.split(',');
					return s;
				}
			},
			getQuestGroupNameByWeight: (weight) => {
				if (!weight) return 'No Assigned Group';
				let groupTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTGROUPS })[0];
				if (!groupTable) {
					Utils.sendGMMessage('Error: Quest Groups table not found. Please check if the table exists in the game.');
					return null;
				}
				let groupItems = findObjs({ type: 'tableitem', rollabletableid: groupTable.id });
				let group = groupItems.find(item => item.get('weight') == weight);
				return group.get('name');
			},
			showUpcomingEvents: () => {
				const upcomingEvents = Calendar.getNextEvents(5);
				let menu = "";
				if (upcomingEvents.length === 0) {
					menu += `<ul>
						<li style="${styles.overflow}">
							<span style="${styles.floatLeft}">
								<small>No Upcoming Events</small>
							</span>
						</li>
					</ul>`;
				} else {
					menu += `<ul style="${styles.list}">`;
					upcomingEvents.forEach((event, index) => {
						const [date, name] = event;
						const eventId = `event-${index}`;
						menu += `<li style="${styles.overflow}">
							<span style="${styles.floatLeft}">
								${name}
								<br>
								<small>${date}</small>
							</span>`;
						if (index === 0) {
							menu += `
							<span style="${styles.floatRight}">
								<a style="${styles.button}" href="!qt-date action=modify|home=true|unit=event|new=1">Advance</a>
							</span>`;
						}
						menu += `</li>`;
					});
					menu += `</ul>`;
				}

				return menu;
			},
			buildFrequencyDropdown: () => {
				const dropdownString = Object.entries(frequencyMapping)
					.map(([key, value]) => `|${value},${key}`)
					.join('');
				return dropdownString;
			},
			buildLocationDropdown: () => {
				const dropdownString = Object.entries(WEATHER.enviroments)
					.map(([key, value]) => `|${value.name},${key}`)
					.join('');
				return dropdownString;
			},
			returnCurrentLocation: (key) => {
				const { WEATHER } = getCalendarAndWeatherData();
				if (WEATHER.enviroments && WEATHER.enviroments[key]) return WEATHER.enviroments[key].name;
				else return "Unknown Location";
			},
			buildCalenderDropdown: () => {
				const dropdownString = Object.entries(CALENDARS)
					.map(([key, value]) => `|${value.name},${key}`)
					.join('');
				return dropdownString;
			},
			buildClimateDropdown: () => {
				const currentCalendar = CALENDARS[QUEST_TRACKER_calenderType];
				const dropdownString = Object.keys(currentCalendar.climates)
					.map((climate) => `|${climate.charAt(0).toUpperCase() + climate.slice(1)},${climate}`)
					.join("");
				return dropdownString;
			},
			hasMultipleMoons: (l) => {
				if (Object.keys(l).length > 1) return true;
				else return false;
			},
			lunarPhases: () => {
				const calendar = CALENDARS[QUEST_TRACKER_calenderType];
				if (errorCheck(155, 'exists', calendar.lunarCycle, `calendar.lunarCycle`)) return;
				const currentDate = QUEST_TRACKER_currentDate;
				let output = `<tr><td colspan=2><strong>Lunar Phase${H.hasMultipleMoons(calendar.lunarCycle) ? 's' : ''}</strong></td></tr>`;
				for (const moonId in calendar.lunarCycle) {
					if (calendar.lunarCycle.hasOwnProperty(moonId)) {
						const phase = Calendar.getLunarPhase(currentDate, moonId);
						output += `<tr><td colspan=2><small>${phase}</small></td></tr>`;
					}
				}
				return output;
			},
			displayQuestToken: (questId) => {
				let quest = QUEST_TRACKER_globalQuestData[questId];
				if (errorCheck(158, 'exists', quest, `quest`)) return;
				const questTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTS })[0];
				if (errorCheck(156, 'exists', questTable, `questTable`)) return;
				const questTableItems = findObjs({ type: 'tableitem', rollabletableid: questTable.id });
				const questTableItem = questTableItems.find(item => item.get('name').toLowerCase() === questId.toLowerCase());
				if (errorCheck(157, 'exists', questTableItem, `questTableItem`)) return;
				let imgsrc = questTableItem.get('avatar');
				if (!imgsrc) imgsrc = QUEST_TRACKER_BASE_QUEST_ICON_URL;
				const strippedimgsrc = imgsrc.split('?')[0];
				if (strippedimgsrc) return `<span style="${styles.centreImage}">[${quest.name}](${strippedimgsrc})</span>`;
				else return "";
			},
			displayQuestHandout: (questId) => {
				let quest = QUEST_TRACKER_globalQuestData[questId];
				if (errorCheck(159, 'exists', quest, `quest`)) return;
				let html = `<h4 style="${styles.bottomBorder} ${styles.topMargin}">Linked Handout</h4>`;
				let linkHandoutURL = `!qt-quest action=linkhandout|current=${questId}|key=?{How to Link|Auto Link,AUTO|Manual Link,?{Key&#125;`;
				if (!quest.handout) {
					html += `
					<span style="${styles.floatRight}">
						<a style="${styles.button}" href="${linkHandoutURL}">Link</a>
					</span>`;
				}
				else {
					const handout = findObjs({ _type: 'handout', id: quest.handout })[0];
					let handoutName = "<small>Error: Fix Handout Link</small>";
					let err = true;
					if (!errorCheck(160, 'exists', handout, `handout`)) {
						err = false;
						handoutName = handout.get('name');
					}
					let openHTML = err ? `` : `<a style="${styles.button}" href="http://journal.roll20.net/handout/${quest.handout}">Open</a> `;
					html += `<span>${handoutName}</span>
					<span style="${styles.floatRight}">
						${openHTML}<a style="${styles.button}" href="${linkHandoutURL}">${err ? 'Fix' : 'Change'}</a> <a style="${styles.button}" href="!qt-quest action=removehandout|current=${questId}">-</a>
					</span>`;
				}
				return html;
			},
			applyFilter: (filter, questData) => {
				if (!filter || Object.keys(filter).length === 0) return true;
				if (!questData) return false;

				return Object.entries(filter).every(([key, value]) => {
					if (key === 'group') {
						if (value === undefined || (Array.isArray(value) && value.length === 0)) return true;
						if (Array.isArray(value)) return value.map(String).includes(String(questData.group));
						return false;
					} else if (['handout', 'disabled', 'hidden'].includes(key)) {
						if (value === undefined) return true;
						if (value === true) return !!questData[key];
						if (value === false) return !questData[key];
					} else if (Array.isArray(value)) {
						return value.includes(questData[key]);
					} else if (typeof value === 'boolean') {
						return questData[key] === value;
					} else {
						return `${questData[key]}` === `${value}`;
					}
				});
			},
			renderQuestList: (quests, groupBy) => {
				let menu = '';
				const groupedQuests = groupBy
					? quests.reduce((acc, quest) => {
						let groupKey;
						if (groupBy === 'handout') {
							groupKey = quest.handout ? 'Linked Handout' : 'No Handout Linked';
						} else if (groupBy === 'disabled') {
							groupKey = quest.disabled === true || quest.disabled === 'true' ? 'Disabled' : 'Enabled';
						} else if (groupBy === 'visibility') {
							groupKey = quest.visibility === true || quest.visibility === 'true' ? 'Hidden' : 'Visible';
						} else if (groupBy === 'group') {
							groupKey = H.getQuestGroupNameByWeight(quest.group) || 'Ungrouped';
						} else {
							groupKey = quest[groupBy] || 'Ungrouped';
						}
						if (!acc[groupKey]) acc[groupKey] = [];
						acc[groupKey].push(quest);
						return acc;
					  }, {})
					: { All: quests };
				Object.keys(groupedQuests).forEach(groupKey => {
					menu += groupBy ? `<h4>${groupKey}</h4>` : '';
					const sortedQuests = groupedQuests[groupKey].sort((a, b) => {
						const nameA = (a.name || '').toLowerCase();
						const nameB = (b.name || '').toLowerCase();
						return nameA.localeCompare(nameB);
					});
					menu += '<ul>';
					sortedQuests.forEach(quest => {
						menu += `
							<li style="${styles.overflow}">
								<span style="${styles.floatLeft}"><small>${quest.name || 'Unnamed Quest'}</small></span>
								<span style="${styles.floatRight}">
									<a style="${styles.button}" href="!qt-menu action=quest|id=${quest.id}">Inspect</a>
									<a style="${styles.button} ${styles.smallButton}" href="!qt-quest action=removequest|id=${quest.id}|confirmation=?{Type DELETE into this field to confirm deletion of this quest|}">-</a>
								</span>
							</li>`;
					});
					menu += '</ul>';
				});
				return menu;
			},
			generateFilterLinks: (filterKey, filterValue, label, menuType) => {
				if (filterValue === true || filterValue === false) {
					const displayValue = filterValue ? 'True' : 'False';
					const toggleValue = filterValue ? 'false' : 'true';
					return `
						<li>${label} [<small>${displayValue}</small>]
							<small>
								<a style="${styles.filterlink}" href="!qt-filter action=modify|key=${filterKey}|value=${toggleValue}|menu=${menuType}">Change</a>
								<a style="${styles.filterlink}" href="!qt-filter action=modify|key=${filterKey}|value=|menu=${menuType}">Clear</a>
							</small>
						</li>`;
				} else {
					return `
						<li>${label}
							<small>
								<a style="${styles.filterlink}" href="!qt-filter action=modify|key=${filterKey}|value=true|menu=${menuType}">Show</a>
								<a style="${styles.filterlink}" href="!qt-filter action=modify|key=${filterKey}|value=false|menu=${menuType}">Hide</a>
							</small>
						</li>`;
				}
			},
			buildGroupByDropdown: (currentGroupBy) => {
				const options = [
					{ label: 'Group', value: 'group' },
					{ label: 'Visibility', value: 'visibility' },
					{ label: 'Handout', value: 'handout' },
					{ label: 'Disabled', value: 'disabled' }
				];
				return options
					.filter(option => option.value !== currentGroupBy)
					.map(option => `|${option.label},${option.value}`)
					.join('');
			},
			showFilterMenu: (menuType = 'quest') => {
				const FILTER = menuType === 'rumour' ? QUEST_TRACKER_RUMOUR_FILTER : QUEST_TRACKER_FILTER;
				const questGroupsTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTGROUPS })[0];
				if (errorCheck(171, 'exists', questGroupsTable, 'questGroupsTable')) return;
				const questGroups = findObjs({ type: 'tableitem', rollabletableid: questGroupsTable.id }) || [];
				const filteredGroups = Array.isArray(FILTER.filter?.group)
					? FILTER.filter.group
					: [];
				let groupList = `
					<br><strong>Quest Groups</strong>
					<ul>
					${!filteredGroups || filteredGroups.length === 0 ? '<small>All quest groups currently visible</small>' : ''}
				`;
				groupList += questGroups
					.map(group => {
						const groupName = group.get('name');
						const groupWeight = parseInt(group.get('weight'), 10);
						const isFiltered = Array.isArray(filteredGroups) && filteredGroups.includes(groupWeight);
						const action = isFiltered ? 'remove' : 'add';
						const actionText = isFiltered ? 'hide' : 'show';
						return `
							<li>${groupName}
								<small>
									<a style="${styles.filterlink}" href="!qt-filter action=${action}|key=group|value=${groupWeight}|menu=${menuType}">${actionText}</a>
								</small>
							</li>`;
					})
					.join('');
				groupList += `</ul>`;
				const hasFilters = Object.keys(FILTER.filter || {}).length > 0 || FILTER.groupBy;
				const filterDisabled = FILTER.filter?.disabled;
				const filterHidden = FILTER.filter?.hidden;
				const filterHandout = FILTER.filter?.handout;
				const currentGroupBy = FILTER.groupBy || null;
				const groupByDropdown = H.buildGroupByDropdown(currentGroupBy);
				let menu = `
					<div style="${styles.menu}">
						<span style="${styles.floatRight}">
							<a style="${styles.paddedfilterlink}" href="!qt-filter action=togglevisibility|value=${QUEST_TRACKER_FILTER_Visbility === true ? 'false' : 'true'}|menu=${menuType}">${QUEST_TRACKER_FILTER_Visbility === true ? 'Hide' : 'Show'}</a>
							${hasFilters ? `<a style="${styles.paddedfilterlink}" href="!qt-filter action=clear|menu=${menuType}">Clear</a>` : ''}
						</span>
						<h3>Filters</h3>
				`;
				if (QUEST_TRACKER_FILTER_Visbility) {
					if (menuType === 'quest') {
						menu += `
							<ul>
								${!Object.keys(FILTER.filter || {}).length ? '<small>No filters applied</small>' : ''}
								${H.generateFilterLinks('disabled', filterDisabled, 'Disabled', menuType)}
								${H.generateFilterLinks('hidden', filterHidden, 'Hidden', menuType)}
								${H.generateFilterLinks('handout', filterHandout, 'Handout', menuType)}
							</ul>
							${groupList}
							<br><strong>Group by</strong>
							<small>
								<a style="${styles.filterlink}" href="!qt-filter action=modify|key=groupBy|value=?{Choose${groupByDropdown}}|menu=${menuType}">${currentGroupBy || 'add'}</a>
								${currentGroupBy ? ` | <a style="${styles.filterlink}" href="!qt-filter action=resetGrouping|key=groupBy|value=|menu=${menuType}">Clear</a>` : ''}
							</small>
						`;
					}
					else menu += groupList;
				}
				menu += `</div>`;
				menu = menu.replace(/[\r\n]/g, '');
				return menu;
			},
			getNestedProperty: (obj, path) => {
				const keys = path.split('.');
				return keys.reduce((current, key) => (current && current[key] !== undefined ? current[key] : null), obj);
			},
			getTriggerName: (triggerId) => {
				const triggerPath = Triggers.locateItem(triggerId, 'trigger');
				if (!triggerPath) return null;
				const trigger = Utils.getNestedProperty(QUEST_TRACKER_Triggers, triggerPath.replace('QUEST_TRACKER_Triggers.', ''));
				if (!trigger) return null;
				return trigger.name || 'Unnamed Trigger';
			},
			createQuestDropdown: () => {
				const sortedQuests = QUEST_TRACKER_globalQuestArray
					.map(quest => {
						const questName = Utils.roll20MacroSanitize(H.getQuestName(quest.id) || 'Unnamed Quest');
						return { questName, questId: quest.id };
					})
					.sort((a, b) => a.questName.localeCompare(b.questName));

				if (sortedQuests.length === 0) return null;
				if (sortedQuests.length === 1) return sortedQuests[0].questId;

				const allQuests = sortedQuests
					.map(quest => `${quest.questName},${quest.questId}`)
					.join('|');

				return `?{Select Quest|${allQuests}}`;
			},
			createTriggerDropdown: (current) => {
				const allTriggers = [];
				Object.entries(QUEST_TRACKER_Triggers.quests).forEach(([questId, triggers]) => {
					Object.entries(triggers).forEach(([triggerId, trigger]) => {
						if (triggerId !== current) {
							allTriggers.push(`${trigger.name || 'Unnamed Trigger'},${triggerId}`);
						}
					});
				});
				Object.entries(QUEST_TRACKER_Triggers.dates).forEach(([date, triggers]) => {
					Object.entries(triggers).forEach(([triggerId, trigger]) => {
						if (triggerId !== current) {
							allTriggers.push(`${trigger.name || 'Unnamed Trigger'},${triggerId}`);
						}
					});
				});
				Object.entries(QUEST_TRACKER_Triggers.reactions).forEach(([reactionParent, triggers]) => {
					Object.entries(triggers).forEach(([triggerId, trigger]) => {
						if (triggerId !== current) {
							allTriggers.push(`${trigger.name || 'Unnamed Reaction'},${triggerId}`);
						}
					});
				});
				if (allTriggers.length === 0) return null;
				if (allTriggers.length === 1) return allTriggers[0].split(',')[1];
				return `?{Select Trigger|${allTriggers.join('|')}}`;
			},
			effectDropdown: (actionType) => {
				if(!actionType) return null; 
				switch (actionType?.toLowerCase()) {
					case "hidden":
						return `?{Visibility Changes to|True,true|False,false}`;
					case "disabled":
						return `?{State Changes to|False,false|True,true}`;
					case "status": {
						const statusOptions = Object.entries(statusMapping)
							.map(([id, name]) => `${name},${id}`)
							.join('|');
						return `?{Select Status|${statusOptions}}`;
					}
					default:
						return `?{No options available}`;
				}
			},
			getTriggerName: (triggerId) => {
				for (const category of ["quests", "dates", "reactions"]) {
					for (const [parentId, triggers] of Object.entries(QUEST_TRACKER_Triggers[category] || {})) {
						if (triggers[triggerId]) {
							return triggers[triggerId].name || "Unnamed Trigger";
						}
					}
				}
				return "Unnamed Trigger";
			}
		};
		const buildWeather = (isMenu = false, isHome = false) => {
			const FromValue = {
				temperature: (x) => {
					const celsius = ((-0.0113 * x * x) + (2.589 * x) - 89.2).toFixed(1);
					const fahrenheit = ((celsius * 9 / 5) + 32).toFixed(1);
					return { celsius: parseFloat(celsius), fahrenheit: parseFloat(fahrenheit) };
				},
				humidity: (x) => {
					const k = 0.1;
					const c = 50;
					const humidity = 100 / (1 + Math.exp(-k * (x - c)));
					return parseFloat(Math.max(humidity, 0).toFixed(1));
				},
				precipitation: (x) => {
					const k = 0.04;
					const maxPrecipitation = 500;
					const center = 50;
					const precipitationMm = maxPrecipitation * (Math.exp(k * (x - center)) - 1) / (Math.exp(k * (100 - center)) - 1);
					const precipitationInches = precipitationMm * 0.0393701;
					return {
						mm: parseFloat(Math.max(precipitationMm, 0).toFixed(1)),
						inches: parseFloat(Math.max(precipitationInches, 0).toFixed(1))
					};
				},
				windSpeed: (x) => {
					const maxSpeed = 400;
					const a = 5;
					const c = 400;
					const windSpeedKmh = (c / (1 + Math.exp(-0.2 * (x - 70)))) + (a * Math.pow(Math.max(x - 40, 0), 1.5)) / 50;
					const windSpeedMph = windSpeedKmh * 0.621371;
					return {
						kmh: parseFloat(windSpeedKmh.toFixed(1)),
						mph: parseFloat(windSpeedMph.toFixed(1))
					};
				},
				visibility: (x) => {
					const maxDistanceMeters = 50000;
					const visibilityMeters = maxDistanceMeters * (x / 100);
					let result = {
						imperial: {},
						metric: {}
					};
					if (visibilityMeters <= 100) {
						result.metric.distance = parseFloat(visibilityMeters.toFixed(1));
						result.metric.unit = "m";
					} else {
						result.metric.distance = parseFloat((visibilityMeters / 1000).toFixed(1));
						result.metric.unit = "km";
					}
					const visibilityFeet = visibilityMeters * 3.28084;
					if (visibilityFeet <= 100) {
						result.imperial.distance = parseFloat(visibilityFeet.toFixed(1));
						result.imperial.unit = "\"";
					} else if (visibilityFeet <= 300) {
						result.imperial.distance = parseFloat(visibilityFeet.toFixed(1));
						result.imperial.unit = "\"";
					} else {
						result.imperial.distance = parseFloat((visibilityFeet / 5280).toFixed(1));
						result.imperial.unit = "mi";
					}
					return result;
				}
			};
			const temperatureValue = FromValue.temperature(QUEST_TRACKER_CURRENT_WEATHER['rolls']['temperature']);
			const windSpeedValue = FromValue.windSpeed(QUEST_TRACKER_CURRENT_WEATHER['rolls']['wind']);
			const precipitationValue = FromValue.precipitation(QUEST_TRACKER_CURRENT_WEATHER['rolls']['precipitation']);
			const visibilityValue = FromValue.visibility(QUEST_TRACKER_CURRENT_WEATHER['rolls']['visibility']);
			const humidityDisplay = FromValue.humidity(QUEST_TRACKER_CURRENT_WEATHER['rolls']['humidity']);
			const temperatureDisplay = QUEST_TRACKER_imperialMeasurements['temperature'] ? temperatureValue['fahrenheit'] + "&deg;F" : temperatureValue['celsius'] + "&deg;C";
			const windSpeedDisplay = QUEST_TRACKER_imperialMeasurements['wind'] ? windSpeedValue['mph'] + "mph" : windSpeedValue['kmh'] + "kmh";
			const precipitationDisplay = QUEST_TRACKER_imperialMeasurements['precipitation'] ? precipitationValue['inches'] + "'" : precipitationValue['mm'] + "mm";
			const cloudCoverDisplay = QUEST_TRACKER_CURRENT_WEATHER['rolls']['cloudCover'];
			const visibilityDisplay = QUEST_TRACKER_imperialMeasurements['wind'] ? visibilityValue['imperial']['distance']  + visibilityValue['metric']['unit'] : visibilityValue['metric']['unit'] + visibilityValue['imperial']['unit'];
			const locationDropdown = H.buildLocationDropdown();
			const LunarPhaseDisplay = H.lunarPhases();
			const returnto = isMenu ? "menu=true|" : isHome ? "home=true|" : "";
			let menu = `
				<table style="width:100%;">
					<tr><td>&nbsp;</td><td>&nbsp;</td></tr>
					${LunarPhaseDisplay}
					<tr><td colspan=2><strong>Weather</strong></td></tr>
					<tr><td colspan=2><small>${QUEST_TRACKER_CURRENT_WEATHER['weatherType']}</small></td></tr>
					<tr><td colspan=2><strong>Location</strong></td></tr>
					<tr><td><small>${H.returnCurrentLocation(QUEST_TRACKER_WeatherLocation)}</small></td><td><a style="${styles.button}" href="!qt-date action=adjustlocation|${returnto}new=?{Change Location{${locationDropdown}}">Change</a></td></tr>
					<tr><td><strong>Temperature</strong></td><td>${temperatureDisplay}</td></tr>
					<tr><td colspan=2><small>${QUEST_TRACKER_CURRENT_WEATHER['scaleDescriptions']['temperature']}</small></td></tr>
					<tr><td><strong>Precipitation</strong></td><td>${precipitationDisplay}</td></tr>
					<tr><td colspan=2><small>${QUEST_TRACKER_CURRENT_WEATHER['scaleDescriptions']['precipitation']}</small></td></tr>
					<tr><td><strong>Wind</strong></td><td>${windSpeedDisplay}</td></tr>
					<tr><td colspan=2><small>${QUEST_TRACKER_CURRENT_WEATHER['scaleDescriptions']['wind']}</small></td></tr>
					<tr><td><strong>Humidity</strong></td><td>${humidityDisplay}%</td></tr>
					<tr><td colspan=2><small>${QUEST_TRACKER_CURRENT_WEATHER['scaleDescriptions']['humidity']}</small></td></tr>
					<tr><td><strong>Cloud Cover</strong></td><td>${cloudCoverDisplay}%</td></tr><tr><td colspan=2><small>${QUEST_TRACKER_CURRENT_WEATHER['scaleDescriptions']['cloudCover']}</small></td></tr><tr><td><strong>Visibility</strong></td><td>${visibilityDisplay}</td></tr>
					<tr><td colspan=2><small>${QUEST_TRACKER_CURRENT_WEATHER['scaleDescriptions']['visibility']}</small></td></tr>
				</table>`;
			if (!isMenu) {
				let newMenu = `<div style="${styles.menu}"><h3 style="margin-bottom: 10px;">Weather</h3>`;			
				newMenu += menu;
				newMenu += `</div>`;
				newMenu = newMenu.replace(/[\r\n]/g, ''); 
				Utils.sendGMMessage(newMenu);
			}
			else {
				return menu;
			}
		};
		const displayQuestRelationships = (questId) => {
			const d = {
				drawLine: (type, depth, half = false, flip = false) => {
					let style = "";
					switch (type) {
						case 'r':
							style = `${styles.lineHorizontalRed} top: ${26 + (depth * 26)}px`;
							return `<div style="${style}"></div>`;
						case 'v':
							style = `${styles.verticalLineStyle} height: 16px; left:${half ? 38 : 13}px; top:${38 + (depth * 16)}px`;
							return `<div style="${style}"></div>`;
						case 'h':
							style = `${styles.lineHorizontal} top: ${52 + (depth * 16)}px; width:${half ? 26 : 52}px; left:${flip ? 39 : 13}px`;
							return `<div style="${style}"></div>`;
					}
				},
				drawQuestBox: (content, columnInstructions = [], depth = false) => {
					const renderInstructions = columnInstructions.map(instruction => {
						const { type, depth, center, flip } = instruction;
						return d.drawLine(type, depth, center, flip);
					}).join('');
					return `
					<li style="${styles.liStyle}">
						<div style="${styles.questBox50} margin-top:${depth ? 40 : 20}px;">
							<span style="${styles.spanText}">${content}</span>
						</div>
						${renderInstructions}
					</li>`;
				}
			};
			const l = {
				checkMutualExclusivity: (questIds) => {
					const questData = QUEST_TRACKER_globalQuestData[questIds[0].toLowerCase()];
					if (!questData || !questData.relationships || !Array.isArray(questData.relationships.mutually_exclusive)) {
						return false;
					}
					const mutuallyExclusiveList = questData.relationships.mutually_exclusive;
					return mutuallyExclusiveList.includes(questIds[1]);
				},
				processConditions: (conditions, parentLogic = 'AND') => {
					const flattenedArray = [];
					if (!Array.isArray(conditions)) return flattenedArray;

					conditions.forEach((condition, index) => {
						if (typeof condition === 'string') {
							flattenedArray.push(condition);
							if (index < conditions.length - 1) {
								flattenedArray.push(parentLogic);
							}
						} else if (typeof condition === 'object' && condition.logic && Array.isArray(condition.conditions)) {
							condition.conditions.forEach((subCondition, subIndex) => {
								if (typeof subCondition === 'string') {
									flattenedArray.push(subCondition);
									if (subIndex < condition.conditions.length - 1) {
										flattenedArray.push(condition.logic);
									}
								}
							});
							if (index < conditions.length - 1) {
								flattenedArray.push(parentLogic);
							}
						}
					});
					return flattenedArray;
				},
				traverseLogicTree: (conditions, depth = 0, columnOffset = 0, depthMap = {}, parentLogic = 'AND') => {
					if (!depthMap[depth]) depthMap[depth] = [];
					let column = columnOffset;
					conditions.forEach((condition) => {
						if (typeof condition === 'string') {
							depthMap[depth].push({ type: 'quest', value: condition, logic: parentLogic, depth, column });
							column++;
						} else if (typeof condition === 'object' && condition.logic) {
							const subColumnsStart = column;
							const subColumnsEnd = column + condition.conditions.length - 1;
							const nextDepth = depth + 1;
							l.traverseLogicTree(condition.conditions, nextDepth, column, depthMap, condition.logic);
							depthMap[depth].push({ type: 'logic', logic: condition.logic, conditions: condition.conditions.map(cond => (typeof cond === 'string' ? cond : cond.conditions)), depth, column: subColumnsStart, endColumn: subColumnsEnd, });
							column = subColumnsEnd + 1;
						}
					});
					questLayers = depthMap;
					return { depthMap };
				},
				connectHorizontalLines: (depthMap, instructionsPerColumn) => {
					const depth0Elements = depthMap['0'] ? depthMap['0'] : [];
					if (depth0Elements.length + (depthMap['1'] ? depthMap['1'].length : 0) <= 1) return;
					const depth0Groups = depth0Elements.filter(el => el.type === 'logic')
						.map(el => ({ column: el.column, endColumn: el.endColumn, logic: el.logic, conditions: el.conditions }));
					depth0Groups.forEach(group => {
						for (let col = group.column; col < group.endColumn; col++) {
							if (!instructionsPerColumn[col]) instructionsPerColumn[col] = [];
							instructionsPerColumn[col].push({ type: 'h', depth: 0, center: false });
						}
					});
					if (!depthMap['1']) {
						const allColumns = depth0Elements.flatMap(el => el.type === 'logic' ? [el.column, el.endColumn] : [el.column]);
						const startColumn = Math.min(...allColumns);
						const endColumn = Math.max(...allColumns);
						for (let col = startColumn; col < endColumn; col++) {
							if (!instructionsPerColumn[col]) instructionsPerColumn[col] = [];
							instructionsPerColumn[col].push({ type: 'h', depth: 0, center: false });
						}
						const baseLogic = depthMap['0'].length && depthMap['0'][0].logic;
						return;
					}
					const allColumns = [
						...depth0Elements.flatMap(el => el.type === 'logic' ? [el.column, el.endColumn] : [el.column]),
						...depthMap['1'].map(el => el.column)
					];
					const lastDepth0LogicGroup = depth0Groups.reduce((lastGroup, group) => {
						return group.endColumn > lastGroup.endColumn ? group : lastGroup;
					}, { endColumn: -1, conditions: [] });
					const groupSize = lastDepth0LogicGroup.conditions.length;
					if (allColumns.length > 1) {
						const startColumn = Math.min(...allColumns);
						const endColumn = Math.max(...allColumns);
						for (let col = startColumn; col < endColumn; col++) {
							if (!instructionsPerColumn[col]) instructionsPerColumn[col] = [];
							let lineInstruction;
							if (col < endColumn - 1) {
								lineInstruction = { type: 'h', depth: 1, center: false };
							} else if (col === endColumn - 1) {
								lineInstruction = { type: 'h', depth: 1, center: groupSize % 2 === 0 };
							} else {
								continue;
							}
							
							instructionsPerColumn[col].push(lineInstruction);
						}
					}
				},
				addOrIndicators: (elements, instructionsPerColumn, depth) => {
					elements.forEach((element) => {
						if (element.type === 'logic' && element.logic === 'OR' && l.checkMutualExclusivity(element.conditions)) {
							for (let col = element.column; col < element.endColumn; col++) {
								if (!instructionsPerColumn[col]) instructionsPerColumn[col] = [];
								instructionsPerColumn[col].push({ type: 'r', depth, center: false });
							}
						}
					});
				},
				addCenterVerticalLine: (totalColumns, depth, instructionsPerColumn, startColumn = 0) => {
					const centerColumn = (totalColumns % 2 === 0)
						? startColumn + Math.floor((totalColumns - 1) / 2)
						: startColumn + Math.floor(totalColumns / 2);
					if (!instructionsPerColumn[centerColumn]) instructionsPerColumn[centerColumn] = [];
					instructionsPerColumn[centerColumn].push({ type: 'v', depth, center: totalColumns % 2 === 0 });
				},
				buildVerticalLines: (depthMap, instructionsPerColumn) => {
					if (Array.isArray(depthMap['0'])) {
						const totalColumns = depthMap['0'].reduce((count, element) => {
							if (element.type === 'quest') {
								return count + 1;
							} else if (element.type === 'logic' && Array.isArray(element.conditions)) {
								return count + element.conditions.length;
							}
							return count;
						}, 0);
						for (let column = 0; column < totalColumns; column++) {
							if (!instructionsPerColumn[column]) instructionsPerColumn[column] = [];
							instructionsPerColumn[column].push({ type: 'v', depth: 0, center: false });
						}
						if (!depthMap['1']) {
							l.addCenterVerticalLine(totalColumns, 1, instructionsPerColumn);
						}
					}
					if (Array.isArray(depthMap['1']) && Array.isArray(depthMap['0'])) {
						depthMap['0'].forEach((element) => {
							if (element.type === 'logic') {
								const startColumn = element.column;
								l.addCenterVerticalLine(element.conditions.length, 1, instructionsPerColumn, startColumn);
							} else if (element.type === 'quest') {
								const column = element.column;
								if (!instructionsPerColumn[column]) instructionsPerColumn[column] = [];
								instructionsPerColumn[column].push({type: 'v', depth: 1, center: false});
							}
						});
						const totalQuestCount = depthMap['0'].reduce((count, element) => {
							return count + (element.type === 'quest' ? 1 : element.conditions.length);
						}, 0);
						l.addCenterVerticalLine(totalQuestCount, 2, instructionsPerColumn);
					}
				},
				buildQuestTreeBottomUp: (relationships, currentDepth = 0) => {
					const { depthMap } = l.traverseLogicTree(relationships.conditions, currentDepth, 0, {}, relationships.logic || 'AND');
					const instructionsPerColumn = [];
					l.buildVerticalLines(depthMap, instructionsPerColumn);
					const depths = Object.keys(depthMap).sort((a, b) => b - a);
					depths.forEach((depth) => {
						const elements = depthMap[depth];
						l.addOrIndicators(elements, instructionsPerColumn, parseInt(depth));
					});
					l.connectHorizontalLines(depthMap, instructionsPerColumn);
					return instructionsPerColumn;
				},
				buildQuestListHTML: (flattenedLogic, columnInstructionsMap, depth = 0) => {
					let questListHTML = `<table style="width:100%;"><tr><td colspan="3"><ul style="${styles.ulStyle}">`;
					let questIndex = 0;
					flattenedLogic.forEach((item, index) => {
						const instructions = columnInstructionsMap[questIndex] || [];
						if (item !== 'AND' && item !== 'OR') {
							questListHTML += d.drawQuestBox('P', instructions, depth);
							questIndex++;
						}
					});
					questListHTML += '</ul>';
					return questListHTML;
				}
			};
			const quest = QUEST_TRACKER_globalQuestData[questId];
			let questLayers = {};
			if (!quest || !quest.relationships || !Array.isArray(quest.relationships.conditions) || quest.relationships.conditions.length === 0) {
				return `<ul style="${styles.ulStyle}"> ${d.drawQuestBox("Q", [])} </ul>`;
			}
			else {
				const flattenedLogic = l.processConditions(quest.relationships.conditions, quest.relationships.logic || 'AND');
				const columnInstructionsMap = l.buildQuestTreeBottomUp(quest.relationships);
				let html = `<div style="${styles.treeContainerStyle}"><div style="${styles.treeStyle}">`;
				html += l.buildQuestListHTML(flattenedLogic, columnInstructionsMap, 0);
				html += `
					<ul style="${styles.ulStyle}">
						${d.drawQuestBox("Q", [], questLayers['1'] ? true : false)}
					</ul>
				`;
				html += '</div></div></td></tr></table>';
				return html;
			}
		};
		const generateGMMenu = () => {
			let menu = `<div style="${styles.menu}"><h3 style="margin-bottom: 10px;">Calendar</h3>`;
			menu += `<br>${Calendar.formatDateFull()}<br>( ${QUEST_TRACKER_currentDate} )`;
			if (QUEST_TRACKER_WEATHER && QUEST_TRACKER_CURRENT_WEATHER !== null) {
				menu += buildWeather({ isMenu: true });
			}
			menu += `<br><br><a style="${styles.button}" href="!qt-menu action=adjustdate">Adjust Date</a>`;
			menu += `<br><hr><h3 style="margin-bottom: 10px;">Active Quests</h3>`;
			menu += H.showActiveQuests();
			menu += `<br><a style="${styles.button}" href="!qt-menu action=allquests">Show All Quests</a>`;
			menu += `<br><hr><h3 style="margin-bottom: 10px;">Active Rumours</h3>`;
			menu += H.showActiveRumours();
			menu += `<br><a style="${styles.button}" href="!qt-menu action=allrumours">Show All Rumours</a>`;
			menu += `<br><hr><h3 style="margin-bottom: 10px;">Upcoming Events</h3>`;
			menu += H.showUpcomingEvents();
			menu += `<br><a style="${styles.button}" href="!qt-menu action=allevents">Show All Events</a>`;
			menu += `<br><hr><a style="${styles.button} ${styles.floatRight}" href="!qt-menu action=config">Configuration</a>`;
			menu += `</div>`;
			menu = menu.replace(/[\r\n]/g, ''); 
			Utils.sendGMMessage(menu);
		};
		const showAllQuests = () => {
			QUEST_TRACKER_FILTER.filter = QUEST_TRACKER_FILTER.filter || {};
			QUEST_TRACKER_FILTER.groupBy = QUEST_TRACKER_FILTER.groupBy || null;
			let menu = `<div style="${styles.menu}"><h3 style="margin-bottom: 10px;">All Quests</h3>`;
			menu += H.showFilterMenu('quest') + "<br>";
			if (Object.keys(QUEST_TRACKER_globalQuestData).length === 0) {
				menu += `
					<p>There doesn't seem to be any Quests. You need to create a quest or Import from the Handouts.</p>
				`;
			} else {
				const filteredQuests = QUEST_TRACKER_globalQuestArray
					.map(quest => {
						const questData = QUEST_TRACKER_globalQuestData[quest.id];
						if (questData) {
							const normalizedData = Object.keys(questData).reduce((acc, key) => {
								acc[key.toLowerCase()] = questData[key];
								return acc;
							}, {});
							return H.applyFilter(QUEST_TRACKER_FILTER.filter, normalizedData)
								? { ...quest, ...normalizedData }
								: null;
						}
						return null;
					})
					.filter(Boolean);
				menu += H.renderQuestList(filteredQuests, QUEST_TRACKER_FILTER.groupBy);
			}
			menu += `
				<br><hr>
				<span style="${styles.floatRight}">
					<a style="${styles.button}" href="!qt-menu action=triggers">Triggers</a>
					&nbsp;
					<a style="${styles.button}" href="!qt-menu action=manageQuestGroups">Groups</a>
					&nbsp;
					<a style="${styles.button}" href="!qt-quest action=addquest">Add New</a>
				</span>
				<br><hr>
				<a style="${styles.button}" href="!qt-menu action=main">Back to Main Menu</a>
			</div>`;
			menu = menu.replace(/[\r\n]/g, '');
			Utils.sendGMMessage(menu);
		};
		const showAllRumours = () => {
			QUEST_TRACKER_RUMOUR_FILTER.filter = QUEST_TRACKER_RUMOUR_FILTER.filter || {};
			QUEST_TRACKER_RUMOUR_FILTER.groupBy = QUEST_TRACKER_RUMOUR_FILTER.groupBy || null;
			let menu = `<div style="${styles.menu}"><h3 style="margin-bottom: 10px;">All Rumours</h3>`;
			menu += H.showFilterMenu('rumour') + "<br>";
			menu += `<p>This menu displays all the rumours currently associated with quests. Use the options below to filter, navigate through locations, and modify rumours.</p>`;
			if (Object.keys(QUEST_TRACKER_globalQuestData).length === 0) {
				menu += `<p>There are no quests available. You need to create quests or import from handouts.</p>`;
			} else {
				const filteredQuests = Object.keys(QUEST_TRACKER_globalQuestData)
					.map(questId => {
						const questData = QUEST_TRACKER_globalQuestData[questId] || {};
						const normalizedData = Object.keys(questData).reduce((acc, key) => {
							acc[key.toLowerCase()] = questData[key];
							return acc;
						}, {});
						if (!H.applyFilter(QUEST_TRACKER_RUMOUR_FILTER.filter, normalizedData)) return null;
						const questRumours = QUEST_TRACKER_globalRumours[questId] || {};
						let rumourCount = Object.values(questRumours)
							.reduce((sum, statusRumours) => sum + Object.values(statusRumours)
								.reduce((locSum, locationRumours) => locSum + Object.keys(locationRumours).length, 0), 0);
						return {
							id: questId,
							name: questData.name || `Quest: ${questId}`,
							rumourCount
						};
					})
					.filter(Boolean)
					.sort((a, b) => a.name.localeCompare(b.name));
				menu += H.renderQuestList(filteredQuests, QUEST_TRACKER_RUMOUR_FILTER.groupBy);
			}
			menu += `
				<br><hr>
				<span style="${styles.floatRight}">
					<a style="${styles.button}" href="!qt-menu action=manageRumourLocations">Manage Locations</a>
					&nbsp;
					<a style="${styles.button}" href="!qt-menu action=main">Back to Main</a>
				</span>
			</div>`;
			menu = menu.replace(/[\r\n]/g, '');
			Utils.sendGMMessage(menu);
		};
		const showQuestRumourByStatus = (questId) => {
			let questData = QUEST_TRACKER_globalQuestData[questId];
			const questDisplayName = questData && questData.name ? questData.name : `Quest: ${questId}`;
			let menu = `<div style="${styles.menu}"><h3 style="margin-bottom: 10px;">Rumours for ${questDisplayName}</h3>`;
			menu += `<p>${questData.description}</p>`;
			const questRumours = QUEST_TRACKER_globalRumours[questId] || {};
			const allStatuses = Object.values(statusMapping);
			if (allStatuses.length > 0) {
				menu += `<br><hr><table style="width:100%;">`;
				allStatuses.forEach(status => {
					const rumoursByLocation = questRumours[status.toLowerCase()] || {};
					const rumourCount = Object.values(rumoursByLocation).reduce((count, locationRumours) => {
						return count + Object.keys(locationRumours).length;
					}, 0);
					menu += `
					<tr>
						<td>${status}<br><small>${rumourCount} rumours</small></td>
						<td style="${styles.floatRight}">
							<a style="${styles.button}" href="!qt-menu action=showRumourDetails|questId=${questId}|status=${status.toLowerCase()}">Show</a>
						</td>
					</tr>`;
				});
				menu += `</table><br>`;
			} else {
				menu += `
					<p>There are no rumours available; either refresh the data, or start adding manually.</p>
					<br><hr>
					<a style="${styles.button}" href="!qt-menu action=locations">Location Management</a>
					<br><hr>
					<a style="${styles.button}" href="!qt-import">Import Quest and Rumour Data</a>
				`;
			}
			menu += `
				<br><hr>
				<span style="${styles.floatRight}">
					<a style="${styles.button}" href="!qt-menu action=allrumours">All Rumours</a>
					&nbsp;
					<a style="${styles.button}" href="!qt-menu action=main">Main Menu</a>
				</span>
				<br><hr>
			</div>`;
			menu = menu.replace(/[\r\n]/g, ''); 
			Utils.sendGMMessage(menu);
		};
		const showRumourDetails = (questId, statusId) => {
			const questData = QUEST_TRACKER_globalQuestData[questId];
			const questDisplayName = questData && questData.name ? questData.name : `Quest: ${questId}`;
			const statusName = statusMapping[statusId] || statusId;
			let menu = `<div style="${styles.menu}"><h3 style="margin-bottom: 10px;">Rumours for ${questDisplayName}</h3><h3>Status: ${statusName}</h3>`;
			menu += `<p>This menu displays all the rumours currently associated with ${questDisplayName} under the status "${statusName}". Use the options below to update, add, or remove rumours.</p><p>To add new lines into the rumours use &#37;NEWLINE&#37;. To add in quotation marks you need to use &amp;quot;.</p><br><hr>`;
			const locationTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_LOCATIONS })[0];
			if (!locationTable) {
				menu += `
					<p>Error: Locations table not found. Please check if the table exists in the game.</p>
					<br><hr>
					<a style="${styles.button}" href="!qt-menu action=locations">Location Management</a>
					<br><hr>
					<a style="${styles.button}" href="!qt-import">Import Quest and Rumour Data</a>
				</div>`;
				Utils.sendGMMessage(menu.replace(/[\r\n]/g, ''));
				return;
			}
			const locationItems = findObjs({ type: 'tableitem', rollabletableid: locationTable.id });
			let locationMapping = locationItems.map(location => ({
				originalName: location.get('name'),
				sanitizedName: Utils.sanitizeString(location.get('name').toLowerCase()),
				weight: location.get('weight')
			}));
			locationMapping.sort((a, b) => {
				if (a.sanitizedName === 'everywhere') return -1;
				if (b.sanitizedName === 'everywhere') return 1;
				return a.originalName.localeCompare(b.originalName);
			});
			const questRumours = QUEST_TRACKER_globalRumours[questId] || {};
			const rumoursByStatus = questRumours[statusId.toLowerCase()] || {};
			Object.keys(locationMapping).forEach(sanitizedLocationName => {
				const { originalName, weight } = locationMapping[sanitizedLocationName];
				const locationRumours = rumoursByStatus[sanitizedLocationName] || {};
				menu += `<h4>${originalName}</h4><table style="width:100%;">`;
				if (Object.keys(locationRumours).length > 0) {
					Object.keys(locationRumours).forEach(rumourId => {
						const rumourText = locationRumours[rumourId];
						let trimmedRumourText = String(rumourText).substring(0, 50);
						let rumourTextSanitized = rumourText
							.replace(/"/g, '&quot;')
							.replace(/%NEWLINE%|<br>/g, ' | ');
						let rumourInputSanitized = rumourText
							.replace(/"/g, '&quot;')
							.replace(/<br>/g, '%NEWLINE%');
						menu += `
						<tr>
							<td><small style="${styles.rumour}">${trimmedRumourText}</small></td>
							<td style="${styles.smallButtonContainer}">
								<img style="${styles.button} ${styles.smallButtonMagnifier}" src="https://s3.amazonaws.com/files.d20.io/images/408852025/dSbfzo-MbnFFePocX86p-w/max.png" width="12px" height="12px" title="${rumourTextSanitized}">
							</td>
							<td style="${styles.smallButtonContainer}">
								<a style="${styles.button} ${styles.smallButton}" href="!qt-rumours action=update|questid=${questId}|status=${statusId.toLowerCase()}|location=${weight}|rumourid=${rumourId}|new=?{Update Rumour|${rumourInputSanitized}}">c</a>
							</td>
							<td style="${styles.smallButtonContainer}">
								<a style="${styles.button} ${styles.smallButton} ${styles.marginRight}" href="!qt-rumours action=remove|questid=${questId}|status=${statusId.toLowerCase()}|location=${weight}|rumourid=${rumourId}">-</a>
							</td>
						</tr>`;
					});
				} else {
					menu += `
					<tr>
						<td colspan="3"><small>No rumours</small></td>
					</tr>`;
				}
				menu += `
				<tr style="border-top: 1px solid #ddd">
					<td></td>
					<td colspan="3" style="${styles.smallButtonAdd}">
						<a style="${styles.button} ${styles.smallButton}" href="!qt-rumours action=add|questid=${questId}|status=${statusId.toLowerCase()}|location=${weight}|new=?{Enter New Rumour}">+</a>
					</td>
				</tr>
				</table>`;
			});
			menu += `
				<br><hr>
				<span style="${styles.floatRight}">
					<a style="${styles.button}" href="!qt-menu action=showQuestRumours|questId=${questId}">By Status</a>
					&nbsp;
					<a style="${styles.button}" href="!qt-menu action=allrumours">All Rumours</a>
					&nbsp;
					<a style="${styles.button}" href="!qt-menu action=main">Main Menu</a>
				</span>
				<br><hr>
			</div>`;
			menu = menu.replace(/[\r\n]/g, ''); 
			Utils.sendGMMessage(menu);
		};
		const showQuestDetails = (questId) => {
			let quest = QUEST_TRACKER_globalQuestData[questId];
			if (!quest) {
				Utils.sendGMMessage(`Error: Quest "${questId}" not found.`);
				return;
			}
			let statusName = Quest.getStatusNameByQuestId(questId, QUEST_TRACKER_globalQuestArray);
			quest = Utils.normalizeKeys(quest);
			let hiddenStatus = quest.hidden ? 'Yes' : 'No';
			let disabledStatus = (quest.disabled ?? false) ? 'Yes' : 'No';
			let questGroup = H.getQuestGroupNameByWeight(quest.group);
			let hiddenStatusTorF = quest.hidden ? 'true' : 'false';
			let hiddenStatusTorF_reverse = quest.hidden ? 'false' : 'true';
			let disabledStatusTorF = (quest.disabled ?? false) ? 'true' : 'false';
			let disabledStatusTorF_reverse = (quest.disabled ?? false) ? 'false' : 'true';
			let relationshipsHtml = displayQuestRelationships(questId);
			let relationshipMenuHtml = H.relationshipMenu(questId);
			let validQuestGrouping = H.getValidQuestGroups(questId);
			let displayQuestTokenHtml = H.displayQuestToken(questId);
			let displayQuestHandoutHtml = H.displayQuestHandout(questId);
			let menu = `
				<div style="${styles.menu}">
					<h3 style="margin-bottom: 10px;">${quest.name || 'Unnamed Quest'}</h3>
					${displayQuestTokenHtml}
					<p>${quest.description || 'No description available.'}</p>
					<span style="${styles.floatRight}">
						<a style="${styles.button}" href="!qt-quest action=update|field=name|current=${questId}|old=${quest.name || ''}|new=?{Title|${quest.name || ''}}">Edit Title</a>
						&nbsp;
						<a style="${styles.button}" href="!qt-quest action=update|field=description|current=${questId}|old=${quest.description || ''}|new=?{Description|${quest.description || ''}}">Edit Description</a>
					</span>
					<br>
					${displayQuestHandoutHtml}
					<br>
					<h4 style="${styles.bottomBorder} ${styles.topMargin}">Relationships</h4>
					${relationshipsHtml}
					${relationshipMenuHtml}
					<h4 style="${styles.bottomBorder} ${styles.topMargin}">Status</h4>
					<span>${statusName}</span>
					<span style="${styles.floatRight}">
						<a style="${styles.button}" href="!qt-quest action=update|field=status|current=${questId}|new=?{Change Status${Object.keys(statusMapping).map(key => `|${statusMapping[key]},${key}`).join('')}}">Change</a>
					</span>
					<h4 style="${styles.bottomBorder} ${styles.topMargin}">Hidden</h4>
					<span>${hiddenStatus}</span>
					<span style="${styles.floatRight}">
						<a style="${styles.button}" href="!qt-quest action=update|field=hidden|current=${questId}|old=${hiddenStatusTorF}|new=${hiddenStatusTorF_reverse}">Change</a>
					</span>
					<h4 style="${styles.bottomBorder} ${styles.topMargin}">Disabled</h4>
					<span>${disabledStatus}</span>
					<span style="${styles.floatRight}">
						<a style="${styles.button}" href="!qt-quest action=update|field=disabled|current=${questId}|old=${disabledStatusTorF}|new=${disabledStatusTorF_reverse}">Change</a>
					</span>
					<h4 style="${styles.bottomBorder} ${styles.topMargin}">Quest Group</h4>
					<span>${questGroup}</span>
					<span style="${styles.floatRight}">
						<a style="${styles.button}" href="!qt-quest action=update|field=group|current=${questId}|new=${validQuestGrouping}">Adjust</a>
					</span>
					<br><hr>
					<a style="${styles.button}" href="!qt-menu action=triggers">Triggers</a>
					&nbsp;<a style="${styles.button}" href="!qt-menu action=allquests">All Quests</a>
					&nbsp;<a style="${styles.button}" href="!qt-menu action=main">Main Menu</a>
				</div>`;
			menu = menu.replace(/[\r\n]/g, '');
			Utils.sendGMMessage(menu);
		};
		const manageRumourLocations = () => {
			let menu = `<div style="${styles.menu}"><h3 style="margin-bottom: 10px;">Manage Rumour Locations</h3>`;
			let locationTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_LOCATIONS })[0];
			if (!locationTable) {
				menu += `<p>Error: Locations table not found. Please check if the table exists in the game.</p></div>`;
				Utils.sendGMMessage(menu.replace(/[\r\n]/g, ''));
				return;
			}
			let locationItems = findObjs({ type: 'tableitem', rollabletableid: locationTable.id });
			let everywhereLocation = locationItems.find(loc => loc.get('name').toLowerCase() === 'everywhere');
			let otherLocations = locationItems
				.filter(loc => loc.get('name').toLowerCase() !== 'everywhere')
				.sort((a, b) => a.get('name').localeCompare(b.get('name')));
			let uniqueLocations = new Set();
			if (everywhereLocation) {
				otherLocations.unshift(everywhereLocation);
			}
			otherLocations.forEach(location => {
				let locationName = location.get('name');
				let locationKey = locationName.toLowerCase();
				let locationId = location.get('weight');
				if (!uniqueLocations.has(locationKey)) {
					uniqueLocations.add(locationKey);
					let rumourCount = QUEST_TRACKER_rumoursByLocation[locationKey] ? Object.keys(QUEST_TRACKER_rumoursByLocation[locationKey]).length : 0;
					let showButtons = !(locationId === 1 || locationKey === 'everywhere');
					menu += `<li style="${styles.column}">
								<span style="${styles.floatLeft}">${locationName}<br><small>${rumourCount} Rumours</small></span>
								<span style="${styles.floatRight}">`;
					if (showButtons) {
						menu += `<a style="${styles.button} ${styles.smallButton}" href="!qt-rumours action=editLocationName|locationId=${locationId}|old=${locationName}|new=?{Update Location Name|${locationName}}">c</a>
								 <a style="${styles.button} ${styles.smallButton}" href="!qt-rumours action=removeLocation|locationId=${locationId}|confirmation=?{Type DELETE to confirm removal of this location|}">-</a>`;
					}
					menu += `</span></li>`;
				}
			});
			menu += `<br><a style="${styles.button}" href="!qt-rumours action=addLocation|new=?{New Location Name}">Add New Location</a>`;
			menu += `<br><hr><a style="${styles.button}" href="!qt-menu action=allrumours">Back to Rumours</a></div>`;
			Utils.sendGMMessage(menu.replace(/[\r\n]/g, ''));
		};
		const manageQuestGroups = () => {
			let menu = `<div style="${styles.menu}"><h3 style="margin-bottom: 10px;">Manage Quest Groups</h3>`;
			let groupTable = findObjs({ type: 'rollabletable', name: QUEST_TRACKER_ROLLABLETABLE_QUESTGROUPS })[0];
			if (!groupTable) {
				menu += `<p>Error: Quest Groups table not found. Please check if the table exists in the game.</p></div>`;
			}
			else {
				let groupItems = findObjs({ type: 'tableitem', rollabletableid: groupTable.id });
				let uniqueGroups = new Set();
				groupItems.sort((a, b) => a.get('weight') - b.get('weight')).forEach(group => {
					let groupName = group.get('name');
					let groupKey = groupName.toLowerCase();
					let groupId = group.get('weight');
					if (!uniqueGroups.has(groupKey)) {
						uniqueGroups.add(groupKey);
						let questCount = 0;
						Object.keys(QUEST_TRACKER_globalQuestData).forEach(questId => {
							let questData = QUEST_TRACKER_globalQuestData[questId];
							if (questData.group && parseInt(questData.group) === parseInt(groupId)) {
								questCount++;
							}
						});
						let plural = (questCount === 1) ? '' : 's';
						menu += `<li style="${styles.column}">
								<span style="${styles.floatLeft}">${groupName}<br><small>${questCount} Quest${plural}</small></span>
								<span style="${styles.floatRight}">`;
						menu += `<a style="${styles.button} ${styles.smallButton}" href="!qt-questgroup action=update|groupid=${groupId}|old=${groupName}|new=?{Update Group Name|${groupName}}">c</a>
								 <a style="${styles.button} ${styles.smallButton}" href="!qt-questgroup action=remove|groupid=${groupId}|confirmation=?{Type CONFIRM to confirm removal of this group|}">-</a>`;
						menu += `</span></li>`;
					}
				});
			}
			menu += `<br><a style="${styles.button}" href="!qt-questgroup action=add|new=?{New Group Name}">Add New Group</a>`;
			menu += `<br><hr><a style="${styles.button}" href="!qt-menu action=allquests">Back to Quests</a></div>`;
			menu = menu.replace(/[\r\n]/g, ''); 
			Utils.sendGMMessage(menu);
		};
		const adminMenu = () => {
			let menu = `<div style="${styles.menu}"><h3 style="margin-bottom: 10px;">Quest Tracker Configuration</h3>`;
			let RefreshImport = "Import";
			if (Object.keys(QUEST_TRACKER_globalQuestData).length !== 0) {
				RefreshImport = "Refresh";
			}
			const calenderDropdown = H.buildCalenderDropdown();
			const climateDropdown = H.buildClimateDropdown();
			menu += `<br><h4>Settings</h4><a style="${styles.button} ${styles.floatClearRight}" href="!qt-config action=togglereadableJSON|value=${QUEST_TRACKER_readableJSON === true ? 'false' : 'true'}">Toggle Readable JSON (${QUEST_TRACKER_readableJSON === true ? 'on' : 'off'})</a>`;
			// menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-config action=togglejumpgate|value=${QUEST_TRACKER_jumpGate === true ? 'false' : 'true'}">Toggle JumpGate (${QUEST_TRACKER_jumpGate === true ? 'on' : 'off'})</a>`;
			menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-config action=toggleVerboseErrors|value=${QUEST_TRACKER_verboseErrorLogging === true ? 'false' : 'true'}">Toggle Verbose Errors (${QUEST_TRACKER_verboseErrorLogging === true ? 'on' : 'off'})</a>`;
			menu += `<br clear=all><h4>Data</h4><a style="${styles.button} ${styles.floatClearRight}" href="!qt-import">${RefreshImport} JSON Data</a>`;
			menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-config action=reset|confirmation=?{Are you sure? This will also clear all historical weather data. Type CONFIRM to continue|}">Reset to Defaults</a>`;
			menu += `<br clear=all><h4>Quest Tree</h4><a style="${styles.button} ${styles.floatClearRight}" href="!qt-questtree action=build">Build Quest Tree Page</a>`;
			menu += `<br><h4>Calander</h4><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=setcalender|new=?{Choose Calender${calenderDropdown}}">Calendar: ${CALENDARS[QUEST_TRACKER_calenderType]?.name || "Unknown Calendar"}</a>`;
			menu += `<br clear=all><h4>Weather</h4><br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-config action=toggleWeather|value=${QUEST_TRACKER_WEATHER === true ? 'false' : 'true'}">Toggle Weather (${QUEST_TRACKER_WEATHER === true ? 'on' : 'off'})</a>`;
			if (QUEST_TRACKER_WEATHER) {
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=setclimate|new=?{Choose Calender${climateDropdown}}">Climate: ${QUEST_TRACKER_Location}</a>`;
				menu += `<br clear=all><h4>Weather Trends</h4><br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=settrend|field=dry|new=?{Set Trend}">Dry: ${QUEST_TRACKER_WEATHER_TRENDS['dry'] || 0}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=settrend|field=wet|new=?{Set Trend}">Wet: ${QUEST_TRACKER_WEATHER_TRENDS['wet'] || 0}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=settrend|field=heat|new=?{Set Trend}">Heat: ${QUEST_TRACKER_WEATHER_TRENDS['heat'] || 0}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=settrend|field=cold|new=?{Set Trend}">Cold: ${QUEST_TRACKER_WEATHER_TRENDS['cold'] || 0}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=settrend|field=wind|new=?{Set Trend}">Wind: ${QUEST_TRACKER_WEATHER_TRENDS['wind'] || 0}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=settrend|field=humid|new=?{Set Trend}">Humidity: ${QUEST_TRACKER_WEATHER_TRENDS['humid'] || 0}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=settrend|field=visibility|new=?{Set Trend}">Fog: ${QUEST_TRACKER_WEATHER_TRENDS['visibility'] || 0}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=settrend|field=cloudy|new=?{Set Trend}">Cloud Cover: ${QUEST_TRACKER_WEATHER_TRENDS['cloudy'] || 0}</a>`;
				menu += `<br clear=all><h4>Forced Weather Trends</h4><br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=forcetrend|field=dry">Dry: ${QUEST_TRACKER_FORCED_WEATHER_TRENDS['dry'] || 'False'}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=forcetrend|field=wet">Wet: ${QUEST_TRACKER_FORCED_WEATHER_TRENDS['wet'] || 'False'}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=forcetrend|field=heat">Heat: ${QUEST_TRACKER_FORCED_WEATHER_TRENDS['heat'] || 'False'}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=forcetrend|field=cold">Cold: ${QUEST_TRACKER_FORCED_WEATHER_TRENDS['cold'] || 'False'}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=forcetrend|field=wind">Wind: ${QUEST_TRACKER_FORCED_WEATHER_TRENDS['wind'] || 'False'}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=forcetrend|field=humid">Humidity: ${QUEST_TRACKER_FORCED_WEATHER_TRENDS['humid'] || 'False'}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=forcetrend|field=visibility">Visibility: ${QUEST_TRACKER_FORCED_WEATHER_TRENDS['visibility'] || 'False'}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-date action=forcetrend|field=cloudy">Cloud Cover: ${QUEST_TRACKER_FORCED_WEATHER_TRENDS['cloudy'] || 'False'}</a>`;
				menu += `<br clear=all><h4>Imperial Measurements</h4><br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-config action=toggleimperial|type=temperature|value=${QUEST_TRACKER_imperialMeasurements['temperature'] === true ? 'false' : 'true'}">Temperature: ${QUEST_TRACKER_imperialMeasurements['temperature'] || 'False'}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-config action=toggleimperial|type=precipitation|value=${QUEST_TRACKER_imperialMeasurements['precipitation'] === true ? 'false' : 'true'}">Precipitation: ${QUEST_TRACKER_imperialMeasurements['precipitation'] || 'False'}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-config action=toggleimperial|type=wind|value=${QUEST_TRACKER_imperialMeasurements['wind'] === true ? 'false' : 'true'}">Wind: ${QUEST_TRACKER_imperialMeasurements['wind'] || 'False'}</a>`;
				menu += `<br><a style="${styles.button} ${styles.floatClearRight}" href="!qt-config action=toggleimperial|type=visibility|value=${QUEST_TRACKER_imperialMeasurements['visibility'] === true ? 'false' : 'true'}">Visibility: ${QUEST_TRACKER_imperialMeasurements['visibility'] || 'False'}</a>`;
			}
			menu += `<br clear=all><hr><a style="${styles.button} ${styles.floatClearRight}" href="!qt-menu action=main">Back to Main Menu</a>`;
			menu += `</div>`;
			menu = menu.replace(/[\r\n]/g, ''); 
			Utils.sendGMMessage(menu);
		};
		const showAllEvents = () => {
			let menu = `<div style="${styles.menu}"><h3 style="margin-bottom: 10px;">All Events</h3>`;
			if (Object.keys(QUEST_TRACKER_Events).length === 0) {
				menu += `
					<p>There doesn't seem to be any Events, you need to create a quest or Import from the Handouts.</p>
				`;
			} else {
				menu += `<ul style="${styles.list}">`;
				Object.keys(QUEST_TRACKER_Events).forEach(eventId => {
					const event = QUEST_TRACKER_Events[eventId];
					const name = event.name;
					const date = event.date;
					menu += `
						<li style="${styles.overflow}">
							<span style="${styles.floatLeft}">
								${name}
								<br>
								<small>${date}</small>
							</span>
							<span style="${styles.floatRight}">
								<a style="${styles.button}" href="!qt-menu action=showevent|eventid=${eventId}">Inspect</a>
								<a style="${styles.button} ${styles.smallButton}" href="!qt-date action=removeevent|eventid=${eventId}|confirmation=?{Type DELETE into this field to confirm deletion of this quest|}">x</a>
							</span>
						</li>
							`;
				});
				menu += `</ul>`;
			}
			menu += `
				<br><hr>
				<span style="${styles.floatRight}">
					<a style="${styles.button}" href="!qt-date action=addevent">Add New Event</a>
				</span>
				<br><hr>
				<a style="${styles.button}" href="!qt-menu action=main">Back to Main Menu</a>
			</div>`;
			menu = menu.replace(/[\r\n]/g, ''); 
			Utils.sendGMMessage(menu);
		};
		const showEventDetails = (eventid) => {
			let event = QUEST_TRACKER_Events[eventid];
			if (!event) {
				Utils.sendGMMessage(`Error: Event "${eventid}" not found.`);
				return;
			}
			let hiddenStatus = event.hidden ? 'Yes' : 'No';
			let hiddenStatusTorF = event.hidden ? 'true' : 'false';
			let hiddenStatusTorF_reverse = event.hidden ? 'false' : 'true';
			let repeatStatus = event.repeatable ? 'Yes' : 'No';
			let repeatStatusTorF = event.repeatable ? 'true' : 'false';
			let repeatStatusTorF_reverse = event.repeatable ? 'false' : 'true';
			const frequencyDropdown = H.buildFrequencyDropdown();
			const showFrequency = event.repeatable ? `<br><br><span>Frequency: <small>${frequencyMapping[event.frequency]}</small></span><span style="${styles.floatRight}"><a style="${styles.button}" href="!qt-date action=update|field=frequency|current=${eventid}|date=${event.date}|old=${event.frequency}|new=?{Frequency${frequencyDropdown}}">Adjust</a></span>` : '';
			let menu = `
				<div style="${styles.menu}">
					<h3 style="margin-bottom: 10px;">${event.name || 'Unnamed Event'}</h3>
					<p>${event.description || 'No description available.'}</p>
					<span style="${styles.floatRight}">
						<a style="${styles.button}" href="!qt-date action=update|field=name|current=${eventid}|old=${event.name || ''}|new=?{Title|${event.name || ''}}">Edit Event Name</a>
						&nbsp;
						<a style="${styles.button}" href="!qt-date action=update|field=description|current=${eventid}|old=${event.description || ''}|new=?{Description|${event.description || ''}}">Edit Description</a>
					</span>
					<br>
					<h4 style="${styles.bottomBorder} ${styles.topMargin}">${event.repeatable ? 'Starting ' : ''}Date</h4><br>
					<span>${event.date}</span>
					<span style="${styles.floatRight}">
						<a style="${styles.button}" href="!qt-date action=update|field=date|current=${eventid}|old=${event.date}|new=?{Change${event.repeatable ? 'Starting ' : ''} Date, Must be digits separated by dashes (e.g., YYYY-MM-DD or similar).}">Change</a>
					</span>
					<br>
					<h4 style="${styles.bottomBorder} ${styles.topMargin}">Hidden</h4><br>
					<span>${hiddenStatus}</span>
					<span style="${styles.floatRight}">
						<a style="${styles.button}" href="!qt-date action=update|field=hidden|current=${eventid}|old=${hiddenStatusTorF}|new=${hiddenStatusTorF_reverse}">Change</a>
					</span>
					<br>
					<h4 style="${styles.bottomBorder} ${styles.topMargin}">Repeatable</h4><br>
					<span>${repeatStatus}</span>
					<span style="${styles.floatRight}">
						<a style="${styles.button}" href="!qt-date action=update|field=repeatable|current=${eventid}|old=${repeatStatusTorF}|new=${repeatStatusTorF_reverse}">Change</a>
					</span>
					${showFrequency}`;
			if (event.repeatable && event.frequency === "2") {
				menu += `<br><small>Occurs every ${event.weekdayname  || 'Unknown'}</small>`;
			}
			menu += `<br><hr>
					<a style="${styles.button}" href="!qt-menu action=allevents">All Events</a>
					&nbsp;
					<a style="${styles.button}" href="!qt-menu action=main">Back to Main Menu</a>
				</div>`;
			menu = menu.replace(/[\r\n]/g, ''); 
			Utils.sendGMMessage(menu);
		};
		const adjustDate = () => {
			let menu = `
				<div style="${styles.menu}">
					<h3 style="margin-bottom: 10px;">Adjust Date</h3>
					<br>${Calendar.formatDateFull()}<br>( ${QUEST_TRACKER_currentDate} )`;
			if (QUEST_TRACKER_WEATHER && QUEST_TRACKER_CURRENT_WEATHER !== null) {
				menu += buildWeather({ isHome: true });
			}
			menu += `<br><br><a style="${styles.button} ${styles.floatRight}" href="!qt-date action=set|menu=true|new=?{Set Current Date|}">Set Date</a>
					<br><hr><h3>Advance Date</h3>`;
			if (QUEST_TRACKER_WEATHER) {
				menu += `<small>Advancing Dates calculates weather so there are hard limits imposed.</small>`;
			}
			menu += `<br><a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=day|new=1">Day</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=week|new=1">Week</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=month|new=1">Month</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=year|new=1">Year</a>
					<br><strong>Custom</strong>`;
			if (QUEST_TRACKER_WEATHER) {	
				menu += `<br><a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=day|new=?{Enter number of Days, Max 500}">Day</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=week|new=?{Enter number of Weeks, Max 60}">Week</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=month|new=?{Enter number of Months, max 15}">Month</a>`;
			}
			else {
				menu += `<br><a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=day|new=?{Enter number of Days}">Day</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=week|new=?{Enter number of Weeks}">Week</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=month|new=?{Enter number of Months}">Month</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=month|new=?{Enter number of Years}">Year</a>`;
			}
			menu += `<br><hr><h3>Retreat Date</h3>`;
			if (QUEST_TRACKER_WEATHER) {
				menu += `<small>Retreating Dates does not calculate weather, so there are no limits imposed.</small>`;
			}
			menu += `<br><a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=day|new=-1">Day</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=week|new=-1">Week</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=month|new=-1">Month</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=year|new=-1">Year</a>
					<br><strong>Custom</strong>
					<br><a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=day|new=-?{Enter number of Days}">Day</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=week|new=-?{Enter number of Weeks}">Week</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=month|new=-?{Enter number of Months}">Month</a>
					&nbsp;<a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=year|new=-?{Enter number of Years}">Year</a>
					<br><hr><h3>Special Advance</h3>
					<small>Nothing will happen if there are no Festivals, Significant Dates or Events set in your Calendar.</small>
					<br><a style="${styles.button}" href="!qt-date action=modify|menu=true|unit=event|new=1">Next Date of Significance</a>
					<br clear=all><hr><a style="${styles.button} ${styles.floatClearRight}" href="!qt-menu action=main">Back to Main Menu</a>
				</div>`;
			menu = menu.replace(/[\r\n]/g, ''); 
			Utils.sendGMMessage(menu);
		};
		const manageFilter = ({ action, key, value, menu = 'quest' }) => {
			const FILTER = menu === 'rumour' ? QUEST_TRACKER_RUMOUR_FILTER : QUEST_TRACKER_FILTER;
			if (!FILTER.filter) FILTER.filter = {};
			switch (action) {
				case 'add': {
					if (key === 'group') {
						const groupValue = parseInt(value, 10);
						FILTER.filter.group = [groupValue];
					}
					break;
				}
				case 'remove': {
					if (key === 'group') {
						const groups = Array.isArray(FILTER.filter.group)
							? [...FILTER.filter.group]
							: [];
						const groupValue = parseInt(value, 10);
						FILTER.filter.group = groups.filter(group => group !== groupValue);
					}
					break;
				}
				case 'modify': {
					if (key === 'groupBy') {
						if (value === null || value === undefined) {
							FILTER.groupBy = null;
						} else {
							const validGroupByOptions = ['group', 'visibility', 'handout', 'disabled', null];
							if (!validGroupByOptions.includes(value)) {
								errorCheck(167, 'msg', null, `Invalid value for groupBy: ${value}`);
								return;
							}
							FILTER.groupBy = value;
						}
					} else if (value === null || value === undefined) {
						delete FILTER.filter[key];
					} else {
						const normalizedValue = value === 'true' ? true : value === 'false' ? false : value;
						FILTER.filter[key] = normalizedValue;
					}
					break;
				}
				case 'clear': {
					FILTER.filter = {};
					FILTER.groupBy = null;
					break;
				}
				case 'resetGrouping': {
					FILTER.groupBy = null;
					break;
				}
				case 'sort': {
					FILTER.sortBy = value || null;
					FILTER.sortOrder = 'asc';
					break;
				}
				default:
					errorCheck(164, 'msg', null, `Unknown filter action: ${action}`);
					return;
			}
			saveQuestTrackerData();
		};
		const showAllTriggers = () => {
			Triggers.initializeTriggersStructure();
			const allTriggers = [];
			Object.entries(QUEST_TRACKER_Triggers.quests).forEach(([questId, triggers]) => {
				Object.entries(triggers).forEach(([triggerId, trigger]) => {
					allTriggers.push({ 
						id: triggerId, 
						name: trigger.name || 'Unnamed Trigger', 
						type: 'quest', 
						parent: H.getQuestName(questId) || 'Unknown Quest' 
					});
				});
			});
			Object.entries(QUEST_TRACKER_Triggers.dates).forEach(([date, triggers]) => {
				Object.entries(triggers).forEach(([triggerId, trigger]) => { 
					allTriggers.push({ 
						id: triggerId, 
						name: trigger.name || 'Unnamed Trigger', 
						type: 'date', 
						parent: date 
					});
				});
			});
			Object.entries(QUEST_TRACKER_Triggers.reactions).forEach(([reactionParentId, triggers]) => {
				Object.entries(triggers).forEach(([triggerId, trigger]) => {
					allTriggers.push({ 
						id: triggerId, 
						name: trigger.name || 'Unnamed Reaction', 
						type: 'reaction', 
						parent: reactionParentId || 'Unknown Trigger' 
					});
				});
			});
			allTriggers.sort((a, b) => a.name.localeCompare(b.name));
			let menu = `<div style="${styles.menu}"><h3 style="margin-bottom: 10px;">All Quest Triggers</h3>`;
			menu += `<p>This menu displays all the triggers currently associated with quests, dates, and reactions.</p>`;
			if (allTriggers.length === 0) {
				menu += `<p>No triggers found. Click 'Add Trigger' to create one.</p>`;
			} else {
				menu += `<ul style="${styles.list}">`;
				allTriggers.forEach(trigger => {
					menu += `
						<li style="${styles.overflow}">
							<span style="${styles.floatLeft}">
								${trigger.name}
								<br>
								<small>${
									trigger.type === 'quest' 
										? trigger.parent 
										: trigger.type === 'date' 
										? trigger.parent 
										: `Triggered by: ${H.getTriggerName(trigger.parent)}`
								}</small>
							</span>
							<span style="${styles.floatRight}">
								<a style="${styles.button}" href="!qt-menu action=showTriggerDetails|id=${trigger.id}">Inspect</a>
								<a style="${styles.button} ${styles.smallButton}" href="!qt-trigger action=delete|triggerid=${trigger.id}">-</a>
							</span>
						</li>`;
				});
				menu += `</ul>`;
			}
			menu += `<br><hr>
				<span style="${styles.floatRight}">
					<a style="${styles.button}" href="!qt-trigger action=add">Add Trigger</a>
					&nbsp;
					<a style="${styles.button}" href="!qt-menu action=allquests">Quests</a>
					&nbsp;
					<a style="${styles.button}" href="!qt-menu action=main">Main Menu</a>
				</span>
			</div>`;
			menu = menu.replace(/[\r\n]/g, '');
			Utils.sendGMMessage(menu);
		};
		const showTrigger = (triggerId) => {
			Triggers.initializeTriggersStructure();
			const triggerPath = Triggers.locateItem(triggerId, 'trigger');
			const trigger = Utils.getNestedProperty(QUEST_TRACKER_Triggers, triggerPath.replace('QUEST_TRACKER_Triggers.', ''));
			const currentType = triggerPath.match(/QUEST_TRACKER_Triggers\.(quests|dates|reactions)/)?.[1].replace(/s$/, '');
			const typeOptions = ['quest', 'date', 'reaction']
				.filter(type => type !== currentType)
				.map(type => `${type.charAt(0).toUpperCase() + type.slice(1)},${type}`)
				.join('|');
			const typeDropdownString = `?{Change Trigger Type|${typeOptions}}`;
			const enabled = !!trigger?.enabled;
			const capitalizedType = currentType.charAt(0).toUpperCase() + currentType.slice(1);
			let activationSection = ``;
			let effectsSection = ``;
			const triggerPathParts = triggerPath.split('.');
			const dropdownType = "?{Choose Type|Status Change,status|Toggle: Visibility,hidden|Toggle: State,disabled}";
			switch(currentType) {
				case 'quest':
					const actionType = trigger?.action?.type
						? trigger.action.type.charAt(0).toUpperCase() + trigger.action.type.slice(1)
						: false;
					const dropdownEffect = H.effectDropdown(actionType);
					const actionEffect = trigger?.action?.effect
						? trigger.action.effect.charAt(0).toUpperCase() + trigger.action.effect.slice(1)
						: false;
					const effectText = (() => {
						if (!actionType) return 'Select a Type';
						if (trigger.action.effect === null) return 'Choose';
						switch (actionType?.toLowerCase()) {
							case 'hidden':
								return trigger.action.effect.charAt(0).toUpperCase() + trigger.action.effect.slice(1)
							case 'disabled':
								return trigger.action.effect.charAt(0).toUpperCase() + trigger.action.effect.slice(1)
							case 'status':
								return statusMapping[trigger.action.effect] || 'Invalid Status';
							default:
								return 'Unknown Type';
						}
					})();
					
						if (H.createQuestDropdown() !== null) activationSection += `<a style="${styles.button} vertical-align: top;" href="!qt-trigger action=prompt|triggerid=${triggerId}|field=quest|value=${H.createQuestDropdown()}">${triggerPathParts[2] === "null" ? `Assign Quest` : `${H.getQuestName(triggerPathParts[2])}` }</a>`;
						else activationSection += `<span style="${styles.buttonDisabled} ${styles.spanInline}">No Quests</span>`;
						activationSection += `<br>
						<a style="${styles.button}" href="!qt-trigger action=action|triggerid=${triggerId}|type=${dropdownType}">${actionType ? actionType : 'Choose Type'}</a>
						${actionType ? `<br><a style="${styles.button}" href="!qt-trigger action=effect|triggerid=${triggerId}|type=${dropdownEffect}">${effectText}</a>` : `<br><span style="${styles.buttonDisabled} ${styles.spanInline}">${effectText}</span>`}
					`;
					break;
				case 'date':
					activationSection += `<a style="${styles.button}" href="!qt-trigger action=prompt|triggerid=${triggerId}|field=date|value=?{Set Date}">${triggerPathParts[2] === "null" ? `Set Date` : `${triggerPathParts[2]}` }</a>`;
					break;
				case 'reaction':
					if (H.createTriggerDropdown(triggerId) !== null) activationSection += `<a style="${styles.button}" href="!qt-trigger action=prompt|triggerid=${triggerId}|field=reaction|value=${H.createTriggerDropdown(triggerId)}">${triggerPathParts[2] === "null" || H.getTriggerName(triggerPathParts[2]) === null ? `Set Trigger` : `${H.getTriggerName(triggerPathParts[2])}` }</a>`;
					else activationSection += `<span style="${styles.buttonDisabled} ${styles.spanInline}">No Triggers Set</span>`;
					break;
			}
			effectsSection = `<table width=100%>`;
			if (trigger.effects && Object.keys(trigger.effects).length > 0) {
				Object.entries(trigger.effects).forEach(([effectId, effect]) => {
					const effectQuestName = effect.questid === null ? 'Choose Quest' : H.getQuestName(effect.questid) ;
					const effectType = effect.type === null ? 'Choose Field' : effect.type.charAt(0).toUpperCase() + effect.type.slice(1);
					const effectValue = effect.value === null ? 'Choose Value' : effect.type === "status" ? statusMapping[effect.type] : effect.value.charAt(0).toUpperCase() + effect.value.slice(1);
					const effectText = (() => {
						if (effect.type === null) return 'Select a Type';
						if (effect.value === null) return 'Choose';
						switch (effect.type) {
							case 'hidden':
								return effect.value.charAt(0).toUpperCase() + effect.value.slice(1)
							case 'disabled':
								return effect.value.charAt(0).toUpperCase() + effect.value.slice(1)
							case 'status':
								return statusMapping[effect.value] || 'Invalid Status';
							default:
								return 'Unknown Type';
						}
					})();
					effectsSection += `
						<tr>
							<td>&nbsp;</td>
							<td>Quest</td>
							<td><a style="${styles.button}" href="!qt-trigger action=modifyeffect|triggerid=${triggerId}|effectid=${effectId}|field=questid|value=${H.createQuestDropdown()}">${effectQuestName}</a></td>
						</tr>
						<tr>
							<td>&nbsp;</td>
							<td>Type</td>
							<td><a style="${styles.button}" href="!qt-trigger action=modifyeffect|triggerid=${triggerId}|effectid=${effectId}|field=type|value=${dropdownType}">${effectType}</a></td>
						</tr>
						<tr>
							<td>&nbsp;</td>
							<td>Value</td>
							<td>${effect.type !== null ? `<a style="${styles.button}" href="!qt-trigger action=modifyeffect|triggerid=${triggerId}|effectid=${effectId}|field=value|value=${H.effectDropdown(effect.type)}">${effectText}</a>` : `<span style="${styles.buttonDisabled} ${styles.spanInline}">${effectText}</span>`}</td>
						</tr>
						<tr>
							<td><a style="${styles.button}" href="!qt-trigger action=removeeffect|triggerid=${triggerId}|effectid=${effectId}">Delete</a></td>
							<td colspan=2>&nbsp;</td>
						</tr>
					`;
				});
			}
			effectsSection += `
				<tr><td colspan=3><br></td></tr>
				<tr><td colspan=3><a style="${styles.button} ${styles.floatRight}" href="!qt-trigger action=addeffect|triggerid=${triggerId}">Add Effect</a></td></tr>
			</table>`;
			let menu = `
				<div style="${styles.menu}">
					<h3 style="margin-bottom: 10px;">${trigger.name}</h3>
					<span style="${styles.floatRight}">
						<a style="${styles.filterlink}" href="!qt-trigger action=toggle|triggerid=${triggerId}|field=name|value=?{Change Name|${trigger.name}}">Edit Name</a>
					</span>
					<br><hr>
					<h4>Activation</h4>
					<table width=100%>
						<tr>
							<td>Active</td>
							<td><a style="${styles.button}" href="!qt-trigger action=toggle|triggerid=${triggerId}|field=enabled|value=${enabled ? 'false' : 'true'}">${enabled ? 'Enabled' : 'Disabled'}</a></td>
						<tr>
							<td>Trigger Type</td>
							<td><a style="${styles.button}" href="!qt-trigger action=changetype|triggerid=${triggerId}|newType=${typeDropdownString}">${capitalizedType}</a></td>
						</tr>
						<tr>
							<td>Triggering Event</td>
							<td>${activationSection}</td>
						</tr>
					</table>
					<br><hr>
					<h4>Effects</h4>
					${effectsSection}
					<br><hr>
						<span style="${styles.floatRight}">
							<a style="${styles.button}" href="!qt-menu action=triggers">Triggers</a>
							&nbsp;
							<a style="${styles.button}" href="!qt-menu action=allquests">Quests</a>
							&nbsp;
							<a style="${styles.button}" href="!qt-menu action=main">Main Menu</a>
						</span>
					</div>`;
			menu = menu.replace(/[\r\n]/g, '');
			Utils.sendGMMessage(menu);
		};
		return {
			generateGMMenu,
			showQuestDetails,
			showAllQuests,
			showAllRumours,
			showRumourDetails,
			showQuestDetails,
			showQuestRumourByStatus,
			showAllEvents,
			showEventDetails,
			manageRumourLocations,
			manageQuestGroups,
			adminMenu,
			adjustDate,
			buildWeather,
			manageFilter,
			showAllTriggers,
			showTrigger
		};
	})(); 
	const handleInput = (msg) => {
		if (msg.type !== 'api' || !playerIsGM(msg.playerid) || !msg.content.startsWith('!qt')) {
			return;
		}
		msg.content = Utils.inputAlias(msg.content);
		const args = msg.content.split(' ');
		const command = args.shift();
		const params = args.join(' ').split('|').reduce((acc, param) => {
			const [key, value] = param.split('=');
			if (key && value) {
				acc[key.trim()] = value.trim();
			}
			return acc;
		}, {});
		loadQuestTrackerData();
		if (errorCheck(47, 'exists', command,'command')) return;
		if (command === '!qt-quest') {
			const { action, field, current, old = '', new: newItem = '', id, confirmation, key } = params;
			if (errorCheck(48, 'exists', action,'action')) return;
			switch (action) {
				case 'removequest':
					if (!errorCheck(49, 'confirmation', confirmation, 'DELETE')) return;
					if (errorCheck(50, 'exists', id,'id')) return;
					if (errorCheck(51, 'exists', QUEST_TRACKER_globalQuestData[id],`QUEST_TRACKER_globalQuestData[${id}]`)) return;
					Quest.removeQuest(id);
					setTimeout(() => {
						Menu.showAllQuests();
					}, 500);
					break;
				case 'addquest':
					Quest.addQuest();
					setTimeout(() => {
						Menu.showAllQuests();
					}, 500);
					break;
				case 'linkhandout':
					if (errorCheck(160, 'exists', key,'key')) return;
					if (errorCheck(161, 'exists', current,'current')) return;
					Quest.linkHandout(current,key);
					setTimeout(() => {
						Menu.showQuestDetails(current);
					}, 500);
					break;
				case 'removehandout':
					if (errorCheck(162, 'exists', current,'current')) return;
					Quest.removeHandout(current);
					setTimeout(() => {
						Menu.showQuestDetails(current);
					}, 500);
					break;
				case 'add':
				case 'remove':
				case 'update':
					if (errorCheck(52, 'exists', field,'field')) return;
					if (errorCheck(53, 'exists', newItem,'newItem')) return;
					if (errorCheck(54, 'exists', QUEST_TRACKER_globalQuestData[current],`QUEST_TRACKER_globalQuestData[${current}]`)) return;
					switch (field) {
						case 'status':
							Quest.manageQuestObject({ action, field, current, old, newItem });
							break;
						case 'name':
							if (action === 'add') {
								Quest.manageQuestObject({ action, field, current, old, newItem });
							} else if (action === 'update') {
								Quest.manageQuestObject({ action: 'remove', field, current, old });
								Quest.manageQuestObject({ action: 'add', field, current, old, newItem });
							}
							break;
						case 'description':
							if (action === 'add') {
								Quest.manageQuestObject({ action, field, current, old, newItem });
							} else if (action === 'update') {
								Quest.manageQuestObject({ action: 'remove', field, current, old });
								Quest.manageQuestObject({ action: 'add', field, current, old, newItem });
							}
							break;
						case 'disabled':
							if (action === 'update') {
								Quest.manageQuestObject({ action, field, current });
								if (newItem === 'true') {
									const linkedQuests = Quest.findDirectlyLinkedQuests(current);
									linkedQuests.forEach(questId => {
										Quest.manageQuestObject({ action, field, current: questId });
									});
								}
							}
							break;
						case 'hidden':
							if (action === 'update') {
								Quest.manageQuestObject({ action, field, current });
							}
							break;
						case 'group':
							if (action === 'update') {
									Quest.manageQuestObject({ action: 'remove', field, current, old });
								if (newItem !== 'remove') {
									Quest.manageQuestObject({ action: 'add', field, current, old, newItem });
								}								
							}
							break;
						default:
							errorCheck(59, 'msg', null,`Unsupported action for field ( ${field} )`);
							break;
					}
					setTimeout(() => {
						Menu.showQuestDetails(current);
					}, 500);
					break;
				default:
					errorCheck(60, 'msg', null,`Unsupported action for action ( ${action} )`);
					break;
			}
		} else if (command === '!qt-questrelationship') {
			const { action, type, currentquest, quest, groupConditions, groupnum, oldquest, confirmation } = params;
			if (errorCheck(61, 'exists', action,'action')) return;
			if (errorCheck(62, 'exists', type,'type')) return;
			if (errorCheck(63, 'exists', currentquest,'currentquest')) return;
			if (errorCheck(64, 'exists', QUEST_TRACKER_globalQuestData[currentquest],`QUEST_TRACKER_globalQuestData[${currentquest}]`)) return;
			switch (action) {
				case 'add':
					if (errorCheck(65, 'exists', quest,'quest')) return;
					if (errorCheck(66, 'exists', QUEST_TRACKER_globalQuestData[quest],`QUEST_TRACKER_globalQuestData[${quest}]`)) return;
					switch (type) {
						case 'mutuallyexclusive':
							Quest.manageRelationship(currentquest, 'add', 'mutuallyExclusive', quest);
							Quest.manageRelationship(quest, 'add', 'mutuallyExclusive', currentquest);
							break;
						case 'single':
							Quest.manageRelationship(currentquest, 'add', 'single', quest);
							break;
						case 'group':
							if (errorCheck(67, 'exists', groupnum,'groupnum')) return;
							Quest.manageRelationship(currentquest, 'add', 'group', quest, groupnum);
							break;
						case 'addgroup':
							Quest.manageRelationship(currentquest, 'add', 'addgroup', quest);
						default:
							errorCheck(68, 'msg', null,`Unsupported action for type ( ${type} )`);
							break;
					}
					break;
				case 'remove':
					switch (type) {
						case 'mutuallyexclusive':
							if (errorCheck(69, 'exists', quest,'quest')) return;
							if (errorCheck(70, 'exists', QUEST_TRACKER_globalQuestData[quest],`QUEST_TRACKER_globalQuestData[${quest}]`)) return;
							if (errorCheck(71, 'exists', quest,'quest')) return;
							Quest.manageRelationship(currentquest, 'remove', 'mutuallyExclusive', quest);
							Quest.manageRelationship(quest, 'remove', 'mutuallyExclusive', currentquest);
							break;
						case 'single':
							if (errorCheck(72, 'exists', quest,'quest')) return;
							if (errorCheck(73, 'exists', QUEST_TRACKER_globalQuestData[quest],`QUEST_TRACKER_globalQuestData[${quest}]`)) return;
							if (errorCheck(74, 'exists', quest,'quest')) return;
							Quest.manageRelationship(currentquest, 'remove', 'single', quest);
							break;
						case 'group':
							if (errorCheck(75, 'exists', quest,'quest')) return;
							if (errorCheck(76, 'exists', QUEST_TRACKER_globalQuestData[quest],`QUEST_TRACKER_globalQuestData[${quest}]`)) return;
							if (errorCheck(77, 'exists', groupnum,'groupnum')) return;
							Quest.manageRelationship(currentquest, 'remove', 'group', quest, groupnum);
							break;
						case 'removegroup':
							if (errorCheck(78, 'exists', groupnum,'groupnum')) return;
							if (!errorCheck(79, 'confirmation', confirmation, 'DELETE')) return;
							Quest.manageRelationship(currentquest, 'remove', 'removegroup', null, groupnum);
							break;
						default:
							errorCheck(80, 'msg', null,`Unsupported action for type ( ${type} )`);
							break;
					}
					break;
				case 'update':
					switch (type) {
						case 'mutuallyexclusive':
							if (errorCheck(81, 'exists', quest,'quest')) return;
							if (errorCheck(82, 'exists', oldquest,'oldquest')) return;
							Quest.manageRelationship(currentquest, 'remove', 'mutuallyExclusive', oldquest);
							Quest.manageRelationship(oldquest, 'remove', 'mutuallyExclusive', currentquest);
							Quest.manageRelationship(currentquest, 'add', 'mutuallyExclusive', quest);
							Quest.manageRelationship(quest, 'add', 'mutuallyExclusive', currentquest);
							break;
						case 'single':
							if (errorCheck(83, 'exists', quest,'quest')) return;
							Quest.manageRelationship(currentquest, 'add', 'single', quest);
							Quest.manageRelationship(currentquest, 'remove', 'single', oldquest);
							break;
						case 'group':
							if (errorCheck(84, 'exists', quest,'quest')) return;
							if (errorCheck(85, 'exists', oldquest,'oldquest')) return;
							Quest.manageRelationship(currentquest, 'add', 'group', quest, groupnum);
							Quest.manageRelationship(currentquest, 'remove', 'group', oldquest, groupnum);
							break;
						case 'grouplogic':
							Quest.manageRelationship(currentquest, 'update', 'grouplogic', null, groupnum);
							break;
						case 'logic':
							Quest.manageRelationship(currentquest, 'update', 'logic', null);
							break;
						default:
							errorCheck(86, 'msg', null,`Unsupported action for type ( ${type} )`);
							break;
					}
					break;
				default:
					errorCheck(87, 'msg', null,`Unsupported action for action ( ${action} )`);
					break;
			}
			setTimeout(() => {
				Menu.showQuestDetails(currentquest);
			}, 500);
		} else if (command === '!qt-rumours') {
			const { action, questid, status, location, rumourid, new: newItem, number, locationId, old, confirmation } = params;
			if (errorCheck(88, 'exists', action, 'action')) return;
			switch (action) {
				case 'send':
					if (errorCheck(89, 'exists', number, 'number')) return;
					if (errorCheck(90, 'number', number, 'number')) return;
					if (errorCheck(91, 'exists', location, 'location')) return;
					Rumours.sendRumours(location, number);
					break;
				case 'add':
				case 'update':
				case 'remove':
					if (errorCheck(92, 'exists', location, 'location')) return;
					if (errorCheck(93, 'exists', status, 'status')) return;
					if (errorCheck(94, 'exists', questid, 'questid')) return;
					if (action === 'add') {
						if (errorCheck(95, 'exists', newItem, 'newItem')) return;
						Rumours.manageRumourObject({ action: 'add', questId: questid, newItem, status, location });
						setTimeout(() => {
							Menu.showRumourDetails(questid, status);
						}, 500);
					} else if (action === 'update') {
						if (errorCheck(96, 'exists', newItem, 'newItem')) return;
						if (errorCheck(97, 'exists', rumourid, 'rumourid')) return;
						if (errorCheck(98, 'exists', QUEST_TRACKER_globalRumours[questid], `QUEST_TRACKER_globalRumours[${questid}]`)) return;
						Rumours.manageRumourObject({ action: 'remove', questId: questid, newItem: '', status, location, rumourId: rumourid });
						Rumours.manageRumourObject({ action: 'add', questId: questid, newItem, status, location, rumourId: rumourid });
						setTimeout(() => {
							Menu.showRumourDetails(questid, status);
						}, 500);
					} else if (action === 'remove') {
						if (errorCheck(99, 'exists', QUEST_TRACKER_globalRumours[questid], `QUEST_TRACKER_globalRumours[${questid}]`)) return;
						if (errorCheck(100, 'exists', QUEST_TRACKER_globalRumours[questid][status], `QUEST_TRACKER_globalRumours[${questid}][${status}]`)) return;
						if (errorCheck(101, 'exists', Rumours.getLocationNameById(location), `getLocationNameById(${location})`)) return;
						if (errorCheck(102, 'exists', QUEST_TRACKER_globalRumours[questid][status][Rumours.getLocationNameById(location).toLowerCase()], `QUEST_TRACKER_globalRumours[${questid}][${status}][getLocationNameById(${location}).toLowerCase()]`)) return;
						Rumours.manageRumourObject({ action: 'remove', questId: questid, newItem: '', status, location, rumourId: rumourid });
						setTimeout(() => {
							Menu.showRumourDetails(questid, status);
						}, 500);
					}
					break;
				case 'addLocation':
					if (errorCheck(103, 'exists', newItem, 'newItem')) return;
					Rumours.manageRumourLocation('add', newItem, null);
					setTimeout(() => {
						Menu.manageRumourLocations();
					}, 500);
					break;
				case 'editLocationName':
					if (errorCheck(104, 'exists', newItem, 'newItem')) return;
					if (errorCheck(105, 'exists', locationId, 'locationId')) return;
					Rumours.manageRumourLocation('update', newItem, locationId);
					setTimeout(() => {
						Menu.manageRumourLocations();
					}, 500);
					break;
				case 'removeLocation':
					if (errorCheck(106, 'exists', locationId, 'locationId')) return;
					if (!errorCheck(107, 'confirmation', confirmation, 'DELETE')) return;
					Rumours.manageRumourLocation('remove', null, locationId);
					setTimeout(() => {
						Menu.manageRumourLocations();
					}, 500);
					break;
				default:
					errorCheck(108, 'msg', null,`Unsupported action for type ( ${action} )`);
					break;
			}
		} else if (command === '!qt-questgroup') {
			const { action, groupid, new: newItem, confirmation } = params;
			if (!action) return;
			switch (action) {
				case 'add':	
					if (errorCheck(109, 'exists', newItem,'newItem')) return;
					Quest.manageGroups('add', newItem, null);
					setTimeout(() => {
						Menu.manageQuestGroups();
					}, 500);
					break;
				case 'update':
					if (errorCheck(110, 'exists', newItem,'newItem')) return;
					if (errorCheck(111, 'exists', groupid,'groupid')) return;
					Quest.manageGroups('update', newItem, groupid);
					setTimeout(() => {
						Menu.manageQuestGroups();
					}, 500);
					break;
				case 'remove':
					if (errorCheck(112, 'exists', groupid,'groupid')) return;
					if (!errorCheck(113, 'confirmation', confirmation, 'CONFIRM')) return;
					Quest.manageGroups('remove', null, groupid);
					setTimeout(() => {
						Menu.manageQuestGroups();
					}, 500);
					break;
				default:
					errorCheck(114, 'msg', null,`Unsupported action for type ( ${action} )`);
					break;
			}
		} else if (command === '!qt-menu') {
			const { action, id, questId, locationId, status, eventid, menu} = params;
			if (!action || action === 'main') {
				Menu.generateGMMenu();
			} else if (action === 'config') {
				Menu.adminMenu();
			} else if (action === 'quest') {
				if (errorCheck(115, 'exists', id,'id')) return;
				Menu.showQuestDetails(id);
			} else if (action === 'allquests') {
				Menu.showAllQuests();
			} else if (action === 'allrumours') {
				Menu.showAllRumours();
			} else if (action === 'showQuestRumours') {
				if (errorCheck(116, 'exists', questId,'questId')) return;
				Menu.showQuestRumourByStatus(questId);
			} else if (action === 'showRumourDetails') {
				if (errorCheck(117, 'exists', questId,'questId')) return;
				if (errorCheck(118, 'exists', status,'status')) return;
				Menu.showRumourDetails(questId, status);
			} else if (action === 'manageRumourLocations') {
				Menu.manageRumourLocations();
			} else if (action === 'manageQuestGroups') {
				Menu.manageQuestGroups();
			} else if (action === 'allevents') {
				Menu.showAllEvents();
			} else if (action === 'showevent') {
				if (errorCheck(119, 'exists', eventid,'eventid')) return;
				Menu.showEventDetails(eventid);
			} else if (action === 'adjustdate') {
				Menu.adjustDate();
			} else if (action === 'triggers') {
				Menu.showAllTriggers();
			} else if (action === 'showTriggerDetails') {
				Menu.showTrigger(id);
			} else errorCheck(120, 'msg', null,`Unknown menu action: ${action}`);	
		} else if (command === '!qt-filter') {
			const { action, key, value, sortOrder, menu } = params;
			const menuActions = {
				quest: () => Menu.showAllQuests(),
				rumour: () => Menu.showAllRumours()
			};
			switch (action) {
				case 'modify':
					if (errorCheck(165, 'exists', key, 'key')) return;
					if (key === 'groupBy') {
						const validGroupByOptions = ['group', 'visibility', 'handout', 'disabled', null];
						if (!validGroupByOptions.includes(value)) {
							errorCheck(167, 'msg', null, `Invalid value for groupBy: ${value}`);
							return;
						}
					}
					Menu.manageFilter({ action, key, value, menu });
					setTimeout(() => {
						menuActions[menu]();
					}, 500);
					break;
				case 'add':
				case 'remove':
					if (errorCheck(173, 'exists', key, 'key')) return;
					if (key !== 'group') {
						errorCheck(174, 'msg', null, `Invalid key for action: ${key}`);
						return;
					}
					if (errorCheck(175, 'exists', value, 'value')) return;
					Menu.manageFilter({ action, key, value, menu });
					setTimeout(() => {
						menuActions[menu]();
					}, 500);
					break;
				case 'clear':
				case 'resetGrouping':
					Menu.manageFilter({ action, key, value, menu });
					setTimeout(() => {
						menuActions[menu]();
					}, 500);
					break;
				case 'togglevisibility':
					if (errorCheck(170, 'exists', value, 'value')) return;
					Utils.toggleFilterVisibility(value);
					setTimeout(() => {
						menuActions[menu]();
					}, 500);
					break;
				default:
					errorCheck(172, 'msg', null, `Unknown menu action: ${action}`);
					break;
			}
		} else if (command === '!qt-trigger') {
			const { action, triggerid, effectid = null, field, value, newType, type, effect, questid } = params;
			switch (action) {
				case 'add':
					Triggers.addTrigger();
					setTimeout(() => {
						Menu.showAllTriggers();
					}, 500);
					break;
				case 'edit':
					if (errorCheck(183, 'exists', triggerid, 'triggerid')) return;
					if (errorCheck(184, 'exists', field, 'field')) return;
					if (!['enabled', 'action', 'effects'].includes(field)) {
						errorCheck(185, 'msg', null, `Invalid field: ${field}. Valid fields are 'enabled', 'action', 'effects'.`);
						return;
					}
					switch (field) {
						case 'enabled':
						case 'name':
							Triggers.toggleTrigger(field, triggerid, value);
							break;
						case 'action':
							Triggers.manageTriggerAction(triggerid, { key: field, value });
							break;
						case 'effects':
							if (!effectid && ['remove', 'edit'].includes(value?.key)) {
								errorCheck(186, 'msg', null, `Effect ID is required for '${value?.key}' action.`);
								return;
							}
							Triggers.manageTriggerEffects(triggerid, { effectid, key: value.key, value: value.value });
							break;
						default:
							errorCheck(207, 'msg', null, `Invalid field: ${field}`);
							return;
					}
					setTimeout(() => {
						Menu.showTrigger(triggerid);
					}, 500);
					break;
				case 'changetype':
					if (errorCheck(213, 'exists', triggerid, 'triggerid')) return;
					if (!['quest', 'date', 'reaction'].includes(newType)) {
						errorCheck(206, 'msg', null, `Invalid type: ${newType}. Valid types are 'quest', 'date', or 'reaction'.`);
						return;
					}
					Triggers.initializeTrigger(newType, triggerid);
					setTimeout(() => {
						Menu.showTrigger(triggerid);
					}, 500);
					break;
				case 'delete':
					if (errorCheck(210, 'exists', triggerid, 'triggerid')) return;
					Triggers.deleteTrigger(triggerid);
					setTimeout(() => {
						Menu.showAllTriggers();
					}, 500);
					break;
				case 'toggle':
					if (errorCheck(187, 'exists', triggerid, 'triggerid')) return;
					if (errorCheck(208, 'exists', field, 'field')) return;
					if (errorCheck(209, 'exists', value, 'value')) return;
					if (typeof value !== 'string' || value.trim() === '') {
						errorCheck(211, 'msg', null, `Invalid name value: ${value}. Must be a non-empty string.`);
						return;
					}
					if (field !== 'enabled' && field !== 'name') {
						errorCheck(212, 'msg', null, `Invalid field: ${field}. Use 'enabled' or 'name'.`);
						return;
					}
					Triggers.toggleTrigger(field, triggerid, value);
					setTimeout(() => {
						Menu.showTrigger(triggerid);
					}, 500);
					break;
				case 'prompt':
					if (errorCheck(213, 'exists', triggerid, 'triggerid')) return;
					if (errorCheck(214, 'exists', field, 'field')) return;
					if (errorCheck(215, 'exists', value, 'value')) return;
					if (field === "date") if (errorCheck(216, 'date', value)) return;
					if (!["quest", "date", "reaction"].includes(field)) {
						errorCheck(216, 'msg', null, `Invalid field: ${field}. Use 'quest', 'date', or 'reaction'.`);
						return;
					}
					Triggers.managePrompt(field, triggerid, value);
					setTimeout(() => {
						Menu.showTrigger(triggerid);
					}, 500);
					break;
				case 'effect':
				case 'action': {
					if (field === 'action' && !["status", "disabled", "hidden"].includes(type)) {
						errorCheck(217, "msg", null, `Invalid action type: ${type}. Use 'status', 'disabled', or 'hidden'.`);
						return;
					}
					Triggers.manageActionEffect(action, triggerid, type);
					setTimeout(() => {
						Menu.showTrigger(triggerid);
					}, 500);
					break;
				}
				case 'addeffect':
					if (errorCheck(218, 'exists', triggerid, 'triggerid')) return;
					Triggers.manageEffect(triggerid, null, 'add' , null, null)
					setTimeout(() => {
						Menu.showTrigger(triggerid);
					}, 500);
					break;
				case 'removeeffect':
					if (errorCheck(219, 'exists', triggerid, 'triggerid')) return;
					if (errorCheck(220, 'exists', effectid, 'effectid')) return;
					Triggers.manageEffect(triggerid, effectid, 'delete' , null, null)
					setTimeout(() => {
						Menu.showTrigger(triggerid);
					}, 500);
					break;
				case 'modifyeffect':
					if (errorCheck(221, 'exists', triggerid, 'triggerid')) return;
					if (errorCheck(222, 'exists', effectid, 'effectid')) return;
					if (errorCheck(223, 'exists', field, 'field')) return;
					if (errorCheck(224, 'exists', value, 'value')) return;
					Triggers.manageEffect(triggerid, effectid, 'modify' , field, value)
					setTimeout(() => {
						Menu.showTrigger(triggerid);
					}, 500);
					break;
				default:
					errorCheck(189, 'msg', null, `Unknown action: ${action}`);
					break;
			}	
		} else if (command === '!qt-date') {
			const { action, field, current, old, new: newItem, unit = 'day', date, eventid, menu = false, home = false} = params;
			if (errorCheck(121, 'exists', action,'action')) return;
			switch (action) {
				case 'set':
					if (errorCheck(122, 'exists', newItem)) return;
					if (errorCheck(145, 'date', newItem)) return;
					Calendar.modifyDate({type: 'set', newDate: newItem});
					if (menu) {
						setTimeout(() => {
							Menu.adjustDate();
						}, 500);
					}
					break;
				case 'addevent':
					Calendar.addEvent();
					setTimeout(() => {
						Menu.showAllEvents();
					}, 500);
					break;
				case 'removeevent':
					if (errorCheck(123, 'exists', eventid, 'eventid')) return;
					Calendar.removeEvent(eventid);
					setTimeout(() => {
						Menu.showAllEvents();
					}, 500);
					break;
				case 'update':
					if (field === 'date') {
						if (errorCheck(125, 'date', newItem)) return;
					}
					Calendar.manageEventObject({ action, field, current, old, newItem, date});
					setTimeout(() => {
						Menu.showEventDetails(current);
					}, 500);
					break;
				case 'setcalender':
					if (errorCheck(126, 'exists', newItem, 'newItem')) return;
					Calendar.setCalender(newItem);
					setTimeout(() => {
						Menu.adminMenu();
					}, 500);
					break;
				case 'setclimate':
					if (errorCheck(127, 'exists', newItem, 'newItem')) return;
					Calendar.setClimate(newItem);
					setTimeout(() => {
						Menu.adminMenu();
					}, 500);
					break;
				case 'adjustlocation':
					if (errorCheck(128, 'exists', newItem, 'newItem')) return;
					Calendar.adjustLocation(newItem);
					if (menu) {
						setTimeout(() => {
							Menu.adjustDate();
						}, 500);
					}
					else if (home) {
						setTimeout(() => {
							Menu.generateGMMenu();
						}, 500);
					}
					break;
				case 'settrend':
					if (errorCheck(129, 'exists', newItem, 'newItem')) return;
					if (errorCheck(130, 'number', newItem, 'newItem')) return;
					const num = Math.trunc(newItem);
					if (num <= 0) return;
					Calendar.setWeatherTrend(field, num);
					setTimeout(() => {
						Menu.adminMenu();
					}, 500);
					break;
				case 'forcetrend':
					if (errorCheck(131, 'exists', field, 'field')) return;
					Calendar.forceWeatherTrend(field);
					setTimeout(() => {
						Menu.adminMenu();
					}, 500);
					break;
				case 'modify':
					if (errorCheck(132, 'exists', newItem, 'newItem')) return;
					if (errorCheck(133, 'number', newItem, 'newItem')) return;
					if (errorCheck(134, 'exists', unit, 'unit')) return;
					const number = Math.trunc(newItem);
					if (QUEST_TRACKER_WEATHER) {
						switch (unit.toLowerCase()) {
							case "years":
								if (number > 1) number = 1;
								break;
							case "days":
								if (number > 500) number = 500;
								break;
							case "weeks":
								if (number > 60) number = 60;
								break;
							case "months":
								if (number > 15) number = 15;
								break;
							default:
								break;
						}
					}
					Calendar.modifyDate({type: unit, amount: number});
					if (menu) {
						setTimeout(() => {
							Menu.adjustDate();
						}, 500);
					}
					else if (home) {
						setTimeout(() => {
							Menu.generateGMMenu();
						}, 500);
					}
					else {
						setTimeout(() => {
							Menu.buildWeather();
						}, 500);
					}
					break;
				default:
					errorCheck(136, 'msg', null,`Unknown date command: ${params.action}`);
					break;
			}
		} else if (command === '!qt-import') {
			Import.fullImportProcess();
		} else if (command === '!qt-config') {
			const { action, value, confirmation, type } = params;
			if (action === 'togglereadableJSON'){
				if (errorCheck(137, 'exists', value, 'value')) return;
				Utils.togglereadableJSON(value);
				setTimeout(() => {
					Menu.adminMenu();
				}, 500);
			} else if (action === 'toggleWeather'){
				if (errorCheck(138, 'exists', value, 'value')) return;
				Utils.toggleWeather(value);
				setTimeout(() => {
					Menu.adminMenu();
				}, 500);
			} else if (action === 'togglejumpgate'){
				if (errorCheck(139, 'exists', value, 'value')) return;
				Utils.toggleJumpGate(value);
				setTimeout(() => {
					Menu.adminMenu();
				}, 500);
			} else if (action === 'toggleVerboseErrors'){
				if (errorCheck(140, 'exists', value, 'value')) return;
				Utils.toggleVerboseError(value);
				setTimeout(() => {
					Menu.adminMenu();
				}, 500);
			} else if (action === 'toggleimperial'){
				if (errorCheck(150, 'exists', value, 'value')) return;
				if (errorCheck(151, 'exists', type, 'type')) return;
				Utils.toggleImperial(type,value);
				setTimeout(() => {
					Menu.adminMenu();
				}, 500);
			} else if (action === 'reset') {
				if (!errorCheck(141, 'confirmation', confirmation, 'CONFIRM')) return;
				state.QUEST_TRACKER = {};
				initializeQuestTrackerState(true);
				loadQuestTrackerData();
				QUEST_TRACKER_HISTORICAL_WEATHER = {};
				Utils.updateHandoutField("weather");
				saveQuestTrackerData();
				setTimeout(() => {
					Menu.adminMenu();
				}, 500);
			}
		} else if (command === '!qt-questtree') {
			const { action, value } = params;
			if (errorCheck(142, 'exists', action, 'action')) return;
			switch (action) {
				case 'build':
					QuestPageBuilder.buildQuestTreeOnPage();
					break;
				default:
					errorCheck(143, 'msg', null,`Unknown action: ${action}`);
					break;
			}
		} 
		else {
			errorCheck(144, 'msg', null,`Unknown command: ${command}`);
		}
	};
	const errorCheck = (id = 0, type = null, data = null, check = null) => {
		switch (type) {
			case 'confirmation':
				if (data === check) return true;
				else {
					switch (check) {
						case 'CONFIRM':
							Utils.sendGMMessage(`Error ${id}: Confirmation required to reset all data. Please type CONFIRM when prompted.`);
							break;
						case 'DELETE':
							Utils.sendGMMessage(`Error ${id}: Confirmation required to delete location. Please type DELETE to confirm.`);
							break;
					}
				}
				break;
			case 'date':
				if (!/^\d+-\d+-\d+$/.test(data)) {
					Utils.sendGMMessage(`Error ${id}: Invalid date format: ${data}. Must be digits separated by dashes (e.g., YYYY-MM-DD or similar).`);
					return true
				}
				break;
			case 'exists':
				if (data === null) {
					if (QUEST_TRACKER_verboseErrorLogging) Utils.sendGMMessage(`Error ${id}: The variable ${check} does not exist.`);
					return true;
				}
				break;
			case 'msg':
				Utils.sendGMMessage(`Error ${id}: ${check}`);
				break;
			case 'number':
				if (isNaN(data)) {
					if (QUEST_TRACKER_verboseErrorLogging) Utils.sendGMMessage(`Error ${id}: ${check} is not a number.`);
					return true;
				}
				break;
		}
		return false;
	};
	return {
		CALENDARS,
		WEATHER,
		loadQuestTrackerData,
		saveQuestTrackerData,
		handleInput,
		Import,
		Calendar,
		Quest,
		Triggers,
		Rumours,
		QuestPageBuilder,
		Menu,
		errorCheck,
		initializeQuestTrackerState,
		getCalendarAndWeatherData
	};
})();
on('ready', function () {
	'use strict';
	const { CALENDARS, WEATHER } = QuestTracker.getCalendarAndWeatherData();
	if (!CALENDARS || !WEATHER) return;
	QuestTracker.initializeQuestTrackerState();
	QuestTracker.loadQuestTrackerData();
	on('chat:message', function(msg) {
		QuestTracker.handleInput(msg);
	});
});