/* Faerûn Calendar for Roll20
Original created by Kirsty (https://app.roll20.net/users/1165285/kirsty)
Updated by Julexar (https://app.roll20.net/users/9989180/julexar)

GM Commands:
!cal
Displays the Calendar Menu
    --setday --{Insert Number}
    Sets the current day to the number you input
    --setmonth --{Insert Number}
    Sets the current month to the number you input
    --setyear --{Insert Number}
    Sets the current year to the number you input
    --settime --hour --{Insert Number} --minute --{Insert Number}
    Sets the current time to the numbers you input
    --advance --{Insert Number} --{short rest, long rest, hour, minute, day, week, month, year}
    Advances the time by the number/type you input
    --weather
    Randomises the Weather
        --toggle
        Toggles the Weather Display
    --moon
    Resets the Moon Phase
        --phase --{Insert Name/Number}
        Sets the Moon Phase according to the name/number you input
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
        --settile --{Insert Title}
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
        Sets the Message of the Alarm
    --delete --{Insert Number}
    Deletes the Alarm you input
    --reset
    Resets the Alarms to the Default Values

Player Commands:

!cal
Displays the current Calendar to the Players
*/

const styles = {
	divMenu: 'style="width: 300px; border: 1px solid black; background-color: #ffffff; padding: 5px;"',
	divButton: 'style="text-align:center;"',
	buttonSmall:
		'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 75px;',
	buttonMedium:
		'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 100px;',
	buttonLarge:
		'style="text-align:center; border: 1px solid black; margin: 1px; background-color: #7E2D40; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; width: 150px;',
	table: 'style="text-align:center; font-size: 12px; width: 100%; border-style: 3px solid #cccccc;"',
	arrow: 'style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid rgb(126, 45, 64); margin-bottom: 2px; margin-top: 2px;"',
	header: 'style="color: rgb(126, 45, 64); font-size: 18px; text-align: left; font-variant: small-caps; font-family: Times, serif;"',
	sub: 'style="font-size: 11px; line-height: 13px; margin-top: -3px; font-style: italic;"',
	tdReg: 'style="text-align: right;"',
	trTab: 'style="text-align: left; border-bottom: 1px solid #cccccc;"',
	tdTab: 'style="text-align: center; border-right: 1px solid #cccccc;"',
	span: 'style="display: inline; width: 10px; height: 10px; padding: 1px; border: 1px solid black; background-color: white;"',
};

const moonPhases = [
	'Full Moon',
	'Waning Gibbous',
	'Last Quarter',
	'Waning Crescent',
	'New Moon',
	'Waxing Crescent',
	'First Quarter',
	'Waxing Gibbous',
];

const monthNames = ['Hammer', 'Alturiak', 'Ches', 'Tarsakh', 'Mirtul', 'Kythorn', 'Flamerule', 'Eleasias', 'Eleint', 'Marpenoth', 'Uktar', 'Nightal'];

class FaerunCalendar {
	constructor() {
		this.style = styles;
		this.default = state.calendar;
		this.moons = moonPhases;
		this.months = monthNames;
		this.alarms = state.alarms;
	}

