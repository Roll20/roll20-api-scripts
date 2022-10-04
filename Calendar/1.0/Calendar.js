(function(SEJ) {
  SEJ.error = function(action, message) {
    sendChat('Calendar [error]', `/w ${action.who} ${message}`);
    return false;
  };

  SEJ.public = function(message) {
    sendChat('Calendar', message)
  };

  SEJ.private = function(action, message) {
    sendChat('Calendar', `/w ${action.who} ${message}`);
  };

  SEJ.ordinal = function(number) {
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
  }

  SEJ.isValidInt = function(number, min, max) {
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

  SEJ.isGM = function(action) {
    return playerIsGM(action.playerid);
  };

  function SEJ_Harptos_Calendar(data) {
    this.day = parseInt(data.day) || 1;
    this.month = parseInt(data.month) || 1;
    this.year = parseInt(data.year) || 1500;

    if (this.day < 1) {
      this.day = 1;
    } else if (this.day > 32) {
      this.day = 32;
    }

    if (this.month < 0) {
      this.month = 1;
    } else if (this.month > 11) {
      this.month = 11;
    }

    let months = [
      'Hammer',
      'Alturiak',
      'Ches',
      'Tarsakh',
      'Mirtul',
      'Kythorn',
      'Flamerule',
      'Eleasis',
      'Eleint',
      'Marpenoth',
      'Uktar',
      'Nightal'
    ];

    this.getHoliday = function() {
      if (this.day == 31 && this.month == 0) {
        return 'Midwinter';
      } else if (this.day == 19 && this.month == 2) {
        return 'Spring Equinox';
      } else if (this.day == 31 && this.month == 3) {
        return 'Greengrass';
      } else if (this.day == 20 && this.month == 5) {
        return 'Summer Solstice';
      } else if (this.day == 31 && this.month == 6) {
        return 'Midsummer';
      } else if (this.day == 32 && this.month == 6) {
        return 'Shieldmeet';
      } else if (this.day == 21 && this.month == 8) {
        return 'Autumn Equinox';
      } else if (this.day == 31 && this.month == 8) {
        return 'Highharvestide';
      } else if (this.day == 31 && this.month == 10) {
        return 'Feast of the Moon';
      } else if (this.day == 20 && this.month == 11) {
        return 'Winter Solstice';
      }

      return null;
    };

    this.increment = function(action) {
      if (this.day == 30 && this.month == 0) {
        this.day = 31;
      } else if (this.day == 30 && this.month == 3) {
        this.day = 31;
      } else if (this.day == 30 && this.month == 6) {
        this.day = 31;
      } else if (this.day == 31 && this.month == 6 && this.year % 4 == 0) {
        this.day = 32;
      } else if (this.day == 30 && this.month == 8) {
        this.day = 31;
      } else if (this.day == 30 && this.month == 10) {
        this.day = 31;
      } else if (this.day < 30) {
        this.day++;
      } else if (this.month < 11) {
        this.day = 1;
        this.month++;
      } else {
        this.day = 1;
        this.month = 0;
        this.year++;
      }
    };

    this.decrement = function(action) {
      if (this.day == 1 && this.month == 1) {
        this.day = 31;
        this.month = 0;
      } else if (this.day == 1 && this.month == 4) {
        this.day = 31;
        this.month = 3;
      } else if (this.day == 1 && this.month == 7 && this.year % 4 == 0) {
        this.day = 32;
        this.month = 6;
      } else if (this.day == 1 && this.month == 7) {
        this.day = 31;
        this.month = 6;
      } else if (this.day == 1 && this.month == 9) {
        this.day = 31;
        this.month = 8;
      } else if (this.day == 1 && this.month == 11) {
        this.day = 31;
        this.month = 10;
      } else if (this.day == 1) {
        this.day = 30;
        
        if (this.month == 0) {
          this.month = 11;
          this.year--;
        } else {
          this.month--;
        }
      } else {
        this.day--;
      }
    };

    this.set = function(action) {
      let day = action.args[0];
      let month = action.args[1];
      let year = action.args[2];

      if (SEJ.isValidInt(day, 1, 30) && SEJ.isValidInt(month, 1, 12) && SEJ.isValidInt(year)) {
        this.holiday = false;
        this.day = parseInt(day);
        this.month = parseInt(month) - 1;
        this.year = parseInt(year);
      } else if (day && parseInt(day) != day) {
        let specialYear = action.args.pop();

        if (!SEJ.isValidInt(specialYear)) {
          return SEJ.error(`Unknown year ${specialYear}.`);
        }

        let specialDay = action.args.join('').toLowerCase().trim();
        specialYear = parseInt(specialYear) || this.year;
        
        if (specialDay === 'midwinter') {
          this.holiday = 'Midwinter';
          this.day = 31;
          this.month = 0;
          this.year = specialYear;
        } else if (specialDay === 'greengrass') {
          this.holiday = 'Greengrass';
          this.day = 31;
          this.month = 3;
          this.year = specialYear;
        } else if (specialDay === 'midsummer') {
          this.holiday = 'Midsummer';
          this.day = 31;
          this.month = 6;
          this.year = specialYear;
        } else if (specialDay === 'shieldmeet' && (specialYear % 4 === 0)) {
          this.holiday = 'Shieldmeet';
          this.day = 32;
          this.month = 6;
          this.year = specialYear;
        } else if (specialDay === 'highharvestide') {
          this.holiday = 'Highharvestide';
          this.day = 31;
          this.month = 8;
          this.year = specialYear;
        } else if (specialDay === 'feastofthemoon') {
          this.holiday = 'Feast of the Moon';
          this.day = 31;
          this.month = 10;
          this.year = specialYear;
        } else {
          return SEJ.error(action, `Unknown special day '${action.args.join(' ')}', expecting one of: 'Midwinter', 'Greengrass', 'Midsummer', 'Shieldmeet', 'Highharvestide', 'Feast of the Moon'.`);
        }
      } else {
        return SEJ.error(action, `
          <b>Usage:</b><br /><br />
          <b>!cal set <i>[day]</i>, <i>[month]</i>, <i>[year]</i></b> where <i>[day]</i> is an integer from 1-30, <i>[month]</i> is an integer from 1-12, and <i>[year]</i> is an integer.<br /><br />
          <b>!cal set <i>[day]</i>(, <i>[year]</i>)</b> where <i>[day]</i> is a special day in the list 'Midwinter', 'Greengrass', 'Midsummer', 'Shieldmeet', 'Highharvestide', 'Feast of the Moon', and (optional) <i>[year]</i> is a valid integer.
        `)
      }
    };

    this.save = function() {
      state.SEJ_Calendar_Data = {
        calendar: 'harptos',
        day: this.day,
        month: this.month,
        year: this.year
      };
    };

    this.toString = function() {
      let holiday = this.getHoliday();
      if (this.day > 30) {
        return `${holiday}, ${this.year}`
      } else if (holiday) {
        return `${this.day}${SEJ.ordinal(this.day)} of ${months[this.month]} (${holiday}), ${this.year}`;
      } else {
        return `${this.day}${SEJ.ordinal(this.day)} of ${months[this.month]}, ${this.year}`;
      }
    };
  };

  function SEJ_Barovian_Calendar(data) {
    this.day = parseInt(data.day) || 7;
    this.month = parseInt(data.month) || 4;
    this.year = parseInt(data.year) || 735;

    if (this.day > 28) {
      this.day = 28;
    } else if (this.day < 1) {
      this.day = 1;
    }

    if (this.month > 12) {
      this.month = 12;
    } else if (this.month < 1) {
      this.month = 1;
    }

    this.set = function(action) {
      let day = parseInt(action.args[0]);
      let month = parseInt(action.args[1]);
      let year = parseInt(action.args[2]);

      if (!SEJ.isValidInt(day, 1, 28) || !SEJ.isValidInt(month, 1, 12) || !SEJ.isValidInt(year)) {
        SEJ.error(action, 'Usage: <b>!cal set <i>[day]</i> <i>[month]</i> <i>[year]</i></b>, where <i>[day]</i> is an integer from 1-28, <i>[month]</i> is an integer from 1-12, and <i>[year]</i> is an integer.');
      } else {
        this.day = day;
        this.month = month;
        this.year = year;
      }
    };

    this.increment = function(action) {
      if (this.day < 28) {
        this.day++;
      } else if (this.month < 12) {
        this.day = 1;
        this.month++;
      } else {
        this.day = 1;
        this.month = 1;
        this.year++;
      }
    };

    this.decrement = function(action) {
      if (this.day > 1) {
        this.day--;
      } else if (this.month > 1) {
        this.day = 28;
        this.month--;
      } else {
        this.day = 28;
        this.month = 12;
        this.year--;
      }
    };

    this.toString = function() {
      return `the ${this.day}${SEJ.ordinal(this.day)} day of the ${this.month}${SEJ.ordinal(this.month)} moon, ${this.year}`;
    };

    this.save = function() {
      state.SEJ_Calendar_Data = {
        calendar: 'barovian',
        day: this.day,
        month: this.month,
        year: this.year
      };
    };
  };

  function SEJ_Gregorian_Calendar(data) {
    let date = new Date();

    let day = parseInt(data.day) || date.getDate();
    let month = parseInt(data.month) || date.getMonth();
    let year = parseInt(data.year) || date.getFullYear();

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (day > 28) {
      day = 28;
    } else if (day < 1) {
      day = 1;
    }

    if (month > 11) {
      month = 11;
    } else if (month < 0) {
      month = 0;
    }

    date = new Date(year, month, day, 0, 0, 0);

    this.set = function(action) {
      day = parseInt(action.args[0]);
      month = parseInt(action.args[1]);
      year = parseInt(action.args[2]);

      if (!SEJ.isValidInt(day, 1, 31) || !SEJ.isValidInt(month, 1, 12) || !SEJ.isValidInt(year)) {
        SEJ.error(action, 'Usage: <b>!cal set <i>[day]</i> <i>[month]</i> <i>[year]</i></b>, where <i>[day]</i> is an integer from 1-31, <i>[month]</i> is an integer from 1-12, and <i>[year]</i> is an integer.');
      } else {
        date = new Date(year, month - 1, day, 0, 0, 0);
      }
    };

    this.increment = function() {
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0);
    };

    this.decrement = function() {
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, 0, 0, 0);
    };

    this.toString = function() {
      return `the ${date.getDate()}${SEJ.ordinal(date.getDate())} of ${months[date.getMonth()]}, ${date.getFullYear()}`
    };

    this.save = function() {
      state.SEJ_Calendar_Data = {
        calendar: 'gregorian',
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear()
      };
    }
  };


  function SEJ_Calendar() {

    let self = this;
    let calendar = null;

    if (state.SEJ_Calendar_Data) {
      let type = state.SEJ_Calendar_Data.calendar;

      if (type == 'harptos') {
        calendar = new SEJ_Harptos_Calendar(state.SEJ_Calendar_Data);
      } else if (type == 'barovian') {
        calendar = new SEJ_Barovian_Calendar(state.SEJ_Calendar_Data);
      } else if (type == 'gregorian') {
        calendar = new SEJ_Gregorian_Calendar(state.SEJ_Calendar_Data);
      }
    } 
    
    if (!calendar) {
      calendar = new SEJ_Harptos_Calendar({});
      calendar.save();
    }

    this.process = function(message, match) {
      let split = match[2].split(" ");
      let command = split[0];
      
      if (!command) {
        command = 'display';
      }

      let args = split.slice(1);
      let player = getObj('player', message.playerid);

      let action = {message, args, player, command, who: message.who, playerid: message.playerid};

      // sendChat('Calendar', `/w gm (${action.who}), ${command} with ${args.length} args: ${args.join(', ')}`);

      if (command === 'display') {
        sendChat('Calendar', `The current in-game date is <i>${calendar.toString()}</i>.`);
      } else if (command == 'type') {
        if (args[0]) {
          if (!SEJ.isGM(action)) {
            sendChat('Calendar', `/w ${action.who} The <b>type [type]</b> action is a GM-only command.`);
          } else if (args[0] && args[0].toLowerCase().trim() == 'barovian') {
            calendar = new SEJ_Barovian_Calendar(state.SEJ_Calendar_Data);
            calendar.save();
            sendChat('Calendar', `/w ${action.who} The calendar type has been set to <b>barovian</b>: ${calendar.toString()}`);
          } else if (args[0] && args[0].toLowerCase().trim() == 'harptos') {
            calendar = new SEJ_Harptos_Calendar(state.SEJ_Calendar_Data);
            calendar.save();
            sendChat('Calendar', `/w ${action.who} The calendar type has been set to <b>harptos</b>: ${calendar.toString()}`);
          } else if (args[0] && args[0].toLowerCase().trim() == 'gregorian') {
            calendar = new SEJ_Gregorian_Calendar(state.SEJ_Calendar_Data);
            calendar.save();
            sendChat('Calendar', `/w ${action.who} The calendar type has been set to <b>gregorian</b>: ${calendar.toString()}`);
          }
        } else {
          sendChat('Calendar', `The current calendar system is <b>${state.SEJ_Calendar_Data.calendar}</b>.`)
        }
      } else if (command === 'set') {
        if (SEJ.isGM(action)) {
          if (calendar.set(action) !== false) {
            calendar.save();
            sendChat('Calendar', `<b>${action.who}</b> has just set the date to <i>${calendar.toString()}</i>.`);
          }
        } else {
          sendChat('Calendar', `/w ${action.who} The <b>set</b> action is a GM-only command.`);
        }
      } else if (command === '++' || command === 'increment' || command === 'next') {
        if (SEJ.isGM(action)) {
          calendar.increment(action);
          calendar.save();
          sendChat('Calendar', `<b>${action.who}</b> has just incremented the date to <i>${calendar.toString()}</i>.`);
        } else {
          sendChat('Calendar', `/w ${action.who} The <b>increment</b> action is a GM-only command.`);
        }
      } else if (command === '--' || command === 'decrement' || command === 'previous') {
        if (SEJ.isGM(action)) {
          calendar.decrement(action);
          calendar.save();
          sendChat('Calendar', `<b>${action.who}</b> has just decremented the date to <i>${calendar.toString()}</i>.`);
        } else {
          sendChat('Calendar', `/w ${action.who} The <b>decrement</b> action is a GM-only command.`);
        }
      }
    };
  };


  on('ready', ()=>{

    let calendar = new SEJ_Calendar();

    on('chat:message', message => {
      if ('api' === message.type && message.content) {
        let match = message.content.match(/^!cal(\s?)(.*)/);
        if (match) {
          calendar.process(message, match);
        }
      }
    });
  });

})({});
