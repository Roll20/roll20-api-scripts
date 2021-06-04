//SavageWorldsRaiseRoller.js
//
// By: Carl Davis
// https://app.roll20.net/users/2505097/carl-d  (Carl D.)
// Email: cdavis AT SIGN webcommando.com  (replace AT SIGN with @)
//
//
// This API script performs a Savage Worlds roll (including wild die) and then displays
// a list of the target numbers with information on if this roll would be a success and any raises associated with
// it.
//
/*  Use this macro as an example of use with an extra
!swrr exta ?{Choose Die|
   d4,4|
   d6,6|
   d8,8|
   d10,10|
   d12,12} ?{Choose Bonue|0}

*/
//
//
var SavageWorldsRaiseRoller = SavageWorldsRaiseRoller || (function() {
    'use strict';

    var version = '0.1.0', lastUpdate = 1569801600,

	   checkInstall = function() {
        log('-=> SavageWorldsRaiseRoller v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	     },

    // Handle input coming from message
    handleInput = function(msg) {
      var args,
          whisper = false,
          extra = false,
          dieType = 6,
          extraParam = 'extra',
          bonusAmount = 0,
  	      who = msg.who;

  		if (msg.type !== "api") {
  			return;
  		}

    //log("Message: " + msg.content);

		args = msg.content.split(/\s+/);
		switch(args.shift())
      {
        //case 'help':
        //  var helpText = "<div>To use Savage Worlds Raise Roller</div><div>!swrr DIE [extra]</div><div><ul><li>DIE - Die sides 4,6,8,10,12</ul><li>extra - optional parameter, will roll without the wild die.<//li></ul>";
        //  sendChat(msg.who, helpText);
        //  break;


        case '!wswrr':
            whisper = true;
		        who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
            // break; // Intentional fall through

        case '!swrr':
          var nextParam = args.shift();

          // if next paramater the extra flag?
          if (nextParam != undefined)
          {
            if (nextParam == extraParam)
            {
              extra = true;
              dieType = 6;
              nextParam = args.shift();
            }
          }

          //log ("Param1:" + nextParam);

          if (nextParam != undefined && nextParam == "help")
          {
            displayHelp();
            break;
          }

          if (nextParam != undefined)
          {
            dieType = nextParam;
            nextParam = args.shift();
            if (nextParam != undefined)
            {
              bonusAmount = nextParam;
            }
            else {
              bonusAmount = 0;
            }
          }


          log ("Whisper: " + whisper + "; Extra:" + extra + "; dieType:" + dieType + "; bonus: " + bonusAmount);
        // Make Calls for Items

          var theFinalRoll = rollDice(dieType, extra);

          if (typeof bonusAmount === 'string')
          {
            bonusAmount = parseInt(bonusAmount);
          }
          log ("FinalRoll: " + theFinalRoll);

          theFinalRoll = theFinalRoll + bonusAmount;
          log ("FinalRoll with Bonus:" + theFinalRoll + " bonus: " + bonusAmount);

          var outputString = generateOutput(theFinalRoll, bonusAmount, dieType, extra, who);

          if (!whisper)
          {
            sendChat(msg.who, outputString);
          } else {
            sendChat(msg.who, "/w gm " + outputString);
          }

          break;
      }
    },

    displayHelp = function () {

      var outputString = "<p>Help:</p><p>!swrr extra DIE BONUS</p><p>DIE is the number of sides of the die (4,6,8,10,12)<br>BONUS is a numeric bonus to add to die roll.<br>extra - you can add the optional <i>extra</i> parameter to tell the roller to not use the wild die in the roll.</p><p>!wswrr command can be used to whisper to GM with same parameters as above.<br><br>Example: !swrr 6 -5 ==> Roll 1d6 with bonus of -5 for a wildcard."

      sendChat('', outputString);


    },
    // Do all the rolling and getting ready.
    rollDice = function(dieSides, extra) {
      //log ("rollDice");
      var maxRoll;

      var mainRoll = rollExplodingDie(dieSides);
      var wildTotal = rollExplodingDie(6);

      //log("Roll:" + mainRoll + "; Wild:" + wildTotal);

      // which roll do we take?
      if (!extra)
      {
        maxRoll = Math.max(mainRoll, wildTotal);
      } else {
        maxRoll = mainRoll;
      }

      //log ("Max Roll:" + maxRoll);
      return (maxRoll);

    },

    generateOutput = function(theRoll, bonus, dieType, isExtra, who) {
      //log ("generateOutput");


      var rollString = "<h3 style='background-color:black;color: white; font-size:25px; width:100%'>" + who + "</h3><div style='background-color:SandyBrown;padding: 5px; margin 5px;'>Rolling 1d" + dieType + " + " + bonus + ": <span style='color:white;background-color: Sienna;border:2px solid black; width: 10%; padding: 10px'>" + theRoll + "</span> </div>";

      var evenRow = "<div style='background-color: Goldenrod; padding: 2px; '>OUTPUTSTRING</div>";
      var oddRow = "<div style='background-color: DarkGoldenrod; padding: 2px; '>OUTPUTSTRING</div>";
      var success = "<span style='color: green;'>Success</span> "
      var raiseText = "<span style='background-color: Green; width: 10%; color: white;'>NUMOFRAISE</span> "

      // main container for output
      var finalout = "<div id='outercontainer' style='border:2px solid black;'>";

      finalout = finalout + rollString;
      // Inner Raise Container
      finalout = finalout + "<div id='raiselist' style='margin: 5px; '>";

      var targetNumber = 4;  // Starting target number

      if (theRoll < targetNumber)
      {
        finalout = finalout + oddRow.replace(/OUTPUTSTRING/g, "Roll Failed");
      }

      while (theRoll >= targetNumber)
      {
        var raise = numRaise(targetNumber, theRoll);
        if (raise > 0)
        {
          if (targetNumber % 2 == 0)
          {

            finalout = finalout + oddRow.replace(/OUTPUTSTRING/g, targetNumber + ": " + success + " with raise " + raiseText.replace(/NUMOFRAISE/g, raise));
          } else {
            finalout = finalout + evenRow.replace(/OUTPUTSTRING/g, targetNumber + ": " + success + " with raise " + raiseText.replace(/NUMOFRAISE/g, raise));

          }
        } else
        {
          if (targetNumber % 2 == 0)
          {

            finalout = finalout + oddRow.replace(/OUTPUTSTRING/g, targetNumber + ": " + success);
          } else {
            finalout = finalout + evenRow.replace(/OUTPUTSTRING/g, targetNumber + ": " + success);

          }

        }

        targetNumber++;

      }

      // End inner raise container.
      finalout = finalout + "</div>"
      finalout = finalout + "</div>";
      // End main container
      finalout = finalout + "</div>";

       return (finalout);

    },

    // Roll a die using the exploding dice rule.
    rollExplodingDie = function(die) {

      var dieSides;

      if (typeof die === 'string')
      {
        dieSides = parseInt(die);
      } else {
        dieSides = die;
      }

      var rollTotal = randomInteger(dieSides);
      var theRoll = rollTotal;
      //log ("Roll:" + theRoll);
      while (theRoll == dieSides)
      {
        theRoll = randomInteger(dieSides);
        rollTotal += theRoll;
        //log ("    :" + theRoll);
      }

      //log ("Roll Total:" + rollTotal);

      return (rollTotal);

    },

    // Calculate the number of raises from a roll.
    numRaise = function(target,roll) {
    	if (roll <= target ) {  // must be greater than target by 4 for raise
    		return 0;
    	}
    	var baseValue = roll-target;

    	return (Math.floor(baseValue / 4))
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
		    CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };

}());

on('ready',function() {
    'use strict';

    SavageWorldsRaiseRoller.CheckInstall();
    SavageWorldsRaiseRoller.RegisterEventHandlers();
});