	handleInput(msg) {
		const args = msg.content.split(/\s+--/);

		if (msg.type !== 'api') return;

		if (playerIsGM(msg.playerid)) {
			switch (args[0]) {
				case '!cal':
					switch (args[1]) {
						default:
							chkAlarms();
							calendarMenu();
							break;
						case 'setday':
							const day = parseInt(args[2]);
							if (isNaN(day)) return sendChat('Faerûn Calendar', 'Please input a valid number for the day.');

							setDay(day);
							chkAlarms();
							calendarMenu();
							break;
						case 'setmonth':
							const month = args[2];
							if (!monthNames.includes(month)) return sendChat('Faerûn Calendar', 'Please input a valid month.');

							setMonth(month);
							chkAlarms();
							calendarMenu();
							break;
						case 'setyear':
							const year = parseInt(args[2]);
							if (isNaN(year)) return sendChat('Faerûn Calendar', 'Please input a valid number for the year.');

							setYear(year);
							chkAlarms();
							calendarMenu();
							break;
						case 'settime':
							const hour = parseInt(args[3]);
							const minute = parseInt(args[5]);
							if (isNaN(hour) || isNaN(minute))
								return sendChat('Faerûn Calendar', 'Please input a valid number for the hour and minute.');

							setHour(hour);
							setMinute(minute);
							chkAlarms();
							calendarMenu();
							break;
						case 'advance':
							const amount = parseInt(args[2]);
							const type = args[3];
							if (isNaN(amount)) return sendChat('Faerûn Calendar', 'Please input a valid number for the amount.');
							if (!['Short Rest', 'Long Rest', 'Minute', 'Hour', 'Day', 'Week', 'Month', 'Year'].includes(type))
								return sendChat('Faerûn Calendar', 'Please input a valid type.');

							advance(amount, type);
							chkAlarms();
							calendarMenu();
							break;
						case 'weather':
							if (args[2] === 'toggle') {
								toggleWeather();
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
							} else if (args[2] === 'phase') {
								const phase = args[3];
								updMoon(phase);
								calendarMenu();
							} else {
								updMoon();
								calendarMenu();
							}
							break;
						case 'show':
							showCal();
							break;
						case 'reset':
							setCalendarDefaults();
							calendarMenu();
							break;
					}
					break;
				case '!month':
					renameMonth(args[1], args[2]);
					break;
				case '!alarm':
					switch (args[1]) {
						case undefined:
							alarmMenu();
							break;
						default:
							const num = parseInt(args[1]);
							if (isNaN(num)) return sendChat('Faerûn Calendar', 'Please input a valid number for the alarm.');

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
							createAlarm(args[2], args[4], args[6], args[8]);
							alarmMenu();
							break;
						case 'delete':
							deleteAlarm(args[2]);
							alarmMenu();
							break;
						case 'reset':
							setAlarmDefaults();
							alarmMenu();
							break;
					}
					break;
			}
		} else {
			switch (args[0]) {
				case '!cal':
					showCal();
					break;
			}
		}
	}

	checkInstall() {
		if (!state.calendar) {
			setCalendarDefaults();
		}

		if (!state.alarms) {
			setAlarmDefaults();
		}
	}

	registerEventHandlers() {
		on('chat:message', this.handleInput);
		log('Faerûn Calendar - Registered Event Handlers!');
	}
}

const calendar = new FaerunCalendar();

function setCalendarDefaults() {
	state.calendar = {
		ord: 1,
		day: 1,
		month: 1,
		year: 1486,
		hour: 1,
		minute: 0,
		weather: 'It is a cool but sunny day',
		moon: 'Full Moon',
		moonImg: '',
		wtype: true,
		mtype: true,
	};
	log('Faerûn Calendar: Successfully registered Calendar defaults!');
}

function setAlarmDefaults() {
	state.alarms = [];
	log('Faerûn Calendar: Successfully registered Alarm defaults!');
}

function updOrdinal() {
	state.calendar.ord = 30 * (state.calendar.month - 1) + state.calendar.day;
}

function getSuffix() {
	const ordinal = state.calendar.ord;

	if (ordinal >= 11 && ordinal <= 13) return 'th';

	switch (ordinal % 10) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
}

function updDate() {
	updOrdinal();
	const ordinal = state.calendar.ord;

	let date, month;

	if (Math.ceil(ordinal / 30) <= 1) {
		month = calendar.months[0];
		date = ordinal;
		setMonth(month);
	} else {
		month = monthNames[Math.ceil(ordinal / 30) - 1];
		date = ordinal - 30 * (Math.ceil(ordinal / 30) - 1);
		setMonth(month);
	}

	setDay(date);
}

function setDay(day) {
	state.calendar.day = day;
}

function getMonth() {
	return monthNames[state.calendar.month - 1];
}

function setMonth(month) {
	state.calendar.month = monthNames.indexOf(month) + 1;
}

function setYear(year) {
	state.calendar.year = year;
}

function getHour() {
	if (state.calendar.hour < 10) return `0${state.calendar.hour}`;
	return `${state.calendar.hour}`;
}

