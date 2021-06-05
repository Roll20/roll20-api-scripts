/**
 * Calendar Script
 * 
 * 
 * This script adds an easy way to keep track of the in-game date. It
 * was built to be simple, not robust.
 * 
 * 
 * Calendar.js
 * Version: 1.2
 * Author: Steven Jeffries
 * Last Updated: June 1st, 2021
 */


// IIFE to keep global scope clean.
(function() {

  const VERSION = '1.2';

  /**
   * Helper function to give the ordinal indicator of a number.
   * @param {integer} number 
   * @returns the ordinal indicator of the number
   */
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

  /**
   * Checks if a given thing is a valid integer, optionally within a range.
   * @param {*} number the thing to check
   * @param {integer} [min] the smallest the integer can be
   * @param {*} [max] the largest the integer can be
   * @returns 
   */
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

  /**
   * Turns a string into a "key" of that string, removing whitespace and
   * turning it into lowercase so that "Feast of the Moon" and "feastofthemoon"
   * could be matched to each other easily.
   * 
   * @param {string} str the string to keyify
   * @returns the keyified string
   */
  function keyify(str) {
    return (str + "").toLowerCase().replace(/\s+/g, '');
  };

  /**
   * This is a custom calendar class that keeps track of the months and days
   * in a given year. All calendars are an instance of this class.
   * @param {string} name the name of the calendar
   */
  function SEJ_Versatile_Calendar(name) {
    let self = this;

    this.name = name;

    // The timeline is filled with months and special days. This is used to 
    // figure out the next or previous day.
    this.timeline = [];

    // This holds just the months.
    this.months = [];

    // This holds just the special days (days between months).
    this.days = [];

    /**
     * A helper function that gets a timeline item given an index. Large
     * indexes can be given as it mods it with the length.
     * @param {integer} index the index of the item
     * @returns the timeline item
     */
    this.getItem = function(index) {
      return this.timeline[index % this.timeline.length];
    };

    /**
     * Adds a timeline item to its respective containers, transforming it
     * into an object with all of the correct properties set.
     * @param {Object} item the timeline item
     */
    let appendItem = function(item) {

      // A timeline item's `present` function is used to determine whether or
      // not that timeline item is present in a given year.
      // If it's not specified, it is assumed that the timeline item is present
      // in every year.
      if (typeof item.present === 'undefined') {
        item.present = () => true;
      } else if (typeof item.present === 'boolean') {
        let present = item.present;
        item.present = () => present;
      }

      // The days property of a timeline (month) item is a function that takes in some
      // information and determines how many days a month has in the given year.
      // If it is just a number, it is assumed to always have that many days.
      if (typeof item.days === 'number') {
        let days = item.days;
        item.days = () => days;
      }

      // The keyified name is what is used to compare names from user input so that
      // whitespace and case don't matter.
      item.key = keyify(item.name);

      // The timeline item's position in the timeline array is set here for convenience.
      item.timelineIndex = self.timeline.length;
      self.timeline.push(item);

      if (item.type === 'month') {
        // A timeline (month) item's match method is probably poorly named, but it is
        // used to determine whether a given date matches to (belongs in) the month.
        item.match = (info) => {
          let index = info.month - 1;
          return item.present(info) && info.type === 'month' && item.monthIndex === index && info.day <= item.days(info);
        };

        // The zero based month index for its position in the months array.
        item.monthIndex = self.months.length;
        // The one based month index for input/output to/from the user.
        item.month = self.months.length + 1;

        // Again, I'm not doing anything with holidays yet, but the month object holds them.
        if (!item.holidays) {
          item.holidays = {};
        }

        self.months.push(item);
      } else if (item.type === 'day') {
        // Similar to the month's match method.
        item.match = (info) => {
          return item.present(info) && item.key == info.key;
        };

        item.dayIndex = self.days.length;
        self.days.push(item);
      }
    };

    /**
     * Adds a holiday to a month. Not currently used, may be changed later.
     * @param {string} name the name of the holiday
     * @param {integer} month the month the holiday is in
     * @param {integer} day the day of the month the holiday takes place in
     */
    this.addHoliday = function(name, month, day) {
      let item = this.months[month - 1];
      item.holidays[day] = name;
    };

    /**
     * Adds a month to the calendar
     * @param {string|Object} name the name of the month or an object describing the month
     * @param {integer|function} days the number of days in the month, or a function returning the number of days in a month
     */
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

    /**
     * Adds multiple months.
     * @param  {...any} args either an object describing the month, or a string followed by a number
     */
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

    /**
     * Adds a special day (a day between months) to the calendar.
     * @param {string|Object} name the name of the special day, or an object describing it
     */
    this.addDay = function(name) {
      if (typeof name === 'string') {
        appendItem({name: name, type: 'day'});
      } else {
        name.type = 'day';
        appendItem(name);
      }
    };

    /**
     * Adds special days to the calendar.
     * @param  {...any} args either strings or objects describing special days
     */
    this.addDays = function(...args) {
      while(args.length > 0) {
        this.addDay(args.shift());
      }
    };

    /**
     * Indicates that this calendar has days of the week.
     * @param {function} callback a function callback that returns the day of the week given the current date
     */
    this.hasDayOfWeek = function(callback) {
      this.dayOfWeek = callback;
    };

    /**
     * Indicates that this calendar has valid years, useful if there is a gap.
     * @param {function} callback returns whether a given year is valid
     */
    this.hasValidYears = function(callback) {
      this.isValidYear = callback ? ((year) => isValidInt(year) && callback(year)) : ((year) => isValidInt(year));
    };

    this.isValidYear = (year) => isValidInt(year);
    this.nextYear = (year) => year + 1;
    this.previousYear = (year) => year - 1;
  };


  /**
   * Creates the calendars that this script will be using.
   * 
   * @returns the initialized calendars
   */
  function initCalendars() {

    // Creates the Gregorian calendar.
    let gregorian = new SEJ_Versatile_Calendar('gregorian');
    gregorian.addMonth('January', 31);
    gregorian.addMonth({
      name: 'February',

      // The 0s here are important, otherwise timezone offsets can change the date.
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


    // Creates the Harptos Calendar
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
      // Shieldmeet only occurs once every 4 years, on years divisible by 4
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

    // I'm not doing anything with the holidays yet, but I may one day.
    harptos.addHoliday('Spring Equinox', 3, 19);
    harptos.addHoliday('Summer Solstice', 6, 20);
    harptos.addHoliday('Autumn Equinox', 9, 21);
    harptos.addHoliday('Winter Solstice', 12, 20);

    // Creates the Barovian calendar.
    let barovian = new SEJ_Versatile_Calendar('barovian');
    for (let i = 1; i <= 12; i++) {
      // The Barovian calendar is really easy.
      barovian.addMonth(`the ${i}${ordinal(i)} moon`, 28);
    }

    // Creates the Golarion calendar.
    let golarion = new SEJ_Versatile_Calendar('Golarion');
    golarion.addMonths(
      'Abadius', 31,
      {
        name: 'Calistril',
        // The Golarion leap year happens once every 8 years.
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

    // This was a pain in the butt and I'm sure it can be done in a better way.
    // Basically, what I'm doing here is finding out how many days have passed
    // since 1/1/1 (or how many days need to pass to get to that point), so that
    // I can figure out what day of the week it is.
    golarion.hasDayOfWeek((info) => {

      // This is how many days have already elapsed this year.
      let daysInCurrentYear = info.day;
      for (let i = 0; i < info.monthIndex; i++) {
        daysInCurrentYear += golarion.months[i].days(info);
      }

      // This is how many years have elapsed since 1/1/1
      let years = Math.abs(info.year) - 1;

      // This is how many leapyears have happened since 1/1/1
      let leapYears = parseInt(years / 8);

      // This is how many days have passed since 1/1/1
      let daysSinceAR = Math.abs(years * 365 + leapYears + daysInCurrentYear - 1);

      // The index for the golarion days of the week (0 = Moonday, etc.)
      let index;
      if (info.year < 0) {
        // If the year is negative, shift the date by 6.
        index = (6 + daysSinceAR) % 7;
      } else {
        // If the year is positive, the date is already set.
        index = daysSinceAR % 7;
      }

      return GOLARIAN_DAYS_OF_WEEK[index];
    });

    // Since the Golarion calendar does not have a year 0, I set up
    // custom next/previous year functions to skip it.
    golarion.nextYear = (year) => year === -1 ? 1 : year + 1;
    golarion.previousYear = (year) => year === 1 ? -1 : year - 1;

    return {
      gregorian: gregorian,
      harptos: harptos,
      barovian: barovian,
      golarion: golarion
    };
  };

  /**
   * A custom error class that can be thrown and displayed to the user.
   * @param {string} message the error message
   */
  function SEJ_Error(message) {
    this.message = message;

    this.toString = () => message;
  }

  /**
   * An SEJ_Date is a specific instance of a date within a calendar system.
   * 
   * This is the object that is meant to be manipulated in order to change the dates.
   * It is agnostic of which specific calendar system is being used.
   * 
   * @param {SEJ_Versatile_Calendar} calendar the calendar this date exists in
   * @param {integer|Object} day the day to set the calendar to, or an object with the date info
   * @param {integer|string} month the month to set the date to
   * @param {integer} year the year to set the date to
   */
  function SEJ_Date(calendar, day, month, year) {
    let self = this;

    this.calendar = calendar;
    
    // Helper function to set the date to a special day.
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

    // Helper function to set the date to a day within a month.
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

    // Sets the current date given a day/month/year, or an object
    // containing the info.
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

    // Sets the initial date.
    this.set(day || 1, month || 1, year || 1234);

    // This finds the next present timeline object in the calendar for the given year.
    // It assumes that something will be present either this year or next year.
    let findNextPresent = function() {
      for (let i = self.date.timelineIndex + 1; i < calendar.timeline.length; i++) {
        if (calendar.timeline[i].present(self.date)) {
          return calendar.timeline[i];
        }
      }
      self.date.year = calendar.nextYear(self.date.year);
      return calendar.timeline.find(item => item.present(self.date));
    };

    // Finds the previous timeline object in the calendar for the given year.
    // It assumes that something will be present either this year or the previous one.
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

    // Adds a number of days to the current date.
    this.add = function(numDays) {
      if (!isValidInt(numDays, 1)) {
        throw new SEJ_Error(`the number of days given must be a positive integer, not '${numDays}'`);
      }
      numDays = parseInt(numDays);

      // I don't know if this is needed, but I'm using a loop to figure things out, so I'm
      // limiting it. I've tested it up to 10 million days.
      if (numDays > 100000) {
        throw new SEJ_Error(`the add command only supports adding up to 100,000 days`);
      }

      while (numDays > 0) {
        if (this.date.type === 'month' && this.date.day + numDays <= this.date.days) {
          setMonthDate(this.date.day + numDays, this.date.month, this.date.year);
          numDays = 0;
        } else if (this.date.type === 'month') {
          numDays -= this.date.days - this.date.day + 1;
          this.date.day = this.date.days;
          this.next();
        } else if (this.date.type === 'day') {
          numDays--;
          this.next();
        } else {
          throw `unexpected date type '${this.date.type}'`;
        }
      }
    };

    // Subtracts a number of days from the current date.
    this.subtract = function(numDays) {
      if (!isValidInt(numDays, 1)) {
        throw new SEJ_Error(`the number of days given must be a positive integer, not '${numDays}'`);
      }
      numDays = parseInt(numDays);
      if (numDays > 100000) {
        throw new SEJ_Error(`the add command only supports adding up to 100,000 days`);
      }

      while (numDays > 0) {
        if (this.date.type === 'month' && this.date.day > numDays) {
          setMonthDate(this.date.day - numDays, this.date.month, this.date.year);
          numDays = 0;
        } else if (this.date.type === 'month') {
          numDays -= this.date.day;
          this.date.day = 1;
          this.previous();
        } else if (this.date.type === 'day') {
          numDays--;
          this.previous();
        } else {
          throw `unexpected date type '${this.date.type}'`;
        }
      }
    };

    // Advances the date by one day.
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

    // Goes back in time by one day.
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

    // Turns this date into a string.
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

  /**
   * This is the app that processes the user's input.
   */
  function SEJ_Calendar_App() {

    // Set up aliases for commands here.
    let aliases = {
      '++': 'next',
      'increment': 'next',
      '--': 'previous',
      'decrement': 'previous',
      'prev': 'previous',
      'system': 'type',
      '+=': 'add',
      '-=': 'subtract'
    };

    // The list of approves commands, which are also instance methods of this class.
    let commands = [
      'display',
      'next',
      'previous',
      'help',
      'set',
      'type',
      'add',
      'subtract'
    ];

    let calendars = initCalendars();

    // Checks if the given string or calendar instance is a valid calendar.
    let isValidCalendar = (calendar) => {
      if (calendar instanceof SEJ_Versatile_Calendar) {
        return true;
      }

      calendar = keyify(calendar);
      return calendar in calendars && calendars.hasOwnProperty(calendar);
    };

    // Gets a calendar given a string or calendar instance.
    let getCalendar = (calendar) => {
      if (isValidCalendar(calendar)) {
        if (typeof calendar === 'string') {
          return calendars[keyify(calendar)];
        } else {
          return calendar;
        }
      }
    };

    // Processes the api message.
    // This function assumes that the message is a calendar command.
    this.process = function(message) {
      let args = message.content.split(' ');
      args.shift(); // Removes the !cal
      
      // The default (empty) command is to display.
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
            // Instances of an SEJ_Error are displayed to the user as they are
            // expected (potential) errors, usually resulting from incorrect user
            // input.
            this.error(error.message);
          } else {
            // All other error instances are unexpected, and should be thrown.
            throw error;
          }
        }
      } else {
        this.error(`Unknown command <code>${command}</code>.`);
      }
    };

    // Requires a GM for a specific command. If no command text is given, then
    // it uses the name of the current command.
    this.requireGM = function(command) {
      command || (command = this.command);
      if (!this.gm) {
        throw new SEJ_Error(`The <code>${command}</code> command is for GMs only.`);
      }
    };


    // The commands start here: --------------------------------------------------


    // Helper functions for generating the help message.
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
          ${cmd('!cal add [number of days]')}
          ${gm} Advances the in-game date by a given number of days. <br />
          <ul>
            ${arg('number of days', 'integer (positive)', 'the number of days to advance the date by')}
          </ul>
          ${alias('!cal += [number of days]', '!cal set +[number of days]')}

          ${sec}
          ${cmd('!cal subtract [number of days]')}
          ${gm} Decreases the in-game date by a given number of days. <br />
          <ul>
            ${arg('number of days', 'integer (positive)', 'the number of days to decrease the date by')}
          </ul>
          ${alias('!cal -= [number of days]', '!cal set -[number of days]')}
          
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
          ${cmd('!cal set &lt;+-&gt;[number of days]')}
          ${gm} Depending on whether you prepend a <b>+</b> or a <b>-</b> to the number, adds or subtracts a number of days from the current in-game date.<br />
          <ul>
            ${arg('number of days', 'integer', 'the number of days to add or subtract from the current in-game date')}
          </ul>
          ${alias('!cal add [number of days]', '!cal += [number of days]', '!cal subtract [number of days]', '!cal -= [number of days]')}

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
          // The previous date and type are captured and displayed along with
          // this command because it doesn't guarantee a smooth transition from
          // one calendar system to the other, so the user may want to go back.
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

    this.add = function(message, args) {
      this.requireGM();
      this.date.add(args[0]);
      this.save();
      let s = parseInt(args[0]) === 1 ? '' : 's';
      sendChat('Calendar', `${message.who} has advanced the date by ${args[0]} day${s} to <i>${this.date.toString()}</i>.`);
    };

    this.subtract = function(message, args) {
      this.requireGM();
      this.date.subtract(args[0]);
      this.save();
      let s = parseInt(args[0]) === 1 ? '' : 's';
      sendChat('Calendar', `${message.who} has decreased the date by ${args[0]} day${s} to <i>${this.date.toString()}</i>.`);
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

      let match = (args[0] || '').match(/([+-])(\d+)/);
      if (match && match[1] === '+') {
        this.date.add(match[2]);
      } else if (match && match[1] === '-') {
        this.date.subtract(match[2]);
      } else if (isValidInt(args[0])) {
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

    // The commands end here: ----------------------------------------------------


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

    if (data.calendar && (data.version === '1.1' || data.version === '1.2')) {
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

  SEJ_Calendar_App.VERSION = VERSION;

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