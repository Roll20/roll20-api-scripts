/*
Calendar for Eberron, Faerun, Greyhawk, Modern and Tal'Dorei Settings
Original by Kirsty (https://app.roll20.net/users/1165285/kirsty)
Rewritten by Julexar (https://app.roll20.net/users/9989180/julexar)

GM Commands:
!mwcal
Displays the Calendar Menu
    --world --{Eberron|Faerun|Greyhawk|Modern|Tal'Dorei}
    Switches the calendar to the selected world
    --setday --{Insert Number}
    Sets the current day to the number you input
    --setmonth --{Insert Number}
    Sets the current month to the number you input
    --setyear --{Insert Number}
    Sets the current year to the number you input
    --settime --hour --{Insert Number} --minute --{Insert Number}
    Sets the current time to the numbers you input
    --advance --{Insert Number} --{short rest, long rest, hour, minute, day, week, month, year}
    Advances the calendar by the number/type you input
    --weather
    Randomises the Weather
        --toggle
        Toggles the Weather Display
    --moon
    Resets the Moon Phase
        --phase --{Insert Name/Number} (--phase2 --{Insert Name/Number})
        Sets the Moon Phase to the name/number you input (second phase for Eberron)
        --toggle
        Toggles the Moon Display
    --show
    Displays the Calendar to the Players
    --reset
    Resets the Calendar to the Default Values

!month --{Insert Name/Number} --{Insert Name}
Renames a Month to the Name you input

!alarm
Displays the Alarm Menu
    --{Insert Number}
    Displays the Alarm Menu for the Alarm you input
        --settitle --{Insert Title}
        Sets the Title of the Alarm
        --setdate --{Insert Date}
        Sets the Date of the Alarm (Format: DD.MM.YYYY)
        --settime --{Insert Time}
        Sets the Time of the Alarm (Format: HH:MM [24h])
        --setmessage --{Insert Message}
        Sets the Message of the Alarm
    --new
    Opens the Alarm Creator
        --title --{Insert Title}
        Sets the Title of the Alarm
        --date --{Insert Date}
        Sets the Date of the Alarm (Format: DD.MM.YYYY)
        --time --{Insert Time}
        Sets the Time of the Alarm (Format: HH:MM [24h])
        --message --{Insert Message}
    --delete --{Insert Number}
    Deletes the Alarm you input
    --reset
    Resets the Alarms to the Default Values

Player Commands:
!mwcal
Displays the Calendar to the Players
*/

const styles = {
	divMenu: 'style="width: 200px; border: 1px solid black; background-color: #ffffff; padding: 5px;"',
	divButton: 'style="text-align:center;"',
	buttonSmall: 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 75px;',
	buttonMedium: 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;',
	buttonLarge: 'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;',
	table: 'style="text-align:center; font-size: 12px; width: 100%; border-style: 3px solid #cccccc;"',
	arrow: 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"',
	header: 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"',
	sub: 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"',
	tdReg: 'style="padding: 2px; padding-left: 5px; border: none;"',
	trTab: 'style="text-align: left; border-bottom: 1px solid #cccccc;"',
	tdTab: 'style="text-align: center; border-right: 1px solid #cccccc;"',
	span: 'style="display: inline; width: 10px; height: 10px; padding: 1px; border: 1px solid black; background-color: white;"',
};

const moonPhases = ['Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent', 'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous'];