function setHour(hour) {
	state.calendar.hour = hour;
}

function getMinute() {
	if (state.calendar.minute < 10) return `0${state.calendar.minute}`;
	return `${state.calendar.minute}`;
}

function setMinute(minute) {
	state.calendar.minute = minute;
}

function updMoon(phase) {
	if (!phase) {
		const ordinal = state.calendar.ord;
		const year = state.calendar.year;
		const remainder = year / 4 - Math.floor(year / 4);
		let moonArray = [];

		switch (remainder) {
			case 0.25:
				moonArray = getMoonArray(2);
				break;
			case 0.5:
				moonArray = getMoonArray(3);
				break;
			case 0.75:
				moonArray = getMoonArray(4);
				break;
			default:
				moonArray = getMoonArray(1);
				break;
		}

		const moonNum = moonArray.split(',');
		getMoon(moonNum[ordinal % 8]);
	} else {
		state.calendar.moon = phase;
	}
}

function getMoonArray(num) {
	let moonArray;

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

	return moonArray;
}

function getMoon(num) {
	if (num && isNaN(num)) {
		switch (num.toLowerCase()) {
			case 'full moon':
				state.calendar.moon = 'Full Moon';
				break;
			case 'waning gibbous':
				state.calendar.moon = 'Waning Gibbous';
				break;
			case 'last quarter':
				state.calendar.moon = 'Last Quarter';
				break;
			case 'waning crescent':
				state.calendar.moon = 'Waning Crescent';
				break;
			case 'new moon':
				state.calendar.moon = 'New Moon';
				break;
			case 'waxing crescent':
				state.calendar.moon = 'Waxing Crescent';
				break;
			case 'first quarter':
				state.calendar.moon = 'First Quarter';
				break;
			case 'waxing gibbous':
				state.calendar.moon = 'Waxing Gibbous';
				break;
		}
	} else {
		switch (num) {
			case 1 || 0:
				state.calendar.moon = 'Full Moon';
				break;
			case 2 || 3 || 4:
				state.calendar.moon = 'Waning Gibbous';
				break;
			case 5:
				state.calendar.moon = 'Last Quarter';
				break;
			case 6 || 7 || 8:
				state.calendar.moon = 'Waning Crescent';
				break;
			case 9:
				state.calendar.moon = 'New Moon';
				break;
			case 10 || 11 || 12:
				state.calendar.moon = 'Waxing Crescent';
				break;
			case 13:
				state.calendar.moon = 'First Quarter';
				break;
			case 14 || 15 || 16:
				state.calendar.moon = 'Waxing Gibbous';
				break;
		}
	}
}

