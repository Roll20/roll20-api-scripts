(function() {

  function ordinal(number) {
    if (number > 10 && number < 20) {
      return 'th';
    } else if (number % 10 == 1) {
      return 'st';
    } else if (number % 10 == 2) {
      return 'nd';
    } else if (number % 10 == 3) {
      return 'rd';
    } else {
      return 'th';
    }
  };

  function isValidInt(number, min, max) {
    let parsed = parseInt(number);
    if (parsed != number) {
      return false;
    }
    if (typeof min === 'number' && parsed < min) {
      return false;
    }
    if (typeof max === 'number' && parsed > max) {
      return false;
    }
    return true;
  };

  function keyify(str) {
    return (str + "").toLowerCase().replace(/\s+/g, '');
  };

  function initCalendars() {
    let gregorian = new SEJ_Versatile_Calendar('gregorian');
    gregorian.addMonth('January', 31);
    gregorian.addMonth({
      name: 'February',
      days: (info) => (new Date(info.year, 2, 0, 0, 0, 0)).getDate()
    });
    gregorian.addMonths(
      'March', 31,
      'April', 30,
      'May', 31,
      'June', 30,
      'July', 31,
      'August', 31,
      'September', 30,
      'October', 31,
      'November', 30,
      'December', 31
    );
    const GREGORIAN_DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    gregorian.hasDayOfWeek((info) => {
      let date = new Date(info.year, info.monthIndex, info.day, 0, 0, 0);
      return GREGORIAN_DAYS_OF_WEEK[date.getDay()];
    });

    let harptos = new SEJ_Versatile_Calendar('harptos');

    harptos.addMonth('Hammer', 30);
    harptos.addDay('Midwinter');
    harptos.addMonths(
      'Alturiak', 30,
      'Ches', 30,
      'Tarsakh', 30
    );
    harptos.addDay('Greengrass');
    harptos.addMonths(
      'Mirtul', 30,
      'Kythorn', 30,
      'Flamerule', 30
    );
    harptos.addDay('Midsummer');
    harptos.addDay({
      name: 'Shieldmeet',
      present: (info) => info.year % 4 === 0
    });
    harptos.addMonths(
      'Eleasis', 30,
      'Eleint', 30
    );
    harptos.addDay('Highharvestide');
    harptos.addMonths(
      'Marpenoth', 30,
      'Uktar', 30
    );
    harptos.addDay('Feast of the Moon');
    harptos.addMonth('Nightal', 30);

    harptos.addHoliday('Spring Equinox', 3, 19);
    harptos.addHoliday('Summer Solstice', 6, 20);
    harptos.addHoliday('Autumn Equinox', 9, 21);
    harptos.addHoliday('Winter Solstice', 12, 20);

    let barovian = new SEJ_Versatile_Calendar('barovian');
    for (let i = 1; i <= 12; i++) {
      barovian.addMonth(`the ${i}${ordinal(i)} moon`, 28);
    }

    let golarion = new SEJ_Versatile_Calendar('Golarion');
    golarion.addMonths(
      'Abadius', 31,
      {
        name: 'Calistril',
        days: (info) => info.years % 8 === 0 ? 29 : 28
      },
      'Pharast', 31,
      'Gozran', 30, 
      'Desnus', 31,
      'Sarenith', 30,
      'Erastus', 31,
      'Arodus', 31,
      'Rova', 30,
      'Lamashan', 31,
      'Neth', 30,
      'Kuthona', 31
    );
    const GOLARIAN_DAYS_OF_WEEK = ['Moonday', 'Toilday', 'Wealday', 'Oathday', 'Fireday', 'Starday', 'Sunday'];
    golarion.hasDayOfWeek((info) => {
      let daysInCurrentYear = info.day;
      for (let i = 0; i < info.monthIndex; i++) {
        daysInCurrentYear += golarion.months[i].days(info);
      }
      let years = Math.abs(info.year) - 1;
      let leapYears = parseInt(years / 8);
      let daysSinceAR = Math.abs(years * 365 + leapYears + daysInCurrentYear - 1);
      let index;
      if (info.year < 0) {
        index = (6 + daysSinceAR) % 7;
      } else {
        index = daysSinceAR % 7;
      }
      return GOLARIAN_DAYS_OF_WEEK[index];
    });
    golarion.nextYear = (year) => year === -1 ? 1 : year + 1;
    golarion.previousYear = (year) => year === 1 ? -1 : year - 1;

    return {
      gregorian: gregorian,
      harptos: harptos,
      barovian: barovian,
      golarion: golarion
    };
  };

  function SEJ_Error(message) {
    this.message = message;

    this.toString = () => message;
  }

  function SEJ_Date(calendar, day, month, year) {
    let self = this;

    this.calendar = calendar;
    
    let setDayDate = function(day, year) {
      if (!calendar.isValidYear(year)) {
        throw new SEJ_Error(`the year ${year} is not valid for this calendar type`);
      }

      let info = {type: 'day', name: day, year: year, key: keyify(day)};
      let matching = calendar.days.find(d => d.match(info));

      if (!matching) {
        let validDays = calendar.days.filter(d => d.match(info)).map(d => d.name);
        if (validDays.length > 0) {
          throw new SEJ_Error(`unable to find the special day '${day}' in the year ${year}, valid days are: '${validDays.join("', '")}'`);
        } else {
          throw new SEJ_Error(`unable to find the special day '${day}' in the year ${year}, no special days exist for this year`);
        }
      }

      self.date = Object.assign({}, matching, {year: year});
    };

    let setMonthDate = function(day, month, year) {
      if (!calendar.isValidYear(year)) {
        throw new SEJ_Error(`the year ${year} is not valid for this calendar type`);
      }

      let info = {type: 'month', day: day, month: month, year: year, monthIndex: month - 1};
      let matching = calendar.months.find(m => m.match(info));

      if (!matching) {
        throw new SEJ_Error(`unable to find the day '${day}' in the month '${month}' in the year '${year}'`);
      }

      self.date = Object.assign({}, matching, {day: day, year: year});
      self.date.days = matching.days(self.date);
    };

    this.set = function(day, month, year) {
      if (typeof day === 'object' && day) {
        if (day.type === 'month') {
          setMonthDate(day.day, day.month, day.year);
        } else {
          setDayDate(day.name, day.year);
        }
      } else if (typeof day === 'string' && !isValidInt(day)) {
        if (isValidInt(month)) {
          setDayDate(day, month);
        } else {
          setDayDate(day, this.date.year);
        }
      } else if (isValidInt(day) && isValidInt(month) && isValidInt(year)) {
        setMonthDate(parseInt(day), parseInt(month), parseInt(year));
      } else if (isValidInt(day) && typeof month === 'string' && isValidInt(year)) {
        let key = keyify(month);
        let index = calendar.months.findIndex(m => m.key === key);
        if (index === -1) {
          throw new SEJ_Error(`unknown month '${month}' for the year '${year}'`);
        }
        setMonthDate(parseInt(day), index + 1, parseInt(year));
      }
    };

    this.set(day || 1, month || 1, year || 1234);

    let findNextPresent = function() {
      for (let i = self.date.timelineIndex + 1; i < calendar.timeline.length; i++) {
        if (calendar.timeline[i].present(self.date)) {
          return calendar.timeline[i];
        }
      }
      self.date.year = calendar.nextYear(self.date.year);
      return calendar.timeline.find(item => item.present(self.date));
    };

    let findPreviousPresent = function() {
      for (let i = self.date.timelineIndex - 1; i >= 0; i--) {
        if (calendar.timeline[i].present(self.date)) {
          return calendar.timeline[i];
        }
      }
      self.date.year = calendar.previousYear(self.date.year);
      for (let i = calendar.timeline.length - 1; i >= 0; i--) {
        if (calendar.timeline[i].present(self.date)) {
          return calendar.timeline[i];
        }
      }
    };

    this.next = function() {
      if (this.date.type === 'month' && this.date.day < this.date.days) {
        this.date.day++;
      } else {
        let match = findNextPresent(this.date);
        if (match.type === 'day') {
          this.date = Object.assign({}, match, {year: this.date.year});
        } else {
          this.date = Object.assign({}, match, {year: this.date.year, day: 1});
          this.date.days = match.days(this.date);
        }
      }
    };

    this.previous = function() {
      if (this.date.type === 'month' && this.date.day > 1) {
        this.date.day--;
      } else {
        let match = findPreviousPresent(this.date);
        if (match.type === 'day') {
          this.date = Object.assign({}, match, {year: this.date.year});
        } else {
          this.date = Object.assign({}, match, {year: this.date.year, day: match.days(this.date)});
          this.date.days = match.days(this.date);
        }
      }
    }

    this.toString = function() {
      if (this.date.type === 'month') {
        let weekday = calendar.dayOfWeek ? calendar.dayOfWeek(this.date) : '';
        if (weekday) { 
          weekday = `${weekday}, `;
        }
        return `${weekday}the ${this.date.day}${ordinal(this.date.day)} of ${this.date.name}, ${this.date.year}`
      } else {
        return `${this.date.name}, ${this.date.year}`
      }
    };
  };

  function SEJ_Versatile_Calendar(name) {
    let self = this;

    this.name = name;
    this.timeline = [];
    this.months = [];
    this.days = [];

    this.getItem = function(index) {
      return this.timeline[index % this.timeline.length];
    };

    let appendItem = function(item) {
      if (typeof item.present === 'undefined') {
        item.present = () => true;
      } else if (typeof item.present === 'boolean') {
        let present = item.present;
        item.present = () => present;
      }
      if (typeof item.days === 'number') {
        let days = item.days;
        item.days = () => days;
      }
      item.key = keyify(item.name);

      item.timelineIndex = self.timeline.length;
      self.timeline.push(item);

      if (item.type === 'month') {
        item.match = (info) => {
          let index = info.month - 1;
          return item.present(info) && info.type === 'month' && item.monthIndex === index && info.day <= item.days(info);
        };
        item.monthIndex = self.months.length;
        item.month = self.months.length + 1;
        if (!item.holidays) {
          item.holidays = {};
        }
        self.months.push(item);
      } else if (item.type === 'day') {
        item.match = (info) => {
          return item.present(info) && item.key == info.key;
        };

        item.dayIndex = self.days.length;
        self.days.push(item);
      }
    };

    this.addHoliday = function(name, month, day) {
      let item = this.months[month - 1];
      item.holidays[day] = name;
    };

    this.addMonth = function(name, days) {
      if (typeof name === 'string' && typeof days === 'number') {
        appendItem({
          type: 'month',
          name: name,
          days: days,
        });
      } else if (typeof name === 'object' && name) {
        name.type = 'month';
        appendItem(name);
      }
    };

    this.addMonths = function(...args) {
      while(args.length > 0) {
        let arg = args.shift();
        if (typeof arg === 'string') {
          this.addMonth(arg, args.shift());
        } else {
          this.addMonth(arg);
        }
      }
    };

    this.addDay = function(name) {
      if (typeof name === 'string') {
        appendItem({name: name, type: 'day'});
      } else {
        name.type = 'day';
        appendItem(name);
      }
    };

    this.addDays = function(...args) {
      while(args.length > 0) {
        this.addDay(args.shift());
      }
    };

    this.hasDayOfWeek = function(callback) {
      this.dayOfWeek = callback;
    };

    this.hasValidYears = function(callback) {
      this.isValidYear = callback ? ((year) => isValidInt(year) && callback(year)) : ((year) => isValidInt(year));
    };

    this.isValidYear = (year) => isValidInt(year);
    this.nextYear = (year) => year + 1;
    this.previousYear = (year) => year - 1;

  };

  function SEJ_Calendar_App() {
    let aliases = {
      '++': 'next',
      'increment': 'next',
      '--': 'previous',
      'decrement': 'previous',
      'prev': 'previous',
      'system': 'type'
    };

    let commands = [
      'display',
      'next',
      'previous',
      'help',
      'set',
      'type'
    ];

    let calendars = initCalendars();

    let isValidCalendar = (calendar) => {
      if (calendar instanceof SEJ_Versatile_Calendar) {
        return true;
      }

      calendar = keyify(calendar);
      return calendar in calendars && calendars.hasOwnProperty(calendar);
    };

    let getCalendar = (calendar) => {
      if (isValidCalendar(calendar)) {
        if (typeof calendar === 'string') {
          return calendars[keyify(calendar)];
        } else {
          return calendar;
        }
      }
    };

    this.process = function(message) {
      let args = message.content.split(' ');
      args.shift(); // Removes the !cal
      
      let command = args.shift() || 'display';
      if (aliases[command]) {
        command = aliases[command];
      }
      
      this.message = message;
      this.command = command;
      this.args = args;
      this.gm = false;


      if (commands.includes(command)) {
        try {
          this.gm = playerIsGM(message.playerid);
          this[command](message, args);
        } catch (error) {
          if (error instanceof SEJ_Error) {
            this.error(error.message);
          } else {
            throw error;
          }
        }
      } else {
        this.error(`Unknown command <code>${command}</code>.`);
      }
    };

    this.requireGM = function(command) {
      command || (command = this.command);
      if (!this.gm) {
        throw new SEJ_Error(`The <code>${this.command}</code> command is for GMs only.`);
      }
    };


    let alias = (...c) => `<i><small>Aliased by: <code>${c.join('</code>, <code>')}</code></small></i><br />`;
    let cmd = (command) => `<b><pre>${command}</pre></b>`;
    let arg = (a, type, desc) => `<li> <b>[${a}]</b> (${type}) - ${desc} </li>`;
    let sec = `<div style="margin: 0.5rem;">&nbsp;</div>`
    let gm = `<span style="font-size: 0.7em; border: 1px solid #722; background-color: #a55; color: white; border-radius: 5px; padding: 2px;">GM</span>`;
    let all = `<span style="font-size: 0.7em; border: 1px solid #272; background-color: #494; color: white; border-radius: 5px; padding: 2px;">Everyone</span>`;

    const helpMessage = `
      <div style="border: 1px solid black; background-color: white; margin-top: 1rem;">
        <div style="border-bottom: 1px solid black; margin-bottom: 1rem; padding: 1rem;">
          <big><b>Calendar Version ${SEJ_Calendar_App.VERSION}</b></big>
        </div>
        <div style="padding: 1rem;">
          ${cmd('!cal')}
          ${all} Displays the current in-game date.<br />
          ${alias('!cal display')}

          ${sec}
          ${cmd('!cal next')}
          ${gm} Advances the in-game date by 1 day.<br />
          ${alias('!cal ++', '!cal increment')}
          
          ${sec}
          ${cmd('!cal previous')}
          ${gm} Regresses the in-game date by 1 day.<br />
          ${alias('!cal --', '!cal prev', '!cal decrement')}
          
          ${sec}
          ${cmd('!cal system')}
          ${all} Displays the current calendar system.<br />
          ${alias('!cal type')}
          
          ${sec}
          ${cmd('!cal system [system]')}
          ${gm} Sets the current calendar system. The date may need to be set again after using this command.<br />
          <ul>
            ${arg('system', 'text', `the calendar system, one of: ${Object.keys(calendars).join(', ')}`)}
          </ul>
          ${alias('!cal type [system]')}
          
          ${sec}
          ${cmd('!cal set [day] [month] [year]')}
          ${gm} Sets the current in-game date.<br />
          <ul>
            ${arg('day', 'integer', 'the day of the month (usually 1-31)')}
            ${arg('month', 'integer|text', 'the month in the year (usually 1-12), or the name of the month (e.g. January)')}
            ${arg('year', 'integer', 'the year')}
          </ul>
          
          ${sec}
          ${cmd('!cal set [special day] ([year])')}
          ${gm} Sets the current in-game date using the name of a day that falls between months, such as with the Harptos calendar.<br />
          <ul>
            ${arg('special day', 'text', 'the name of the special day, with or without spaces (e.g. Feast of the Moon, feastofthemoon)')}
            ${arg('year', 'optional, integer', 'the year')}
          </ul>

          ${sec}
          ${cmd('!cal help')}
          ${all} Displays this help message.
        </div>
      </div>
    `.replace(/\n|\r/g, ' ');

    this.help = function(message) {
      sendChat('Calendar', `/w ${message.who} ${helpMessage}`);      
    };

    this.type = function(message, args) {
      if (args.length > 0) {
        this.requireGM('type [calender type]');
        let type = args.shift();
        if (isValidCalendar(type)) {
          let previousType = this.date.calendar.name;
          let previousDate = this.date.toString();
          try {
            this.date = new SEJ_Date(getCalendar(type), this.date.date.day, this.date.date.month, this.date.date.year);
          } catch {
            this.date = new SEJ_Date(getCalendar(type), 1, 1, 1234);
          }
          this.save();
          sendChat('Calendar', `/w ${message.who} The calendar type has changed from <code>${previousType}</code> (${previousDate}) to <code>${type}</code> (${this.date.toString()}).`);
        } else {
          throw new SEJ_Error(`unknown calendar type '${type}', allowed values are: ${Object.keys(calendars).join(', ')}`);
        }
      } else {
        sendChat('Calendar', `The current calendar type is <code>${this.date.calendar.name}</code>.`);
      }
    };

    this.next = function(message) {
      this.requireGM();
      this.date.next();
      this.save();
      sendChat('Calendar', `${message.who} has incremented the date to <i>${this.date.toString()}</i>.`);
    };

    this.previous = function(message) {
      this.requireGM();
      this.date.previous();
      this.save();
      sendChat('Calendar', `${message.who} has decremented the date to <i>${this.date.toString()}</i>.`);
    };

    this.set = function(message, args) {
      this.requireGM();
      if (isValidInt(args[0])) {
        this.date.set(args[0], args[1], args[2]);
      } else if (isValidInt(args[args.length - 1])) {
        let year = args.pop();
        let day = args.join(' ');
        this.date.set(day, year);
      } else {
        throw new SEJ_Error('Invalid set arguments. Type `!cal help` for usage.');
      }
      this.save();
      sendChat('Calendar', `${message.who} has set the in-game date to <i>${this.date.toString()}</i>.`);
    };


    this.display = function() {
      sendChat('Calendar', `The current in-game date is <i>${this.date.toString()}</i>.`);
    };

    this.error = function(message) {
      sendChat('Calendar', `/w ${this.message.who} (error): ${message} - Use <code>!cal help</code> to see command syntax.`);
    };

    this.save = function() {
      let info = Object.assign({}, this.date.date);
      info.calendar = this.date.calendar.name;
      info.version = SEJ_Calendar_App.VERSION;
      state.SEJ_Calendar_Data = info;
    };

    let data = state.SEJ_Calendar_Data || {};

    if (data.calendar && data.version === '1.1') {
      this.date = new SEJ_Date(getCalendar(data.calendar), data);
    } else if (data.calendar && isValidInt(data.day) && isValidInt(data.month) && isValidInt(data.year) && isValidCalendar(data.calendar)) {
      this.date = new SEJ_Date(getCalendar(data.calendar), data.day, data.month + 1, data.year);
    } else if (data.calendar && data.day && !isValidInt(data.day) && typeof data.day === 'string' && isValidInt(data.year) && isValidCalendar(data.calendar)) {
      this.date = new SEJ_Date(getCalendar(data.calendar), data.day, data.year);
    } else {
      let tmp = new Date();
      this.date = new SEJ_Date(calendars.gregorian, tmp.getDate(), tmp.getMonth() + 1, tmp.getFullYear());
      this.save();
      sendChat('Calendar', '/w gm The calendar app has set an initial date. See <code>!cal help</code> for usage information.');
    }
  };

  SEJ_Calendar_App.VERSION = '1.1';

  on('ready', ()=>{
    let app = new SEJ_Calendar_App();

    on('chat:message', message => {

      if ('api' === message.type && message.content) {
        let match = message.content.match(/^!cal(\s?)(.*)/);
        if (match) {
          app.process(message);
        }
      }
    });
  });

})();