const monthNames = [
	['Hammer', 'Alturiak', 'Ches', 'Tarsakh', 'Mirtul', 'Kythorn', 'Flamerule', 'Eleasis', 'Eleint', 'Marpenoth', 'Uktar', 'Nightal'],
	['Zarantyr', 'Olarune', 'Therendor', 'Eyre', 'Dravago', 'Nymm', 'Lharvion', 'Barrakas', 'Rhaan', 'Sypheros', 'Aryth', 'Vult'],
	['Needfest', 'Fireseek', 'Readying', 'Coldeven', 'Growfest', 'Planting', 'Flocktime', 'Wealsun', 'Richfest', 'Reaping', 'Goodmonth', 'Harvester', 'Brewfest', 'Patchwall', 'Ready\'reat', 'Sunsebb'],
	['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	['Horisal', 'Misuthar', 'Dualahei', 'Thunsheer', 'Unndilar', 'Brussendar', 'Sydenstar', 'Fessuran', "Quen'pillar", 'Cuersaar', 'Duscar'],
];

class MultiWorldCalendar {
    constructor() {
        this.style = styles;
        this.world = 0;
        this.moons = moonPhases;
        this.months = monthNames;
        this.worlds = ['Faerun', 'Eberron', 'Greyhawk', 'Modern', "Tal'Dorei"];
    }

	handleInput(msg) {
		const args = msg.content.split(/\s+--/);

		if (msg.type !== 'api') return;

		if (playerIsGM(msg.playerid)) {
			switch (args[0]) {
				case '!mwcal':
					switch (args[1]) {
						default:
							chkAlarms();
							calendarMenu();
						break;
						case 'setday':
							const day = parseInt(args[2]);

							if (isNaN(day)) return sendChat('Multi-World Calendar', '/w gm Syntax Error! Please input a valid number for the day.');

							setDay(day);
							chkAlarms();
							calendarMenu();
						break;
						case 'setmonth':
							const month = args[2];

							if (!monthNames[mwcal.world].includes(month)) return sendChat('Multi-World Calendar', '/w gm Syntax Error! Please input a valid month.');

							setMonth(month);
							chkAlarms();
							calendarMenu();
						break;
						case 'setyear':
							const year = parseInt(args[2]);

							if (isNaN(year)) return sendChat('Multi-World Calendar', '/w gm Syntax Error! Please input a valid number for the year.');

							setYear(year);
							chkAlarms();
							calendarMenu();
						break;
						case 'settime':
							const hour = parseInt(args[3]);
							const minute = parseInt(args[5]);

							if (isNaN(hour) || isNaN(minute)) return sendChat('Multi-World Calendar', '/w gm Syntax Error! Please input a valid number for the time.');

							setHour(hour);
							setMinute(minute);
							chkAlarms();
							calendarMenu();
						break;
						case 'advance':
							const amount = parseInt(args[2]);
							const type = args[3];

							if (isNaN(amount)) return sendChat('Multi-World Calendar', '/w gm Syntax Error! Please input a valid number for the amount.');
							if (!['Short Rest', 'Long Rest', 'Hour', 'Minute', 'Day', 'Week', 'Month', 'Year'].includes(type)) return sendChat('Multi-World Calendar', '/w gm Syntax Error! Please input a valid type.');

							advance(amount, type);
							chkAlarms();
							calendarMenu();
						break;
						case 'weather':
							if (args[2] === 'toggle') {
								toggleWeather()
								calendarMenu();
							} else {
								randomizeWeather();
								calendarMenu();
							}
						break;
						case 'moon':
							if (args[2] === 'toggle') {
								toggleMoon();
								calendarMenu();
							} else {
								const phase = args[2];
								const phase2 = args[4];

								updMoon(phase, phase2);
								calendarMenu();
							}
						break;
						case 'world':
							if (!args[2] || !mwcal.worlds.find(w => w.toLowerCase() === args[2].toLowerCase())) return sendChat('Multi-World Calendar', '/w gm Invalid World! Please input a valid world.');

							setWorld(args[2]);
							chkAlarms();
							calendarMenu();
						break;
						case 'show':
							showCalendar();
						break;
						case 'reset':
							setMWCalDefaults();
							calendarMenu();
						break;
					}
				break;
				case '!month':
					setMonthName(args[1], args[2]);
				break;
				case '!alarm':
					switch (args[1]) {
						case undefined:
							alarmMenu();
						break;
						default:
							const num = parseInt(args[1]);

							if (isNaN(num)) return sendChat('Multi-World Calendar', 'Please input a valid number for the alarm.');

							switch (args[2]) {
								case 'settitle':
									setTitle(num, args[3]);
								break;
								case 'setdate':
									setDate(num, args[3]);
								break;
								case 'settime':
									setTime(num, args[3]);
								break;
								case 'setmessage':
									setMessage(num, args[3]);
								break;
							}

							alarmMenu(num);
						break;
						case 'new':
						    if (args[3] === '' || args[3] === ' ') return sendChat('Multi-World Calendar', '/w gm Invalid Syntax! The name of a created Alarm may not be empty!');
						    let date = args[5].split('.');
						    if (!date || isNaN(parseInt(date[0])) || isNaN(parseInt(date[1])) || isNaN(parseInt(date[0]))) return sendChat('Multi-World Calendar', '/w gm Invalid Syntax! The Date must be formatted correctly and must contain numbers!');
						    let time = args[7].split(':');
						    if (!time || isNaN(parseInt(time[0])) || isNaN(parseInt(time[1]))) return sendChat('Multi-World Calendar', '/w gm Invalid Syntax! The Time must be formatted correctly and must contain numbers!');
						    
							createAlarm(args[3], args[5], args[7], args[9]);
						break;
						case 'delete':
							deleteAlarm(args[2]);
							alarmMenu();
						break;
						case 'reset':
							setAlarmDefaults();
							sendChat('Multi-World Calendar', '/w gm Successfully reset all existing Alarms!');
							alarmMenu();
						break;
					}
				break;
			}
		} else {
			if (args[0] === '!mwcal') {
				showCalendar();
			}
		}
	}

	checkInstall() {
		if (!state.check) {
			state.check = true;
			setMWCalDefaults();
			setAlarmDefaults();
		}

		if (!state.mwcal) {
			setMWCalDefaults();
		}

		if (!state.alarms) {
			setAlarmDefaults();
		}
	}

	registerEventHandlers() {
		on('chat:message', this.handleInput);
		log('Multi-World Calendar - Registered Event Handlers!');
	}
}

const mwcal = new MultiWorldCalendar();

function setMWCalDefaults() {
	state.mwcal = [
		{
			name: 'Faerun',
			ord: 1,
			year: 1486,
			day: 1,
			month: 1,
			hour: 1,
			minute: 0,
			weather: 'It is a cool but sunny day',
			moon: 'Full Moon',
			mtype: true,
			wtype: true,
		},
		{
			name: 'Eberron',
			ord: 1,
			year: 998,
			day: 1,
			month: 1,
			hour: 1,
			minute: 0,
			weather: 'It is a cool but sunny day',
			moon: 'Luna: Full, Celene: Full',
			mtype: true,
			wtype: true,
		},
		{
			name: 'Greyhawk',
			ord: 1,
			year: 591,
			day: 1,
			month: 1,
			hour: 1,
			minute: 0,
			weather: 'It is a cool but sunny day',
			moon: 'Full Moon',
			mtype: true,
			wtype: true,
		},
		{
			name: 'Modern',
			ord: 1,
			year: 2020,
			day: 1,
			month: 1,
			hour: 1,
			minute: 0,
			weather: 'It is a cool but sunny day',
			moon: 'Full Moon',
			mtype: true,
			wtype: true,
		},
		{
			name: "Tal'Dorei",
			ord: 1,
			year: 812,
			day: 1,
			month: 1,
			hour: 1,
			minute: 0,
			weather: 'It is a cool but sunny day',
			moon: 'Full Moon',
			mtype: true,
			wtype: true,
		},
	];

	log('Multi-World Calendar - Successfully registered Calendar Defaults!');
}

function setAlarmDefaults() {
	state.alarms = [
		[],
		[],
		[],
		[],
		[]
	];

	log('Multi-World Calendar - Successfully registered Alarm Defaults!');
}

function updOrdinal() {
	switch (mwcal.world) {
		case 0:
			state.mwcal[0].ord = 30 * (state.mwcal[0].month - 1) + state.mwcal[0].day;
		break;
		case 1:
			state.mwcal[1].ord = 28 * (state.mwcal[1].month - 1) + state.mwcal[1].day;
		break;
		case 2:
			const grhwkDays = [7, 28, 28, 28, 7, 28, 28, 28, 7, 28, 28, 28, 7, 28, 28, 28];
			state.mwcal[2].ord = grhwkDays.slice(0, state.mwcal[2].month - 1).reduce((a, b) => a + b, 0) + state.mwcal[2].day;
		break;
		case 3:
			const modernDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			state.mwcal[3].ord = modernDays.slice(0, state.mwcal[3].month - 1).reduce((a, b) => a + b, 0) + state.mwcal[3].day;
		break;
		case 4:
			const talDays = [29, 30, 30, 31, 28, 31, 32, 29, 27, 29, 32];
			state.mwcal[4].ord = talDays.slice(0, state.mwcal[4].month - 1).reduce((a, b) => a + b, 0) + state.mwcal[4].day;
		break;
	}
}

function setWorld(world) {
	if (!(mwcal.worlds.find(w => w.toLowerCase() === world.toLowerCase()))) return sendChat('Multi-World Calendar', 'Invalid World. Please make sure to either use the correct Name!');

	mwcal.world = mwcal.worlds.findIndex(w => w.toLowerCase() === world.toLowerCase());
}

function getSuffix() {
	const day = state.mwcal[mwcal.world].day;

	if (day >= 11 && day <= 13) return 'th';

	switch (day % 10) {
		case 1: return 'st';
		case 2: return 'nd';
		case 3: return 'rd';
		default: return 'th';
	}
}

function updDate() {
	const world = mwcal.world;
	const ordinal = state.mwcal[world].ord;
	let date, month;

	switch (world) {
		case 0:
			if (Math.ceil(ordinal / 30) <= 1) {
				month = monthNames[world][0];
				date = ordinal;
			} else {
				month = monthNames[world][Math.ceil(ordinal / 30) - 1];
				date = ordinal - (Math.ceil(ordinal / 30) - 1) * 30;
			}
		break;
		case 1:
			if (Math.ceil(ordinal / 28) <= 1) {
				month = monthNames[world][0];
				date = ordinal;
			} else {
				month = monthNames[world][Math.ceil(ordinal / 28) - 1];
				date = ordinal - (Math.ceil(ordinal / 28) - 1) * 28;
			}
		break;
		case 2:
			const grhwkDays = [7, 28, 28, 28, 7, 28, 28, 28, 7, 28, 28, 28, 7, 28, 28, 28];

			if (ordinal <= 7) {
				month = monthNames[world][0];
				date = ordinal;
			} else {
			    let count = ordinal;
				for (let i=0; i<grhwkDays.length; i++) {
				    count -= grhwkDays[i];
				    
				    if (count <= 0) {
				        month = monthNames[world][i];
				        break;
				    }
				}
				
				date = ordinal - grhwkDays.slice(0, monthNames[world].findIndex(m => m === month)).reduce((a, b) => a + b, 0);
			}
		break;
		case 3:
			const modernDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			
			if (ordinal <= 31) {
				month = monthNames[world][0];
				date = ordinal;
			} else {
				let count = ordinal;
				for (let i=0; i<modernDays.length; i++) {
				    count -= modernDays[i];
				    
				    if (count <= 0) {
				        month = monthNames[world][i];
				        break;
				    }
				}
				
				date = ordinal - modernDays.slice(0, monthNames[world].findIndex(m => m === month)).reduce((a, b) => a + b, 0);
			}
		break;
		case 4:
			const talDays = [29, 30, 30, 31, 28, 31, 32, 29, 27, 29, 32];
			
			if (ordinal <= 29) {
				month = monthNames[world][0];
				date = ordinal;
			} else {
				let count = ordinal;
				for (let i=0; i<talDays.length; i++) {
				    count -= talDays[i];
				    
				    if (count <= 0) {
				        month = monthNames[world][i];
				        break;
				    }
				}
				
				date = ordinal - talDays.slice(0, monthNames[world].findIndex(m => m === month)).reduce((a, b) => a + b, 0);
			}
		break;
	}

	state.mwcal[world].month = monthNames[world].indexOf(month) + 1;
	state.mwcal[world].day = date;
	updOrdinal();
}

function setDay(day) {
	state.mwcal[mwcal.world].day = day;
	updOrdinal();
}

function getMonth() {
	const month = state.mwcal[mwcal.world].month;
	return mwcal.months[mwcal.world][month-1];
}

function setMonth(month) {
	const months = mwcal.months[mwcal.world];
	state.mwcal[mwcal.world].month = months.indexOf(month) + 1;
	updOrdinal();
}

function setMonthName(month, name) {
	const monnum = mwcal.months[mwcal.world].indexOf(month)
	mwcal.months[mwcal.world][monnum] = name;
	monthNames = mwcal.months;
}

function setYear(year) {
	state.mwcal[mwcal.world].year = year;
}

function getHour() {
	if (state.mwcal[mwcal.world].hour < 10) return `0${state.mwcal[mwcal.world].hour}`;
	return state.mwcal[mwcal.world].hour;
}

function setHour(hour) {
	state.mwcal[mwcal.world].hour = hour;
}

function getMinute() {
	if (state.mwcal[mwcal.world].minute < 10) return `0${state.mwcal[mwcal.world].minute}`;
	return state.mwcal[mwcal.world].minute;
}

function setMinute(minute) {
	state.mwcal[mwcal.world].minute = minute;
}

function updMoon(phase, phase2) {
	if (!phase) {
		const ordinal = state.mwcal[mwcal.world].ord;
		const year = state.mwcal[mwcal.world].year;
		const remainder = year / 4 - Math.floor(year / 4);

		let moonArray = [];

		switch (mwcal.world) {
			default:
				switch (remainder) {
					default:
						moonArray = getMoonArray(1);
					break;
					case 0.25:
						moonArray = getMoonArray(2);
					break;
					case 0.5:
						moonArray = getMoonArray(3);
					break;
					case 0.75:
						moonArray = getMoonArray(4);
					break;
				}

				const moonNum = moonArray.split(',');
				getMoon(moonNum[ordinal % 8]);
			break;
			case 1:
				moonArray = getMoonArray();
				const lunaNum = moonArray[0].split(',');
				const celeneNum = moonArray[1].split(',');
				getMoon(lunaNum[ordinal % 8], celeneNum[ordinal % 8]);
			break;
		}
	} else {
		if (phase2) {
			state.mwcal[mwcal.world].moon = `Luna: ${phase}, Celene: ${phase2}`;
		} else {
			state.mwcal[mwcal.world].moon = phase;
		}
	}
}

function getMoonArray(num) {
	let moonArray;

	switch (mwcal.world) {
		default:
			switch (num) {
				case 1:
					moonArray =
						'0,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,4,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1';
				break;
				case 2:
					moonArray =
						'0,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,0,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1';
				break;
				case 3:
					moonArray =
						'0,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,0,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1';
				break;
				case 4:
					moonArray =
						'0,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,3,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,16,16,1,2,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,0,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16,1,2,2,3,3,4,4,5,6,6,7,7,7,8,8,9,10,10,11,11,12,12,13,14,14,14,15,15,16,16,16,1,2,2,3,3,4,4,5,6,6,7,7,8,8,9,10,10,11,11,11,12,12,13,14,14,15,15,15,16,16';
				break;
			}
			break;
		case 1:
			moonArray = [
				'0,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7,7,8,8,9,10,10,11,12,12,13,13,14,14,15,15,16,16,1,2,2,3,4,4,5,5,6,6,7',
				'0,16,16,16,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,5,6,6,6,6,6,6,6,7,7,7,7,7,7,7,8,8,8,8,8,8,8,9,9,10,10,10,10,10,10,10,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,13,14,14,14,14,14,14,14,15,15,15,15,15,15,15,16,16,16,16,16,16,16,16,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,5,6,6,6,6,6,6,6,7,7,7,7,7,7,7,8,8,8,8,8,8,8,9,9,10,10,10,10,10,10,10,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,13,14,14,14,14,14,14,14,15,15,15,15,15,15,15,16,16,16,16,16,16,16,16,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,5,6,6,6,6,6,6,6,7,7,7,7,7,7,7,8,8,8,8,8,8,8,9,9,10,10,10,10,10,10,10,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,13,14,14,14,14,14,14,14,15,15,15,15,15,15,15,16,16,16,16,16,16,16,16,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4,4,4,5,6,6,6,6,6,6,6,7,7,7,7,7,7,7,8,8,8,8,8,8,8,9,9,10,10,10,10,10,10,10,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,13,14,14,14,14,14,14,14,15,15,15,15,15,15,15,16,16,16,16,16',
			];
		break;
	}

	return moonArray;
}

function getMoon(num, num2) {
	if (num2) {
		updMoon(getMoonPhase(num), getMoonPhase(num2));
	} else {
		updMoon(getMoonPhase(num));
	}
}

function getMoonPhase(input) {
	if (!isNaN(input)) {
		input = Number(input);
		if (input >= 0 && input <= 16) return moonPhases[Math.floor((input + 1) / 2)];
	} else if (typeof input === 'string') {
		const lowerCaseInput = input.toLowerCase();
		const index = moonPhases.findIndex(phase => phase.toLowerCase() === lowerCaseInput);
		if (index !== -1) return moonPhases[index];
	}
	return undefined;
}

function randomizeWeather() {
	let temp, wind, season, precip;
	const ordinal = state.mwcal[mwcal.world].ord;

    if (ordinal > 325 || ordinal <= 70) season = 'Winter';
    else if (ordinal <= 165) season = 'Spring';
    else if (ordinal <= 255) season = 'Summer';
    else if (ordinal <= 325) season = 'Fall';
	

	let rand = randomInteger(21);

    if (rand >= 15 && rand <= 17) {
        wind = 'the wind is blowing strongly ';
        
        switch (season) {
			case 'Winter':
				temp = 'It is a bitterly cold winter day, ';
			break;
			case 'Spring':
				temp = 'It is a cold spring day, ';
			break;
			case 'Summer':
				temp = 'It is a cool summer day, ';
			break;
			case 'Fall':
				temp = 'It is a cold fall day, ';
			break;
		}
    } else if (rand >= 18 && rand <= 20) {
        wind = 'the wind is blowing gently ';

		switch (season) {
			case 'Winter':
				temp = 'It is a mild winter day, ';
			break;
			case 'Spring':
				temp = 'It is a hot spring day, ';
			break;
			case 'Summer':
				temp = 'It is a blisteringly hot summer day, ';
			break;
			case 'Fall':
				temp = 'It is a hot fall day, ';
			break;
		}
    } else if (rand < 15) {
        wind = 'there is no wind ';
		switch (season) {
			case 'Winter':
				temp = 'It is a cold winter day, ';
			break;
			case 'Spring':
				temp = 'It is a warm spring day, ';
			break;
			case 'Summer':
				temp = 'It is a hot summer day, ';
			break;
			case 'Fall':
				temp = 'It is a cool fall day, ';
			break;
		}
    }

	rand = randomInteger(21);
	
	if (rand <= 15 && rand <= 17) {
	    switch (season) {
			case 'Winter':
				precip = 'and snow falls softly from the sky.';
			break;
			default:
				precip = 'and it is raining lightly.';
			break;
		}
	} else if (rand >= 18 && rand <= 20) {
	    switch (season) {
			case 'Winter':
				precip = 'and snow falls heavily from the sky.';
			break;
			default:
				precip = 'and a torrential rain is falling.';
			break;
		}
	} else if (rand < 15) {
	    switch (randomInteger(2)) {
			case 1:
				precip = 'and the sky is clear.';
			break;
			default:
				precip = 'and the sky is overcast.';
			break;
		}
	}
	
	state.mwcal[mwcal.world].weather = `${temp}${wind}${precip}`;
}

function toggleWeather() {
	state.mwcal[mwcal.world].wtype = !state.mwcal[mwcal.world].wtype;
}

function toggleMoon() {
	state.mwcal[mwcal.world].mtype = !state.mwcal[mwcal.world].mtype;
}

function calendarMenu() {
	updDate();

	const suffix = getSuffix();
	const day = state.mwcal[mwcal.world].day;
	const month = getMonth();
	const year = state.mwcal[mwcal.world].year;
	const hour = getHour();
	const minute = getMinute();
	const weather = state.mwcal[mwcal.world].wtype ? state.mwcal[mwcal.world].weather : null;
	const moon = state.mwcal[mwcal.world].mtype ? state.mwcal[mwcal.world].moon : null;
	const months = mwcal.months[mwcal.world].join('|');

	switch (weather) {
		default:
			switch (moon) {
				default:
					switch (mwcal.world) {
						default:
							sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
								`<div ${mwcal.style.header}>Multi-World Calendar</div>` + //--
								`<div ${mwcal.style.sub}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
								`<div ${mwcal.style.arrow}></div>` + //--
								`<table>` + //--
								`<tr><td ${mwcal.style.tdReg}>World: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --world --?{World?|${mwcal.worlds.join('|')}}">${state.mwcal[mwcal.world].name}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Day: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Month: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Year: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Time: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Moon: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --moon --phase --?{Phase?|${mwcal.moons.join('|')}}">${moon}</a></td></tr>` + //--
								`</table>` + //--
								`<div>Weather: <br>${weather}</div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather --toggle">Toggle Weather Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon --toggle">Toggle Moon Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather">Randomize Weather</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon">Randomize Moon Phase</a></div>` + //--
								`<br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --show">Show to Players</a></div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --reset">Reset Calendar</a></div>` + //--
								`</div>`
							);
						break;
						case 1:
							sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
								`<div ${mwcal.style.header}>Multi-World Calendar</div>` + //--
								`<div ${mwcal.style.sub}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
								`<div ${mwcal.style.arrow}></div>` + //--
								`<table>` + //--
								`<tr><td ${mwcal.style.tdReg}>World: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --world --?{World?|${mwcal.worlds.join('|')}}">${state.mwcal[mwcal.world].name}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Day: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Month: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Year: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Time: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Moon: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --moon --phase --?{Phase?|${mwcal.moons.join('|')}} --phase2 --?{Phase?|${mwcal.moons.join('|')}}">${moon}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Weather: </td></tr>` + //--
								`</table>` + //--
								`<div>${weather}</div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather --toggle">Toggle Weather Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon --toggle">Toggle Moon Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather">Randomize Weather</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon">Randomize Moon Phase</a></div>` + //--
								`<br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --show">Show to Players</a></div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --reset">Reset Calendar</a></div>` + //--
								`</div>`
							);
						break;
					}
				break;
				case null:
					switch (mwcal.world) {
						default:
							sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
								`<div ${mwcal.style.header}>Multi-World Calendar</div>` + //--
								`<div ${mwcal.style.sub}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
								`<div ${mwcal.style.arrow}></div>` + //--
								`<table>` + //--
								`<tr><td ${mwcal.style.tdReg}>World: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --world --?{World?|${mwcal.worlds.join('|')}}">${state.mwcal[mwcal.world].name}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Day: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Month: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Year: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Time: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Weather: </td></tr>` + //--
								`</table>` + //--
								`<div>${weather}</div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather --toggle">Toggle Weather Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon --toggle">Toggle Moon Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather">Randomize Weather</a></div>` + //--
								`<br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --show">Show to Players</a></div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --reset">Reset Calendar</a></div>` + //--
								`</div>`
							);
						break;
						case 1:
							sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
								`<div ${mwcal.style.header}>Multi-World Calendar</div>` + //--
								`<div ${mwcal.style.sub}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
								`<div ${mwcal.style.arrow}></div>` + //--
								`<table>` + //--
								`<tr><td ${mwcal.style.tdReg}>World: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --world --?{World?|${mwcal.worlds.join('|')}}">${state.mwcal[mwcal.world].name}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Day: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Month: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Year: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Time: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Weather: </td></tr>` + //--
								`</table>` + //--
								`<div>${weather}</div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather --toggle">Toggle Weather Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon --toggle">Toggle Moon Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather">Randomize Weather</a></div>` + //--
								`<br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --show">Show to Players</a></div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --reset">Reset Calendar</a></div>` + //--
								`</div>`
							);
						break;
					}
				break;
			}
		break;
		case null:
			switch (moon) {
				default:
					switch (mwcal.world) {
						default:
							sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
								`<div ${mwcal.style.header}>Multi-World Calendar</div>` + //--
								`<div ${mwcal.style.sub}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
								`<div ${mwcal.style.arrow}></div>` + //--
								`<table>` + //--
								`<tr><td ${mwcal.style.tdReg}>World: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --world --?{World?|${mwcal.worlds.join('|')}}">${state.mwcal[mwcal.world].name}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Day: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Month: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Year: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Time: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Moon: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --moon --phase --?{Phase?|${mwcal.moons.join('|')}}">${moon}</a></td></tr>` + //--
								`</table>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather --toggle">Toggle Weather Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon --toggle">Toggle Moon Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon">Randomize Moon Phase</a></div>` + //--
								`<br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --show">Show to Players</a></div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --reset">Reset Calendar</a></div>` + //--
								`</div>`
							);
						break;
						case 1:
							sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
								`<div ${mwcal.style.header}>Multi-World Calendar</div>` + //--
								`<div ${mwcal.style.sub}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
								`<div ${mwcal.style.arrow}></div>` + //--
								`<table>` + //--
								`<tr><td ${mwcal.style.tdReg}>World: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --world --?{World?|${mwcal.worlds.join('|')}}">${state.mwcal[mwcal.world].name}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Day: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Month: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Year: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Time: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Moon: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --moon --phase --?{Phase?|${mwcal.moons.join('|')}} --phase2 --?{Phase?|${mwcal.moons.join('|')}}">${moon}</a></td></tr>` + //--
								`</table>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather --toggle">Toggle Weather Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon --toggle">Toggle Moon Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon">Randomize Moon Phase</a></div>` + //--
								`<br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --show">Show to Players</a></div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --reset">Reset Calendar</a></div>` + //--
								`</div>`
							);
						break;
					}
				break;
				case null:
					switch (mwcal.world) {
						default:
							sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
								`<div ${mwcal.style.header}>Multi-World Calendar</div>` + //--
								`<div ${mwcal.style.sub}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
								`<div ${mwcal.style.arrow}></div>` + //--
								`<table>` + //--
								`<tr><td ${mwcal.style.tdReg}>World: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --world --?{World?|${mwcal.worlds.join('|')}}">${state.mwcal[mwcal.world].name}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Day: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Month: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Year: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Time: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
								`</table>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather --toggle">Toggle Weather Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon --toggle">Toggle Moon Display</a></div>` + //--
								`<br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --show">Show to Players</a></div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --reset">Reset Calendar</a></div>` + //--
								`</div>`
							);
						break;
						case 1:
							sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
								`<div ${mwcal.style.header}>Multi-World Calendar</div>` + //--
								`<div ${mwcal.style.sub}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
								`<div ${mwcal.style.arrow}></div>` + //--
								`<table>` + //--
								`<tr><td ${mwcal.style.tdReg}>World: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --world --?{World?|${mwcal.worlds.join('|')}}">${state.mwcal[mwcal.world].name}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Day: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Month: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Year: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
								`<tr><td ${mwcal.style.tdReg}>Time: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!mwcal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
								`</table>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --weather --toggle">Toggle Weather Display</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --moon --toggle">Toggle Moon Display</a></div>` + //--
								`<br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --show">Show to Players</a></div>` + //--
								`<br><br>` + //--
								`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal --reset">Reset Calendar</a></div>` + //--
								`</div>`
							);
						break;
					}
				break;
			}
		break;
	}
}