function calendarMenu() {
	updDate();

	const suffix = getSuffix();
	const day = state.calendar.day;
	const month = getMonth();
	const year = state.calendar.year;
	const hour = getHour();
	const minute = getMinute();
	const weather = state.calendar.wtype ? state.calendar.weather : null;
	const moon = state.calendar.mtype ? state.calendar.moon : null;

	let months = monthNames.toString();

	for (let i = 0; i < monthNames.length; i++) {
		months = months.replace(',', '|');
	}

	switch (weather) {
		default:
			switch (moon) {
				default:
					sendChat(
						'Faerûn Calendar',
						`/w gm <div ${calendar.style.divMenu}>` + //--
							`<div ${calendar.style.header}>Calendar Menu</div>` + //--
							`<div ${calendar.style.arrow}></div>` + //--
							`<table>` + //--
							`<tr><td ${calendar.style.tdReg}>Day: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Month: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Year: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Time: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Moon: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --moon --phase --?{Phase?|${moon}}">${moon}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Weather: </td><td ${calendar.style.tdReg}>${weather}</td></tr>` + //--
							`</table>` + //--
							`<br><br>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --weather --toggle">Toggle Weather Display</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --moon --toggle">Toggle Moon Display</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --weather">Randomise Weather</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --moon">Reset Moon Phase</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --show">Show to Players</a></div>` + //--
							`</div>`
					);
					break;
				case null:
					sendChat(
						'Faerûn Calendar',
						`/w gm <div ${calendar.style.divMenu}>` + //--
							`<div ${calendar.style.header}>Calendar Menu</div>` + //--
							`<div ${calendar.style.arrow}></div>` + //--
							`<table>` + //--
							`<tr><td ${calendar.style.tdReg}>Day: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Month: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Year: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Time: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Weather: </td><td ${calendar.style.tdReg}>${weather}</td></tr>` + //--
							`</table>` + //--
							`<br><br>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --weather --toggle">Toggle Weather Display</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --moon --toggle">Toggle Moon Display</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --weather">Randomise Weather</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --show">Show to Players</a></div>` + //--
							`</div>`
					);
					break;
			}
			break;
		case null:
			switch (state.calendar.mytpe) {
				default:
					sendChat(
						'Faerûn Calendar',
						`/w gm <div ${calendar.style.divMenu}>` + //--
							`<div ${calendar.style.header}>Calendar Menu</div>` + //--
							`<div ${calendar.style.arrow}></div>` + //--
							`<table>` + //--
							`<tr><td ${calendar.style.tdReg}>Day: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Month: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Year: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Time: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Moon: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --moon --phase --?{Phase?|${moon}}">${moon}</a></td></tr>` + //--
							`</table>` + //--
							`<br><br>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --weather --toggle">Toggle Weather Display</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --moon --toggle">Toggle Moon Display</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --moon">Reset Moon Phase</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --show">Show to Players</a></div>` + //--
							`</div>`
					);
					break;
				case null:
					sendChat(
						'Faerûn Calendar',
						`/w gm <div ${calendar.style.divMenu}>` + //--
							`<div ${calendar.style.header}>Calendar Menu</div>` + //--
							`<div ${calendar.style.arrow}></div>` + //--
							`<table>` + //--
							`<tr><td ${calendar.style.tdReg}>Day: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setday --?{Day?|${day}}">${day}${suffix}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Month: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setmonth --?{Month?|${months}}">${month}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Year: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --setyear --?{Year?|${year}}">${year}</a></td></tr>` + //--
							`<tr><td ${calendar.style.tdReg}>Time: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!cal --settime --hour --?{Hour?|${hour}} --minute --?{Minute?|${minute}}">${hour}:${minute}</a></td></tr>` + //--
							`</table>` + //--
							`<br><br>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --advance --?{Amount?|1} --?{Type?|Short Rest|Long Rest|Minute|Hour|Day|Week|Month|Year}">Advance Time</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --weather --toggle">Toggle Weather Display</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --moon --toggle">Toggle Moon Display</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!alarm">Open Alarm Menu</a></div>` + //--
							`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal --show">Show to Players</a></div>` + //--
							`</div>`
					);
					break;
			}
			break;
	}
}

function showCal() {
	updDate();

	const suffix = getSuffix();
	const day = state.calendar.day;
	const month = getMonth();
	const year = state.calendar.year;
	const hour = getHour();
	const minute = getMinute();
	const weather = state.calendar.wtype ? state.calendar.weather : null;
	const moon = state.calendar.mtype ? state.calendar.moon : null;

	switch (weather) {
		default:
			switch (moon) {
				default:
					sendChat(
						'Faerûn Calendar',
						`<div ${calendar.style.divMenu}>` + //--
							`<div ${calendar.style.header}>Faerûn Calendar</div>` + //--
							`<div ${calendar.style.sub}>Player View</div>` + //--
							`<div ${calendar.style.arrow}></div>` + //--
							`${day} of ${month}, ${year}` + //--
							`<br>Current Time: ${hour}:${minute}<br>` + //--
							`<br>Today\'s Weather: ${weather}<br>` + //--
							`<br>Moon Phase: ${moon}<br>` + //--
							`</div>`
					);
					break;
				case null:
					sendChat(
						'Faerûn Calendar',
						`<div ${calendar.style.divMenu}>` + //--
							`<div ${calendar.style.header}>Faerûn Calendar</div>` + //--
							`<div ${calendar.style.sub}>Player View</div>` + //--
							`<div ${calendar.style.arrow}></div>` + //--
							`${day} of ${month}, ${year}` + //--
							`<br>Current Time: ${hour}:${minute}<br>` + //--
							`<br>Today\'s Weather: ${weather}<br>` + //--
							`</div>`
					);
					break;
			}
			break;
		case null:
			switch (moon) {
				default:
					sendChat(
						'Faerûn Calendar',
						`<div ${calendar.style.divMenu}>` + //--
							`<div ${calendar.style.header}>Faerûn Calendar</div>` + //--
							`<div ${calendar.style.sub}>Player View</div>` + //--
							`<div ${calendar.style.arrow}></div>` + //--
							`${day} of ${month}, ${year}` + //--
							`<br>Current Time: ${hour}:${minute}<br>` + //--
							`<br>Moon Phase: ${moon}<br>` + //--
							`</div>`
					);
					break;
				case null:
					sendChat(
						'Faerûn Calendar',
						`<div ${calendar.style.divMenu}>` + //--
							`<div ${calendar.style.header}>Faerûn Calendar</div>` + //--
							`<div ${calendar.style.sub}>Player View</div>` + //--
							`<div ${calendar.style.arrow}></div>` + //--
							`${day} of ${month}, ${year}` + //--
							`<br>Current Time: ${hour}:${minute}<br>` + //--
							`</div>`
					);
					break;
			}
			break;
	}
}

