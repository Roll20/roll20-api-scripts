//////////
// Hourglass Tabletop Timer
// By Déja Augustine (a.k.a. Kertész)
//
// How to Use
// 1. Add a token to the board with "hourglass" in the nameplate
// 2. Use one of the !hg commands below to get things rolling
//
// Start timer:
// !hg start <seconds>
// !hg start <minutes>:<seconds>
// !hg start <hours>:<minutes>:<seconds>
//
// Pause timer:
// !hg pause
//
// Resume paused timer:
// !hg start
//
// Stop timer:
// !hg stop
//
//////////

var hourglass = {
  duration: 0,
  interval: 0,
  remaining: 0,
  paused: true,
  timeout: 0,
  who: "gm"
};

const setBars = function(obj, seconds) {
  obj.set("bar1_value", seconds / 3600);
  seconds = seconds % 3600;

  obj.set("bar2_value", seconds / 60);
  seconds = seconds % 60;

  obj.set("bar3_value", seconds);
};

const resetHourglass = function(obj) {
  obj.set("status_dead",true);
  obj.set("rotation", 0);
};

const updateHourglass = function(obj) {
  obj.set("rotation", Math.abs(hourglass.remaining % 360));
  setBars(obj, hourglass.remaining);
};

const tick = function(obj) {
  hourglass.remaining -= 1;

  if(hourglass.remaining <= 0) {
    stopHourglass(obj);
    resetHourglass(obj);
  } else {
    updateHourglass(obj);
  }
};

const timesUp = function(obj) {
  hourglass.remaining = 0;

  stopHourglass();
  resetHourglass(obj);
  setBars(obj, 0);
};

const stopHourglass = function() {
  hourglass.paused = true;

  clearInterval(hourglass.interval);
  clearTimeout(hourglass.timeout);
};

const startHourglass = function(obj, timeparts) {
  if (hourglass.paused === true) {
    if (hourglass.remaining <= 0) {
      const seconds = parseInt(timeparts[0] || 0);
      const minutes = parseInt(timeparts[1] || 0);
      const hours   = parseInt(timeparts[2] || 0);

      obj.set("bar1_max", '');
      obj.set("bar2_max", '');
      obj.set("bar3_max", '');

      if (hours > 0) {
        obj.set("bar1_max", hours);
        obj.set("bar2_max", 60);
      } else if (minutes > 0) {
        obj.set("bar2_max", minutes);
      }

      obj.set("bar3_max", 60);

      printMessage("<p>New Hourglass:</p><ul><li>Hours: " + hours + "</li><li>Minutes: " + minutes + "</li><li>Seconds: " + seconds + "</li></ul>", false);
      hourglass.remaining = hours * 3600 + minutes * 60 + seconds;
    }

    resetHourglass(obj);

    obj.set("status_dead",false);
    updateHourglass(obj);

    hourglass.interval = setInterval(function() { tick(obj); }, 1000);
    hourglass.timeout = setTimeout(function() { timesUp(obj); }, 1000 * hourglass.remaining);

    hourglass.paused = false;
  }
};

const printMessage = function(msg, hide=true) {
  sendChat("Hourglass", "/w " + hourglass.who + " " + msg, null, {noarchive:hide});
};

const printUsage = function(errorMsg="") {
  const msg = errorMsg.length > 0 ? "<p style='color: red;'>" + errorMsg + "</p>" : "";

  printMessage(msg + "<p>Add a token to the map with <strong>Hourglass</strong> as the nameplate, then...</p><p><strong>!hg start HH:MM:SS</strong> to start the timer (hours and minutes are optional)</p><p><strong>!hg pause</strong> to pause the timer</p><p><strong>!hg stop</strong> to stop and reset the timer</p><p><strong>!hg help</strong> to display this message again.");
};

const parseCommand = function(msg) {
  if(msg.type !== 'api') {
    return;
  }

  var argv = msg.content.toLowerCase().split(' ');
  var cmd = argv.shift();

  if(cmd == "!hg") {
    cmd = argv.shift();

    var obj = findObjs({_type: "graphic", name: "hourglass"}, {caseInsensitive: true})[0];

    if(obj === undefined) {
      printUsage("Unable to find a token named <strong>Hourglass<strong>")
      return;
    }

    switch(cmd) {
      case 'start':
        if (hourglass.paused === true) {
          if (hourglass.remaining <= 0) {
            var time = argv.shift();

            if (time == undefined) {
              printUsage("You must provide a duration to the <strong>start</strong> command");
              break;
            }

            var timeparts = time.split(':').reverse();
            startHourglass(obj, timeparts);
          } else {
            startHourglass(obj);
          }
        }
        break;
      case 'pause':
        printMessage("Pausing Hourglass (Remaining Duration: " + hourglass.remaining + " seconds)", false);
        stopHourglass();
        break;
      case 'stop':
        printMessage("Stopping Hourglass (Remaining Duration: " + hourglass.remaining + " seconds)", false);
        timesUp(obj);
        break;
      case 'help':
        printUsage();
        break;
      default:
        printUsage(cmd + " is an unrecognized command");
        break;
    }
  }
};

on("chat:message", parseCommand);