function showCalendar() {
	updDate();

	const suffix = getSuffix();
	const day = state.mwcal[mwcal.world].day;
	const month = getMonth();
	const year = state.mwcal[mwcal.world].year;
	const hour = getHour();
	const minute = getMinute();
	const weather = state.mwcal[mwcal.world].wtype ? state.mwcal[mwcal.world].weather : null;
	const moon = state.mwcal[mwcal.world].mtype ? state.mwcal[mwcal.world].moon : null;

	switch (weather) {
		default:
			switch (moon) {
				default:
					sendChat('Multi-World Calendar', `<div ${mwcal.style.divMenu}>` + //--
						`<div ${mwcal.style.header}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
						`<div ${mwcal.style.sub}>Player View</div>` + //--
						`<div ${mwcal.style.arrow}></div>` + //--
						`${day}${suffix} of ${month}, ${year}` + //--
						`<br>Current Time: ${hour}:${minute}` + //--
						`<br>Today\'s Weather: ${weather}<br>` + //--
						`<br>Moon Phase: ${moon}` + //--
						`</div>`
					);
				break;
				case null:
					sendChat('Multi-World Calendar', `<div ${mwcal.style.divMenu}>` + //--
						`<div ${mwcal.style.header}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
						`<div ${mwcal.style.sub}>Player View</div>` + //--
						`<div ${mwcal.style.arrow}></div>` + //--
						`${day}${suffix} of ${month}, ${year}` + //--
						`<br>Current Time: ${hour}:${minute}` + //--
						`<br>Today\'s Weather: ${weather}<br>` + //--
						`</div>`
					);
				break;
			}
		break;
		case null:
			switch (moon) {
				default:
					sendChat('Multi-World Calendar', `<div ${mwcal.style.divMenu}>` + //--
						`<div ${mwcal.style.header}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
						`<div ${mwcal.style.sub}>Player View</div>` + //--
						`<div ${mwcal.style.arrow}></div>` + //--
						`${day}${suffix} of ${month}, ${year}` + //--
						`<br>Current Time: ${hour}:${minute}` + //--
						`<br>Moon Phase: ${moon}` + //--
						`</div>`
					);
				break;
				case null:
					sendChat('Multi-World Calendar', `<div ${mwcal.style.divMenu}>` + //--
						`<div ${mwcal.style.header}>${state.mwcal[mwcal.world].name} Calendar</div>` + //--
						`<div ${mwcal.style.sub}>Player View</div>` + //--
						`<div ${mwcal.style.arrow}></div>` + //--
						`${day}${suffix} of ${month}, ${year}` + //--
						`<br>Current Time: ${hour}:${minute}` + //--
						`</div>`
					);
				break;
			}
		break;
	}
}

function advance(amount, type) {
	let ordinal = state.mwcal[mwcal.world].ord;
	const month = state.mwcal[mwcal.world].month;
	let year = state.mwcal[mwcal.world].year;
	let hour = state.mwcal[mwcal.world].hour;
	let minute = state.mwcal[mwcal.world].minute;

	switch (type.toLowerCase()) {
		case 'short rest':
			hour += amount;
		break;
		case 'long rest':
			hour += amount * 8;
		break;
		case 'minute':
			minute += amount;
		break;
		case 'hour':
			hour += amount;
		break;
		case 'day':
			ordinal += amount;
		break;
		case 'week':
			ordinal += amount * 7;
		break;
		case 'month':
			switch (mwcal.world) {
				case 0:
					ordinal += amount * 30;
				break;
				case 1:
					ordinal += amount * 28;
				break;
				case 2:
					const grhwkDays = [7, 28, 28, 28, 7, 28, 28, 28, 7, 28, 28, 28, 7, 28, 28, 28];
					for (let i=month; i<month+amount; i++) {
						if (i > grhwkDays.length) {
							ordinal += grhwkDays[i-grhwkDays.length];
						} else {
							ordinal += grhwkDays[i];
						}
					}
				break;
				case 3:
					const modernDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
					for (let i=month; i<month+amount; i++) {
						if (i > modernDays.length) {
							ordinal += modernDays[i-modernDays.length];
						} else {
							ordinal += modernDays[i];
						}
					}
				break;
				case 4:
					const talDays = [29, 30, 30, 31, 28, 31, 32, 29, 27, 29, 32];
					for (let i=month; i<month+amount; i++) {
						if (i > talDays.length) {
							ordinal += talDays[i-talDays.length];
						} else {
							ordinal += talDays[i];
						}
					}
				break;
			}

			updDate();
		break;
		case 'year':
			year += amount;
		break;
	}

	while (minute >= 60) {
		hour++;
		minute -= 60;
	}

	while (hour >= 24) {
		ordinal++;
		hour -= 24;
	}

	switch (mwcal.world) {
		case 0:
			while (ordinal > 360) {
				ordinal -= 360;
				year++;
			}
		break;
		case 1:
			while (ordinal > 336) {
				ordinal -= 364;
				year++;
			}
		break;
		case 2:
			while (ordinal > 364) {
				ordinal -= 365;
				year++;
			}
		break;
		case 3:
			while (ordinal > 365) {
				ordinal -= 365;
				year++;
			}
		break;
		case 4:
			while (ordinal > 328) {
				ordinal -= 328;
				year++;
			}
		break;
	}

	state.mwcal[mwcal.world].ord = ordinal;
	setHour(hour);
	setMinute(minute);
	setYear(year);
	updDate();
}

function alarmMenu(num) {
    const list = [];
    
    if (isNaN(num)) {
        if (state.alarms[mwcal.world].length === 0) {
			sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
				`<div ${mwcal.style.header}>Alarm Menu</div>` + //--
				`<div ${mwcal.style.sub}>${mwcal.worlds[mwcal.world]}</div>` + //--
				`<div ${mwcal.style.arrow}></div>` + //--
				`<div ${mwcal.style.divButton}>No Alarms set</div>` + //--
				`<br><br>` + //--
				`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm --new --title --?{Title?|Insert Title} --date --?{Date?|DD.MM.YYYY} --time --?{Time (24h)?|HH:MM} --message --?{Message?|Insert Message}">Create Alarm</a></div>` + //--
				`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal">Open Calendar</a></div>` + //--
				`</div>`
			);
		} else {
			for (let i=0; i<state.alarms[mwcal.world].length; i++) {
				list.push(i);
			}

			const alarmList = list.join('|');
			log(alarmList);

			sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
				`<div ${mwcal.style.header}>Alarm Menu</div>` + //--
				`<div ${mwcal.style.sub}>${mwcal.worlds[mwcal.world]}</div>` + //--
				`<div ${mwcal.style.arrow}></div>` + //--
				`<table>` + //--
				`<tr><td ${mwcal.style.tdReg}>Alarm: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!alarm --?{Alarm?|${alarmList}}">Not selected</a></td></tr>` + //--
				`</table>` + //--
				`<br><br>` + //--
				`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm --new --title --?{Title?|Insert Title} --date --?{Date?|DD.MM.YYYY} --time --?{Time (24h)?|HH:MM} --message --?{Message?|Insert Message}">Create Alarm</a></div>` + //--
				`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal">Open Calendar</a></div>` + //--
				`</div>`
			);
		}
    } else {
        const alarm = state.alarms[mwcal.world][num];
        
        if (!alarm) {
    		if (!state.alarms[mwcal.world]) {
    			sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
    				`<div ${mwcal.style.header}>Alarm Menu</div>` + //--
    				`<div ${mwcal.style.sub}>${mwcal.worlds[mwcal.world]}</div>` + //--
    				`<div ${mwcal.style.arrow}></div>` + //--
    				`<div ${mwcal.style.divButton}>No Alarms set</div>` + //--
    				`<br><br>` + //--
    				`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm --new --title --?{Title?|Insert Title} --date --?{Date?|DD.MM.YYYY} --time --?{Time (24h)?|HH:MM} --message --?{Message?|Insert Message}">Create Alarm</a></div>` + //--
    				`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal">Open Calendar</a></div>` + //--
    				`</div>`
    			);
    		} else {
    			for (let i=0; i<state.alarms[mwcal.world].length; i++) {
    				list.push(i);
    			}
    
    			const alarmList = list.join('|');
    
    			sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
    				`<div ${mwcal.style.header}>Alarm Menu</div>` + //--
    				`<div ${mwcal.style.sub}>${mwcal.worlds[mwcal.world]}</div>` + //--
    				`<div ${mwcal.style.arrow}></div>` + //--
    				`<table>` + //--
    				`<tr><td ${mwcal.style.tdReg}>Alarm: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!alarm --?{Alarm?|${alarmList}}">Not selected</a></td></tr>` + //--
    				`</table>` + //--
    				`<br><br>` + //--
    				`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm --new --title --?{Title?|Insert Title} --date --?{Date?|DD.MM.YYYY} --time --?{Time (24h)?|HH:MM} --message --?{Message?|Insert Message}">Create Alarm</a></div>` + //--
    				`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal">Open Calendar</a></div>` + //--
    				`</div>`
    			);
    		}
    	} else {
    		for (let i=0; i<state.alarms[mwcal.world].length; i++) {
    			list.push(i);
    		}
    
    		const alarmList = list.join('|');
    
    		const title = alarm.title;
    		const date = `${alarm.day}.${alarm.month}.${alarm.year}`;
    		const time = `${alarm.hour}:${alarm.minute}`;
    		const splitDate = date.split('.');
    		const splitTime = time.split(':');
    		const message = alarm.message;
    
    		sendChat('Multi-World Calendar', `/w gm <div ${mwcal.style.divMenu}>` + //--
    			`<div ${mwcal.style.header}>Alarm Menu</div>` + //--
    			`<div ${mwcal.style.arrow}></div>` + //--
    			`<table>` + //--
    			`<tr><td ${mwcal.style.tdReg}>Alarm: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!alarm --?{Alarm?|${alarmList}}">${title}</a></td></tr>` + //--
    			`<tr><td ${mwcal.style.tdReg}>Title: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!alarm --${num} --settitle --?{Title?|Insert Title}">${title}</td></tr>` + //--
    			`<tr><td ${mwcal.style.tdReg}>Date: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!alarm --${num} --setdate --?{Day?|${splitDate[0]}}.?{Month?|${splitDate[1]}}.?{Year?|${splitDate[2]}}">${date}</td></tr>` + //--
    			`<tr><td ${mwcal.style.tdReg}>Time: </td><td ${mwcal.style.tdReg}><a ${mwcal.style.buttonMedium}" href="!alarm --${num} --settime --?{Hour?|${splitTime[0]}}:?{Minute?|${splitTime[1]}}">${time}</td></tr>` + //--
    			`<tr><td ${mwcal.style.tdReg}>Message: </td><td ${mwcal.style.tdReg}>${message}</td></tr>` + //--
    			`</table>` + //--
    			`<br><br>` + //--
    			`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm --${num} --setmessage --?{Message?|Insert Message}">Set Message</a></div>` + //--
    			`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm --new --title --?{Title?|Insert Title} --date --?{Date?|DD.MM.YYYY} --time --?{Time (24h)?|HH:MM} --message --?{Message?|Insert Message}">Create Alarm</a></div>` + //--
    			`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!alarm --${num} --delete">Delete Alarm</a></div>` + //--
    			`<div ${mwcal.style.divButton}><a ${mwcal.style.buttonLarge}" href="!mwcal">Open Calendar</a></div>` + //--
    			`</div>`
    		);
    	}
    }
}