function advance(amount, type) {
	let ordinal = state.calendar.ord;
	let day = state.calendar.day;
	let month = state.calendar.month;
	let year = state.calendar.year;
	let hour = state.calendar.hour;
	let minute = state.calendar.minute;

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
			day += amount;
			ordinal += amount;
			break;
		case 'week':
			day += amount * 7;
			ordinal += amount * 7;
			break;
		case 'month':
			month += amount;
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
		day++;
		hour -= 24;
	}

	while (ordinal > 360) {
		year++;
		ordinal -= 360;
	}

	while (day > 30) {
		month++;
		day -= 30;
	}

	while (month > 12) {
		year++;
		month -= 12;
	}

	setMinute(minute);
	setHour(hour);
	setYear(year);
	updDate();
}

function randomizeWeather() {
	let temp, wind, season, precip;
	const ordinal = state.calendar.ord;

	switch (ordinal) {
		case ordinal > 330 || ordinal <= 75:
			season = 'Winter';
			break;
		case ordinal <= 170:
			season = 'Spring';
			break;
		case ordinal <= 240:
			season = 'Summer';
			break;
		case ordinal <= 330:
			season = 'Fall';
			break;
	}

	let rand = randomInteger(21);

	switch (rand) {
		case rand >= 15 && rand <= 17:
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
			break;
		case rand >= 18 && rand <= 20:
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
			break;
		default:
			wind = 'the wind is calm ';
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
			break;
	}

	rand = randomInteger(21);

	switch (rand) {
		case rand >= 15 && rand <= 17:
			switch (season) {
				case 'Winter':
					precip = 'and snow falls softly from the sky.';
					break;
				default:
					precip = 'and it is raining lightly.';
					break;
			}
			break;
		case rand >= 18 && rand <= 20:
			switch (season) {
				case 'Winter':
					precip = 'and snow falls heavily from the sky.';
					break;
				default:
					precip = 'and it is raining heavily.';
					break;
			}
			break;
		default:
			switch (randomInteger(2)) {
				case 1:
					precip = 'and the sky is clear.';
					break;
				case 2:
					precip = 'and the sky is overcast.';
					break;
			}
			break;
	}

	state.calendar.weather = temp + wind + precip;
}

function toggleWeather() {
	state.calendar.wtype = !state.calendar.wtype;
}

function toggleMoon() {
	state.calendar.mtype = !state.calendar.mtype;
}

