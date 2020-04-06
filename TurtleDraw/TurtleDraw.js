// TurtleDraw.js
//
// This script provides a way to draw rooms by walking our 'turtle' around the
// grid map.  A UI is displayed that allows the user to move in the four directions
// while raising or lowering the pen. Two colors are possible for lines ...door color and
// wall coloring.
//
// By: Carl D.  (2505097)
// www.webcommando.com
//
//
var TurtleDraw = TurtleDraw || (function() {
    'use strict';
    const WALLWIDTH = 5;        // Line thickness
    const PIXPERUNIT = 70;      // Number of pixels on side of a square
    const CURSORWIDTH = 10;     // Size of the cursor
    const CURSORHEIGHT = 10;

    // Colors
    const WALLCOLOR = "#000000";    // Line color for a wall line
    const DOORCOLOR = "#CC6600";    // Line color for what we mark as a door
    //const PORTALCOLOR = "#A0A0A0";
    //const FLOORCOLOR = "#A0A0A0";


    var version = '1.0.0', lastUpdate = 1585234172603,

	  checkInstall = function() {
        log('-=> TurtleDraw v'+version+' <=-  ['+(new Date(lastUpdate))+']');

        // Setup the basic state variables
        state.TurtleDraw = { version: 1.0, currentLeft: 1, currentTop: 1, down: true, door: false};
	  },

    //
    // Handle input coming from message
    //
    handleInput = function(msg) {
      //log("What's in the message:" + msg.content);

      var args,
      who = msg.who;

      // Only do work if this is an API call.
  		if (msg.type !== "api") {
  			return;
  		}

      // Split the space separated arguments into an args array,.
  		args = msg.content.split(/\s+/);

      // Grab first parameter
      var parameter = args.shift();

      if (parameter == "!turtle") // it is our command!!
      {

        parameter = args.shift();
        if (parameter == undefined)
        {
          sendChat("", "Missing Parameter(s)");
          return;
        }

        if (parameter == "help")
        {
          displayHelp();
        }

        if (parameter == "start")
        {
          var left = args.shift();
          var top = args.shift();
          if (top === undefined || left === undefined)
          {
            sendChat("", "Missing Parameters");
            return;
          }

          startTurtle(left, top);
        }

        if (parameter == "down")
        {
          setProperty('down', true);
        }

        if (parameter == "up")
        {
          setProperty('down', false);
        }

        if (parameter == "door")
        {
          setProperty('door', true);
        }

        if (parameter == "wall")
        {
          setProperty('door', false);
        }


        if (parameter == "moveturtle") {

          var direction = args.shift();
          if (direction === undefined )
          {
            sendChat("", "Missing Parameter");
            return;
          }
          if (direction == "L" || direction == "left")
          {
            moveTurtle(-1,0);
          }
          if (direction == "R" || direction == "right")
          {
            moveTurtle (1, 0);
          }
          if (direction == "U" || direction == "up")
          {
            moveTurtle(0, -1);
          }
          if (direction == "D" || direction == "down")
          {
            moveTurtle(0, 1);
          }
          return;
        }


      }

    },

    //
    // Set a state property for maintaining between executions.
    //
    setProperty = function(key, value) {
      var currentValue = state.TurtleDraw[key];

      state.TurtleDraw[key] = value;

      return currentValue;  // undefined if undefined
    },

    //
    // Get a value from the global state variable.
    //
    getProperty = function(key) {
      var currentValue = state.TurtleDraw[key];

      return currentValue;  // return undefined if undefined
    },

    //
    // Sets the starting point and displayes the move chat UI for
    // turtle graphics drawing on the page.
    //
    startTurtle = function(left, top) {

      setProperty('currentLeft', left);
      setProperty('currentTop', top);

      // We need to create a cursor to show turtle location
      var cursorLoc = createCursor(left,top);
      setProperty('cursor', cursorLoc.get("id"));


      // Create the UI with buttons for all the controls
      // It appears similar to this in the chat window:
      //                 Move Up
      //    Move Left               Move Right
      //                Move down
      //   Pen Up                   Pen Down
      //   Door Color               Wall Color
      //
      var menuString = "<div style='border-stle: solid'>" +
      " <h3 style='background-color:black;color: white; width:80%; padding: 5px'>Turtle Draw:</h3>" +
      "<table style='width:80%'>" +
        "<tr><td></td><td><a style='text-align: center; border: black 2px solid' href='!turtle moveturtle U'>Move Up</a></td><td></td></tr>" +
        "<tr><td><a style='text-align: center; border: black 2px solid' href='!turtle moveturtle L'>Move Left</a></td><td></td><td><a style='text-align: center; border: black 2px solid' href='!turtle moveturtle R'>Move Right</a></td></tr>" +
        "<tr><td></td><td><a style='text-align: center; border: black 2px solid' href='!turtle moveturtle D'>Move Down</a></td><td></td></tr>" +
        "<tr><td><a style='text-align: center; border: black 2px solid' href='!turtle up'>Pen Up</a></td><td></td><td><a style='text-align: center; border: black 2px solid' href='!turtle down'>Pen Down</a></td></tr>" +
        "<tr><td><a style='text-align: center; border: black 2px solid' href='!turtle door'>Door Color</a></td><td></td><td><a style='text-align: center; border: black 2px solid' href='!turtle wall'>Wall color</a></td></tr>" +
      "</table></div>";

      sendChat("", menuString);

    },

    //
    // Moves the turtle from the stored location and draws a line from
    // the stored location to the location passed in.  Location
    // parameters are based on number of squares not pixels.
    //
    moveTurtle = function(deltaLeft, deltaTop) {

      // distance in number of grid squares
      var leftDistance = parseInt(deltaLeft);
      var topDistance = parseInt(deltaTop);

      // pull the current location from state
      var currentLeft = parseInt(getProperty("currentLeft") );
      var currentTop = parseInt(getProperty("currentTop")) ;

      // Is the pen down
      var down = getProperty('down');

      // Always drawing on the page players are on.
      var currentPage = Campaign().get("playerpageid");

      // Since you can only draw in the positive direction we check
      var multiplierLeft = (leftDistance > 0)? 0:leftDistance;
      var multiplierTop = (topDistance >0)?0:topDistance;

      var color = (getProperty('door') == true)? DOORCOLOR:WALLCOLOR;

      if (down)
      {
        // Create the path on the player page on the map layer and page characters are on.
        var createdPath = createObj('path', {
            pageid: currentPage,
            left: (currentLeft * PIXPERUNIT) + (multiplierLeft * (PIXPERUNIT)) + (0.5 * PIXPERUNIT),
            top: (currentTop * PIXPERUNIT)+ (multiplierTop * (PIXPERUNIT)) + (0.5 * PIXPERUNIT),
            fill: WALLCOLOR,
            stroke: color,
            stroke_width: WALLWIDTH,
            width: PIXPERUNIT,
            height: PIXPERUNIT,
            layer: 'map',
            path: JSON.stringify([['M', 0, 0], ['L', Math.abs(leftDistance) * PIXPERUNIT, Math.abs(topDistance) * PIXPERUNIT]])
        });

        // Put the line behind everything else on page.  This assumes that there isn't a big battle map or something we want lines on top of.
         toBack(createdPath);
      }

      // Update the state with the new location of the cursor
      setProperty("currentLeft", parseInt(deltaLeft) + parseFloat(currentLeft));
      setProperty("currentTop", parseInt(deltaTop) + parseFloat(currentTop));

      // Finally get the cursor and move it to the new location.
      var cursorID = getProperty("cursor");
      var cursor = getObj('path', cursorID);
      // if someone deletes cursor we get an undefined from the getObj.  Need to create a new cursor.
      if (cursor == undefined)
      {
        cursor = createCursor(1,1);
        setProperty("cursor", cursor.get("id"));
      }

      var mod = { left: getProperty("currentLeft") * PIXPERUNIT ,
                  top: getProperty("currentTop") * PIXPERUNIT }

      cursor.set(mod);

    },

    //
    // Creates a small cursor to show the location of the turtle on the screen
    createCursor = function (left,top) {
      var currentPage = Campaign().get("playerpageid");

      var widthinPix = CURSORWIDTH;
      var heightinPix = CURSORHEIGHT;

      var createdPath = createObj('path', {
          pageid: currentPage,
          width: CURSORWIDTH,
          height: CURSORHEIGHT,
          left: left*PIXPERUNIT,
          top: top*PIXPERUNIT,
          fill: DOORCOLOR,
          stroke_width: WALLWIDTH,

          layer: 'map',
          path: JSON.stringify([['M', 0, 0], ['L', widthinPix, 0], ['L', widthinPix, heightinPix], ['L', 0, heightinPix], ['L', 0, 0]])
      });



      toFront(createdPath);
      return (createdPath);

    },

    //
    // Handle when the cursor is dragged and dropped by user.  We need to reset wheere starting point is for a line.
    //
    handleCursorMove = function(obj, prev) {

      // Only do something if it is our cursor that changed.
      if (obj.get("id") != getProperty("cursor"))
      {
        return;
      }

      // Get the changed location
      var left = obj.get("left");
      var top = obj.get("top");

      // calculate corner of to closest square
      var newLeftSquares = Math.round(left/PIXPERUNIT);
      var newTopSquares = Math.round(top/PIXPERUNIT);

      // New cursor position is corner of the square
      var newLeft =  newLeftSquares * PIXPERUNIT;
      var newTop =  newTopSquares * PIXPERUNIT;


      // Set the current location to draw from to the new square
      setProperty('currentLeft', newLeftSquares);
      setProperty('currentTop', newTopSquares);

      var mod = { left: newLeft, top: newTop };
      obj.set(mod);

    },

    // Display help for our script!
    displayHelp = function () {

      var outputString = "<p>!turtle start LEFT TOP -> set the starting point of our turtle.  LEFT and TOP are in grid units NOT pixels</p>" +
      "<p>!turtle moveturtle [up|down|left|right|U|D|L|R] -> Move the turtle in the direction indicated.</p>" +
      "<p>!turtle [up|down] -> Either put the pen up (don't draw) or put pen down (draw)</p>" +
      "<p>!turtle [door|wall] -> Sets the color of the line - door indicates door color (brown) or wall color (black)</p><p>" +
      "Note you can also drag the square cursor to a new location to change where the turtle starts drawing from.</p>";


      sendChat('', outputString);
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:path', handleCursorMove);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };

}());

// Ready event fires at the end of loading the campaign.
on('ready',function() {
    'use strict';

    TurtleDraw.CheckInstall();
    TurtleDraw.RegisterEventHandlers();
});