function createAlarm(title, date, time, message) {
	const splitDate = date.split('.');
	const splitTime = time.split(':');
	const alarm = {
		title: title,
		day: splitDate[0],
		month: splitDate[1],
		year: splitDate[2],
		hour: splitTime[0],
		minute: splitTime[1],
		message: message
	};

	(state.alarms[mwcal.world]).push(alarm);

	sendChat('Multi-World Calendar', `/w gm Alarm #${state.alarms[mwcal.world].length - 1} created!`)
	sendChat('Multi-World Calendar', `/w gm Title: ${title}, Date: ${date}, Time: ${time}, Message: ${message}`);

	alarmMenu(state.alarms[mwcal.world].length - 1);
}

function setTitle(num, title) {
	state.alarms[mwcal.world][num].title = title;

	sendChat('Multi-World Calendar', `/w gm Alarm #${num} title set to "${title}"`);
}

function setDate(num, date) {
	const splitDate = date.split('.');
	state.alarms[mwcal.world][num].day = splitDate[0];
	state.alarms[mwcal.world][num].month = splitDate[1];
	state.alarms[mwcal.world][num].year = splitDate[2];

	sendChat('Multi-World Calendar', `/w gm Alarm #${num} date set to ${date}`);
}

function setTime(num, time) {
	const splitTime = time.split(':');
	state.alarms[mwcal.world][num].hour = splitTime[0];
	state.alarms[mwcal.world][num].minute = splitTime[1];

	sendChat('Multi-World Calendar', `/w gm Alarm #${num} time set to ${time}`);
}