function alarmMenu(num) {
	const alarm = state.alarms[num];
	const list = [];
	const len = state.alarms.length;

	if (!num || !alarm) {
		if (!len || len === 0) {
			sendChat(
				'Faerûn Calendar',
				`/w gm <div ${calendar.style.divMenu}>` + //--
					`<div ${calendar.style.header}>Alarm Menu</div>` + //--
					`<div ${calendar.style.arrow}></div>` + //--
					`<div ${calendar.style.divButton}>No Alarms set</div>` + //--
					`<br><br>` + //--
					`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!alarm --new --title --?{Title?|Insert Title} --date --?{Date?|DD.MM.YYYY} --time --?{Time?|HH:MM} --message --?{Message?|Insert Message}">Create Alarm</a></div>` + //--
					`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal">Open Calendar</a></div>` + //--
					`</div>`
			);
		} else {
			for (let i = 0; i < len; i++) {
				list.push(i);
			}

			let alarmList = list.toString();

			for (let i = 0; i < len; i++) {
				alarmList = alarmList.replace(',', '|');
			}

			sendChat(
				'Faerûn Calendar',
				`/w gm <div ${calendar.style.divMenu}>` + //--
					`<div ${calendar.style.header}>Alarm Menu</div>` + //--
					`<div ${calendar.style.arrow}></div>` + //--
					`<table>` + //--
					`<tr><td>Alarm: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!alarm --?{Alarm?|${alarmList}}>Not selected</a></td></tr>` + //--
					`</table>` + //--
					`<br><br>` + //--
					`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!alarm --new --title --?{Title?|Insert Title} --date --?{Date?|DD.MM.YYYY} --time --?{Time?|HH:MM} --message --?{Message?|Insert Message}">Create Alarm</a></div>` + //--
					`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal">Open Calendar</a></div>` + //--
					`</div>`
			);
		}
	} else {
		for (let i = 0; i < len; i++) {
			list.push(i);
		}

		let alarmList = list.toString();

		for (let i = 0; i < len; i++) {
			alarmList = alarmList.replace(',', '|');
		}

		const title = alarm.title;
		const date = `${alarm.day}.${alarm.month}.${alarm.year}`;
		const time = `${alarm.hour}:${alarm.minute}`;
		const splitDate = date.split('.');
		const splitTime = time.split(':');

		sendChat(
			'Faerûn Calendar',
			`/w gm <div ${calendar.style.divMenu}>` + //--
				`<div ${calendar.style.header}>Alarm Menu</div>` + //--
				`<div ${calendar.style.arrow}></div>` + //--
				`<table>` + //--
				`<tr><td ${calendar.style.tdReg}>Alarm: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!alarm --?{Alarm?|${alarmList}}">${num}</a></td></tr>` + //--
				`<tr><td ${calendar.style.tdReg}>Title: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!alarm --${num} --settitle --?{Title?|${title}}">${title}</a></td></tr>` + //--
				`<tr><td ${calendar.style.tdReg}>Date: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!alarm --${num} --setdate --?{Day?|${splitDate[0]}}.?{Month?|${splitDate[1]}}.?{Year?|${splitDate[2]}}">${date}</a></td></tr>` + //--
				`<tr><td ${calendar.style.tdReg}>Time: </td><td ${calendar.style.tdReg}><a ${calendar.style.buttonMedium}" href="!alarm --${num} --settime --?{Hour?|${splitTime[0]}}:?{Minute?|${splitTime[1]}}">${time}</a></td></tr>` + //--
				`<tr><td ${calendar.style.tdReg}>Message: </td><td ${calendar.style.tdReg}>${alarm.message}</td></tr>` + //--
				`</table>` + //--
				`<br><br>` + //--
				`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!alarm --${num} --setmessage --?{Message?|${alarm.message}}">Set Message</a></div>` + //--
				`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!alarm --new --title --?{Title?|Insert Title} --date --?{Date?|DD.MM.YYYY} --time --?{Time?|HH:MM} --message --?{Message?|Insert Message}">Create Alarm</a></div>` + //--
				`<div ${calendar.style.divButton}><a ${calendar.style.buttonLarge}" href="!cal">Open Calendar</a></div>` + //--
				`</div>`
		);
	}
}

