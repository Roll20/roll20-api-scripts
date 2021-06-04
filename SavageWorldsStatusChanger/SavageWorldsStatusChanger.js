// SavageWorldsStatusChanger.js
//
//
// This API script performs a Savage Worlds roll (including wild die) and then displays
// a list of the target numbers with if this roll would be a success and any raises associated with
// it.
//
/*  Use this macro as an example of use with for some of the core states:
!swstatus  ?{Status|
   Clear,clear|
   Current State, current |
   -------, current |
   Shaken,shaken|
   Dead, incap |
   Distracted,distracted|
   Vulnerable,vulnerable|
   First Wound,wound1|
  Second Wound, wound2|
  Third Wound, wound3 |
  Fatigued, fatigue1 |
  Exhausted, fatigue2}

*/
//  By: Carl D.  https://app.roll20.net/users/2505097/carl-d
//  http://www.webcommando.com/
//
var SavageWorldsStatusChanger = SavageWorldsStatusChanger || (function() {
    'use strict';

  // Definitions -- these are the values to change if you want to customize.
  var WOUNDBASE = "red";
  var FATIGUEBASE = "brown";

  var WOUNDPARAM = "wound";
  var FATIGUEPARAM = "fatigue";

// This is the set of statuses found on the Roll20 wikki.
  var STATUSES = [
      {param: "incap",              status: "dead"},
      {param: "hold",               status: "stopwatch"},
      {param: "aim",                status: "arrowed"},
      {param: "bound",              status: "fishing-net"},
      {param: "distracted",         status: "screaming"},
      {param: "vulnerable",         status: "archery-target"},
      {param: "shaken",             status: "yellow"},
      {param: "climbing",           status: "three-leaves@2"},
      {param: "defend",             status: "bolt-shield"},
      {param: "entangled",          status: "cobweb"},
      {param: "stunned",            status: "back-pain"},
      {param: "flying",             status: "fluffy-wing@5"},
      {param: WOUNDPARAM + "1",     status: WOUNDBASE + "@1"},
      {param: WOUNDPARAM + "2",     status: WOUNDBASE + "@2"},
      {param: WOUNDPARAM + "3",     status: WOUNDBASE + "@3"},
      {param: FATIGUEPARAM + "1",   status: FATIGUEBASE + "@1"},
      {param: FATIGUEPARAM + "2",   status: FATIGUEBASE + "@2"},
      {param: "thedrop",            status: "death-zone"}
    ];

    var COUMPUNDSTATUSES = [
       {param: "entangled",     addParam: ["distracted"]},
       {param: "bound",         addParam: ["distracted", "vulnerable"]},
       {param: "stunned",       addParam: ["distracted", "thedrop"]}
    ];
      // End Definitions

    var version = '1.0.0'
    var lastUpdate = 1585162192766

	  var checkInstall = function() {
        log('-=> SavageWorldsStatusChanger v'+version+' <=-  ['+(new Date(lastUpdate))+']');

        if (state.SavageWorldsStatusChanger == undefined)
        {
          log ("-- Created SavageWorldsStatusChanger state variable.");
          state.SavageWorldsStatusChanger = {version: 1.0, status:STATUSES};
        }

      };

    //
    // Handle input coming from message
    //
    var handleInput = function(msg) {
      var args,
      who = msg.who;

  		if (msg.type !== "api") {
  			return;
  		}

		args = msg.content.split(/\s+/);

    var parameter = args.shift();

    if (parameter == "!swstatus") // it is our command
    {
      parameter = args.shift();

      // below is an if /then for each potential parameter passed in.
      if (parameter == "help")
      {
        displayHelp();
      }

      if (parameter == "clear")
      {
        clearStatus(msg.selected);
        return;
      }

      if (parameter == "current")
      {
       currentStatus(msg.selected, state.SavageWorldsStatusChanger["status"], who);
        return;
      }

      if (parameter == "changemarker")
      {
        var code, value;
        if ((code = args.shift()) === undefined) return;
        if ((value = args.shift()) === undefined) return;
        newMarker(code, value);
        return;

      }

      if (parameter == "dump")
      {
        dumpToLog(msg.selected);
        return;
      }

      // gp back to the defaults.
      if (parameter == "reset")
      {
        setProperty("status", STATUSES);
      }


      // no defined parameters.  These means it is the name of a status to change.
      // state.SavageWorldsStatusChanger["status"].forEach(function(opts) {
        var statusList = getProperty("status");
        statusList.forEach(function(opts) {

        if (opts.param == parameter) {

          if (parameter.indexOf(WOUNDPARAM) >= 0 || parameter.indexOf(FATIGUEPARAM) >= 0)
          {
            changeStatus(msg.selected, opts.status, true );
          }
          else
          {
            changeStatus(msg.selected, opts.status, false);
          }
        }

      });


    }

  };

// This function dumps the Roll20 statusmarkers string.  It is useful for seeing what the name of each
// status marker assigned to a token.  Good for finding the name of a custom token.
  var dumpToLog = function (tokens)
  {
    log ("Dump to Log -->");
    _.chain(tokens)
             .map(function (o) {
               var obj = getObj(o._type,o._id);

               return obj;

             })
             .filter(function(o){
               return 'token' === o.get('subtype');
             })
             .map(function(o){

               return o;
             })
             .each(function(o){
               var charName = o.get("name");
               if (charName == "" || charName == undefined)
               {
                 charName = "**none**";
               }
               log (charName + ":" + o.get("statusmarkers"));
               sendChat("", charName + ":" + o.get("statusmarkers"));
             });
  };

// Displays to the chat window the current state of each token passed in with the token's name.
    var currentStatus = function (tokens, availableStatuses, who) {
      // log ("currentStatus:" + tokens);

       _.chain(tokens)
       					.map(function (o) {
       						return getObj(o._type,o._id);
       					})
       					.filter(function(o){
       						return 'token' === o.get('subtype');
       					})
       					.map(function(o){

       						return o;
       					})
       					.each(function(o){
                  var statusString = o.get("statusmarkers");
//                  log ("function:" + o.get('statusmarkers'));
//                  log ("name:" + o.get("name"));
                  var tokenName = o.get("name");
                  var statusList = statusString.split(',');

                  var outputString = "";

                  outputString = outputString + "<div style='border:2px solid black;'><h3 style='background-color:black;color: white; width:100%'>" + "Name: " + tokenName + "</h3>";

                  statusList.forEach ( function (statusItem) {

                    availableStatuses.forEach( function(opts) {
                      if (opts.status == statusItem)
                      {
                        outputString = outputString + opts.param.toUpperCase() + " ";
                      }

                    });
                  });

                  outputString = "<span style='color:black;background-color: Sienna; border:1px solid black; width:100%'>" + outputString + "</span></div>";



                  sendChat(who, outputString);

       					})
       					;

    };

// Change the token's status.  This toggels a status on and off.
    var changeStatus = function (tokens, statusItem, badgedItem) {


       // this iterates through the list of selected tokens and operates on each.
       _.chain(tokens)
       			.map(function (o) {
   						return getObj(o._type,o._id);
   					})
     					.filter(function(o){
     						return 'token' === o.get('subtype');
     					})

       					.each(function(o){

                  var statusString = o.get("statusmarkers");
                  var statusList = statusString.split(',');

                  var newStatusList = "";
                  var statusFound = false;

                  // Clear all the wounds / Fatigue if necessary
                  if (badgedItem)
                  {

                    // Clear the badges
                    var badgeIndex = statusItem.indexOf("@");
                    var badgeBase = statusItem.substring(0, badgeIndex);

                    for (var i = 0; i < 4; i++)
                    {
                      var eraseString = badgeBase+"@" + i;
                      if (eraseString != statusItem)
                      {
                        statusString = statusString.replace(eraseString, "");
                      }
                    }

                  }


                  if (statusString.indexOf(statusItem) == -1)
                  {
                    newStatusList = statusString + "," + statusItem;
                  } else {
                    newStatusList = statusString.replace(statusItem, "");

                  }
                  newStatusList = newStatusList.replace(",,", ","); // fix extra commas after removing item.

                  var mod = { statusmarkers: newStatusList };

                  o.set(mod);

       					})
       					;

    };

// Removes all the status markers for tokens.  It clears ALL of them regardless of how they were set.
    var clearStatus = function (tokens) {

       _.chain(tokens)
          .map(function (o) {
            return getObj(o._type,o._id);
          })
            .filter(function(o){
              return 'token' === o.get('subtype');
            })
                .each(function(o){

                  var newStatusList = "";

                  var mod = { statusmarkers: newStatusList };

                  o.set(mod);


                })
                ;

    };

// Changes what the definition of a marker is.  This function changes one of the define parameter codes with
// the new value.  This is useful to use your own tokens (using dump command to find the name) with the tool or simply
// choose a different built in icon for a status.
    var newMarker = function(code, value)
    {


      var currentState = getProperty('status');

      var newState = [];

      currentState.forEach( function(item, index) {

        if (item['param'] == code) {
            item ['status'] = value;
        }

        newState.push(item);

      });

      setProperty('status', newState);

    } ;

    // Set a state property for maintaining between executions.
    var setProperty = function(key, value) {
      var currentValue = state.SavageWorldsStatusChanger[key];
      state.SavageWorldsStatusChanger[key] = value;

      return currentValue;  // undefined if undefined
    };

    // get a state property by key
    var getProperty = function(key) {
      var currentValue = state.SavageWorldsStatusChanger[key];

      return currentValue;  // return undefined if undefined
    };


    var print = function(o){
        var str='';

        for(var p in o){
            if(typeof o[p] == 'string'){
                str+= p + ': ' + o[p]+';  ';
            }else{
                str+= p + ': { </br>' + print(o[p]) + '}';
            }
        }

        return str;
    }

    var displayHelp = function () {

      var outputString = "<h4>Savage Worlds Status changer</h4><p>This script makes it easy to assign a status to a set of selected tokens.  Call the script with the appropriate status name and the assigned marker is added to the token or set of tokens.  You can change what status marker is used, as well, to allow access to your custom markers or change which built in marker is used.</p><h4>Command Format</h4> <b>!swstatus [status]</b><p> => Toggles this status (on/off) and assigns the appropriate marker to all selected tokens.</p><i>Available codes for [status]:</i><p>  incap,    hold,    aim,    bound,    distracted,    vulnerable,    shaken,             climbing,           defend,             entangled,          stunned,            flying,             wound1,     wound2,   wound3,   fatigue1,   fatigue2,   thedrop</p><b>!swstatus clear</b><p> => Clears all status markers on the selected tokens.</p><b>!swstatus current</b><p> => Displays in the chat window the current statuses assigned to selected tokens.  If you forget what the icons indicate, this command prints them out in easy to read format.</p> <b>!swstatus changemarker [status] [marker system name]</b><p> => Assigns a new status marker to one of the status's.  [status] is the same as list above and the [marker system name] is the name that Roll20 stores in the 'statusmarker' field for a token object.  </p> <p>If you want to install custom tokens, use the UI to assign your status to the token and then use the '!swstatus dump' to get the names of all the markers.  Use the name for your marker (it will look something like 'mymarker::6433').</p> <b>!swstatus reset</b><p> => Clears all the marker changes made with the 'changemarker' command. The status marker icons are reset to the defaults again.</p> <b>!swstatus dump</b><p> => Dumps the content of the token's 'statusmarkers' field to the script console.  Useful for finding the name for your customer markers.</p> <b>!swstatus help</b> <p>=> Displays the help text into the chat window.  </p>";

      sendChat('', outputString);


    };

    var registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };


}());

on('ready',function() {
    'use strict';

    SavageWorldsStatusChanger.CheckInstall();
    SavageWorldsStatusChanger.RegisterEventHandlers();
});