function setMessage(num, message) {
	state.alarms[mwcal.world][num].message = message;

	sendChat('Multi-World Calendar', `/w gm Alarm #${num} message set to \"${message}\"`);
}

function deleteAlarm(num) {
	state.alarms[mwcal.world].splice(num, 1);

	sendChat('Multi-World Calendar', `/w gm Alarm #${num} deleted`);
}

function updAlarm(num) {
	const alarm = state.alarms[mwcal.world][num];
	
	if (!alarm) {
		sendChat('Multi-World Calendar', '/w gm This Alarm does not exist!')
	} else {
		const title = alarm.title;
		const date = `${alarm.day}.${alarm.month}.${alarm.year}`;
		const time = `${alarm.hour}:${alarm.minute}`;
		const message = alarm.message;

		let hand = findObjs({ _type: 'handout', name: `Alarm #${num}` }, { caseInsensitive: true })[0];

		if (!hand) {
			hand = createObj('handout', {
				name: `Alarm #${num}`,
			});
		}

		hand.set('notes', `Title: ${title}\n` + //--
			`Date: ${date}\n` + //--
			`Time: ${time}\n` + //--
			`Message: ${message}`
		);
	}
}

function chkAlarms() {
	const alarms = state.alarms[mwcal.world];
	if (alarms) {
			alarms.forEach(alarm => {
			if (alarm.hour) {
				if (alarm.year === state.mwcal[mwcal.world].year && alarm.month === state.mwcal[mwcal.world].month && (alarm.day >= state.mwcal[mwcal.world].day && !(alarm.day >= state.mwcal[mwcal.world].day+7)) && (alarm.hour >= state.mwcal[mwcal.world].hour && !(alarm.hour >= state.mwcal[mwcal.world].hour+12)) && (alarm.minute >= state.mwcal[mwcal.world].minute && !(alarm.minute >= state.mwcal[mwcal.world].minute+30))) {
					const alarmNum = state.alarms[mwcal.world].indexOf(alarm);
					
					sendChat('Multi-World Calendar', `/w gm Alarm #${alarmNum} triggered!\n` + //--
						`Title: ${alarm.title}\n` + //--
						`Date: ${alarm.day}.${alarm.month}.${alarm.year}\n` + //--
						`Time: ${alarm.hour}:${alarm.minute}\n` + //--
						`Message: ${alarm.message}`
					);
	
					deleteAlarm(alarmNum);
				}
			} else {
				if (alarm.year === state.mwcal[mwcal.world].year && alarm.month === state.mwcal[mwcal.world].month && (alarm.day >= state.mwcal[mwcal.world].day && !(alarm.day >= state.mwcal[mwcal.world].day+7))) {
					const alarmNum = state.alarms[mwcal.world].indexOf(alarm);
					
					sendChat('Multi-World Calendar', `/w gm Alarm #${alarmNum} triggered!\n` + //--
						`Title: ${alarm.title}\n` + //--
						`Date: ${alarm.day}.${alarm.month}.${alarm.year}\n` + //--
						`Message: ${alarm.message}`
					);
	
					deleteAlarm(alarmNum);
				}
			}
		});
	}
}

on('ready', () => {
	mwcal.checkInstall();
	mwcal.registerEventHandlers();
});