function createAlarm(title, date, time, message) {
	const splitDate = date.split('.');
	const splitTime = time.split(':');

	state.alarms.push({
		title: title,
		day: splitDate[0],
		month: splitDate[1],
		year: splitDate[2],
		hour: splitTime[0],
		minute: splitTime[1],
		message: message,
	});

	sendChat(
		'Faerûn Calendar',
		`/w gm Alarm #${state.alarms.length - 1} created!\n` + //--
			`Title: ${title}\n` + //--
			`Date: ${date}\n` + //--
			`Time: ${time}\n` + //--
			`Message: ${message}`
	);

	alarmMenu(state.alarms.length - 1);
}

function setTitle(num, title) {
	state.alarms[num].title = title;

	sendChat('Faerûn Calendar', `/w gm Alarm #${num} title set to \"${title}\"`);
	alarmMenu(num);
}

function setDate(num, date) {
	const splitDate = date.split('.');

	state.alarms[num].day = splitDate[0];
	state.alarms[num].month = splitDate[1];
	state.alarms[num].year = splitDate[2];

	sendChat('Faerûn Calendar', `/w gm Alarm #${num} date set to ${date}`);
	alarmMenu(num);
}

function setTime(num, time) {
	const splitTime = time.split(':');

	state.alarms[num].hour = splitTime[0];
	state.alarms[num].minute = splitTime[1];

	sendChat('Faerûn Calendar', `/w gm Alarm #${num} time set to ${time}`);
	alarmMenu(num);
}

function setMessage(num, message) {
	state.alarms[num].message = message;

	sendChat('Faerûn Calendar', `/w gm Alarm #${num} message set to \"${message}\"`);
	alarmMenu(num);
}

function deleteAlarm(num) {
	state.alarms.splice(num, 1);

	sendChat('Faerûn Calendar', `/w gm Alarm #${num} deleted`);
	alarmMenu();
}

function updateAlarm(num) {
	const alarm = state.alarms[num];

	if (!alarm) sendChat('Faerûn Calendar', `/w gm This Alarm does not exist!`);
	else {
		const title = alarm.title;
		const date = `${alarm.day}.${alarm.month}.${alarm.year}`;
		const time = `${alarm.hour}:${alarm.minute}`;
		const message = alarm.message;

		let hand = findObjs({ _type: 'handout', name: 'Alarms' }, { caseInsensitive: true })[0];

		if (!hand) {
			hand = createObj('handout', {
				name: `Alarm #${num}`,
			});
		}

		hand.set(
			'notes',
			`Title: ${title}\n` + //--
				`Date: ${date}\n` + //--
				`Time: ${time}\n` + //--
				`Message: ${message}`
		);
	}
}

function chkAlarms() {
	for (let i = 0; i < state.alarms.length; i++) {
		const alarm = state.alarms[i];

		if (alarm.hour) {
			if (
				alarm.year === state.calendar.year &&
				alarm.month === state.calendar.month &&
				alarm.day >= state.calendar.day &&
				!(alarm.day >= state.calendar.day + 7) &&
				alarm.hour >= state.calendar.hour &&
				!(alarm.hour >= state.calendar.hour + 12) &&
				alarm.minute >= state.calendar.minute &&
				!(alarm.minute >= state.calendar.minute + 30)
			) {
				sendChat(
					'Faerûn Calendar',
					`/w gm Alarm #${i} triggered!\n` + //--
						`Title: ${alarm.title}\n` + //--
						`Date: ${alarm.day}.${alarm.month}.${alarm.year}\n` + //--
						`Time: ${alarm.hour}:${alarm.minute}\n` + //--
						`Message: ${alarm.message}`
				);

				deleteAlarm(i);
			}
		} else {
			if (
				alarm.year === state.calendar.year &&
				alarm.month === state.calendar.month &&
				alarm.day >= state.calendar.day &&
				!(alarm.day >= state.calendar.day + 7)
			) {
				sendChat(
					'Faerûn Calendar',
					`/w gm Alarm #${i} triggered!\n` + //--
						`Title: ${alarm.title}\n` + //--
						`Date: ${alarm.day}.${alarm.month}.${alarm.year}\n` + //--
						`Message: ${alarm.message}`
				);

				deleteAlarm(i);
			}
		}
	}
}

on('ready', () => {
	calendar.checkInstall();
	calendar.registerEventHandlers();
});
