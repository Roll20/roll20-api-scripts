/**
 * TimeTracker.js
 *
 * @author Filip Čapek - capekfilip@capekfilip.cz
 * @version 0.3
 * @date September 28, 2015
 * @date updated December 6, 2015
 *
 * Based on TrackerJacker.js https://github.com/FGKenL/Roll20_API_Scripts/blob/master/trackerjacker.js
 * By Ken L.
 */
 
 var TimeTracker = (function() {
	'use strict'; 
	var version = 0.3,
	author = 'Filip Č.';
	
	var fields = {
		feedbackName: 'TimeTracker',
		feedbackImg: 'https://raw.githubusercontent.com/capekfilip/roll20-scripts/master/time-tracker/thumb.png',
	};
	
	var flags = {
		archive: false,
	};
	
	var design = {
		delete_icon: 'https://s3.amazonaws.com/files.d20.io/images/11381509/YcG-o2Q1-CrwKD_nXh5yAA/thumb.png?1439051579'
	};
	
	/**
	 * Init
	 */
	var init = function() {
		if (!state.timetracker)
			{state.timetracker = {};}
		if (!state.timetracker.time)
			{state.timetracker.time = {};}
		if (!state.timetracker.timeformat)
			{state.timetracker.timeformat = 24;}
		if (!state.timetracker.events)
			{state.timetracker.events = {};}
	};
	
	/**
	 * Send an error
	 */ 
	var sendError = function(msg) {
		sendFeedback('<span style="color: red; font-weight: bold;">'+msg+'</span>'); 
	}; 
	
	/**
	 * Send feedback message
	 */
	var sendFeedback = function(msg) {
		var content = '/w GM '
				+ '<div style="position: absolute; top: 4px; left: 5px; width: 26px;">'
					+ '<img src="' + fields.feedbackImg + '">' 
				+ '</div>'
				+ msg;
			
		sendChat(fields.feedbackName,content,null,(flags.archive ? {noarchive:true}:null));
	};
	
	/**
	 * Send public message
	 */
	var sendPublic = function(msg) {
		if (!msg) 
			{return undefined;}
		var content = '/desc ' + msg;
		sendChat('',content,null,(flags.archive ? {noarchive:true}:null));
	}; 
	
	/**
	 * Handle chat message event
	 */ 
	var handleChatMessage = function(msg) { 
		var args = msg.content,
			senderId = msg.playerid,
			selected = msg.selected; 
			
		if (msg.type === 'api'
		&& playerIsGM(senderId)
		&& args.indexOf('!time') === 0) {
			args = args.replace('!time','').trim();
			if (args.indexOf('-help') === 0) {
				showHelp(); 
			} else if (args.indexOf('-setformat') === 0) {
				args = args.replace('-setformat','').trim();
				doSetFormat(args);
			} else if (args.indexOf('-set') === 0) {
				args = args.replace('-set','').trim();
				doSetTime(args);
			} else if (args.indexOf('-plus') === 0) {
				args = args.replace('-plus','').trim();
				doPlusTime(args);
			} else if (args.indexOf('-addevent') === 0) {
				args = args.replace('-addevent','').trim();
				doAddEvent(args);
			} else if (args.indexOf('-events') === 0) {
				doDisplayEvents(); 	
			} else if (args.indexOf('-removeevent') === 0) {
				args = args.replace('-removeevent','').trim();
				doRemoveEvent(args);
			} else if (args.indexOf('-show') === 0) {
				doShowTime();   
			} else {
				sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>');
				showHelp(); 
			}
		}
	};
	
	/**
	 * Show help message
	 */ 
	var showHelp = function() {
		var content = 
			'<div style="border: 1px solid black; background-color: #FFF; padding: 3px 3px;">'
            	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 125%;">'
					+'TimeTracker v'+version
				+'</div>'
				+'<div style="padding-left:10px;margin-bottom:3px;">'
					+'<p>Tracking ingame time and events like lamps, torches and long duration spells (Mage Armor).</p>'
				+'</div>'
				
				+'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: monospace;">!time <i>-help</i></span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
		            	+'<p>This command displays the help.</p>'
		            +'</div>'
				+'</div>'
				
				+'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: monospace;">!time <i>-setformat</i> &lt;timeformat&gt;</span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
			            +'<p>Set the show time format.</p>'
			            +'This command requires 1 parameter:'
			            +'<ul>'
			            +'<li>'
			            +'<b><span style="font-family: monospace;">&lt;timeformat&gt;</span></b> -- The numeric value of time format. <b>Parametr must be only 12 or 24.</b> Default value is <b>24</b>. Example <b>12</b>.'
			            +'</li>'
			            +'</ul>'
		            +'</div>'
	            +'</div>'
	            
	            +'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: monospace;">!time <i>-set</i> &lt;hours&gt;:&lt;minutes&gt;</span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
			            +'<p>Set the current time.</p>'
			            +'This command requires 2 parameters:'
			            +'<ul>'
			            +'<li>'
			            +'<b><span style="font-family: monospace;">&lt;hours&gt;</span></b> -- The numeric value of hours. <b>Must be in 24-hours time format.</b> Example <b>10</b>.'
			            +'</li>'
			            +'<li>'
			            +'<b><span style="font-family: monospace;">&lt;minutes&gt;</span></b> -- The numeric value of minutes. Example <b>30</b>.'
			            +'</li>'
			            +'</ul>'
		            +'</div>'
	            +'</div>'
	            
	            +'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: monospace;">!time <i>-plus</i> &lt;hours&gt;:&lt;minutes&gt;</span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
			            +'<p>Add hours and minutes to current time. This ammount of time is even automatically deductive from events duration.</p>'
			            +'This command requires 2 parameters:'
			            +'<ul>'
			            +'<li>'
			            +'<b><span style="font-family: monospace;">&lt;hours&gt;</span></b> -- The numeric value of how much hours add to current time. Example <b>1</b>.'
			            +'</li>'
			            +'<li>'
			            +'<b><span style="font-family: monospace;">&lt;minutes&gt;</span></b> -- The numeric value of how much minutes add to current time. Example <b>28</b>.'
			            +'</li>'
			            +'</ul>'
		            +'</div>'
	            +'</div>'
	            	            
	            +'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: monospace;">!time <i>-show</i></span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
		            	+'<p>This command displays the current time.</p>'
		            +'</div>'
				+'</div>'
				
				+'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: monospace;">!time <i>-addevent</i> &lt;name&gt;:&lt;hours&gt;:&lt;minutes&gt;</span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
			            +'<p>Add a event to list and automatically track it&apos;s duration if is used <b><span style="font-family: monospace;">!time <i>-plus</i></span></b> command.</p>'
			            +'This command requires 3 parameters:'
			            +'<ul>'
			            +'<li>'
			            +'<b><span style="font-family: monospace;">&lt;name&gt;</span></b> -- String of the event name. Example <b>PC&apos;s Mage Armor</b>.'
			            +'</li> '
			            +'<li>'
			            +'<b><span style="font-family: monospace;">&lt;hours&gt;</span></b> -- The numeric value of how much hours duration event have. Example <b>8</b>.'
			            +'</li>'
			            +'<li>'
			            +'<b><span style="font-family: monospace;">&lt;minutes&gt;</span></b> -- The numeric value of how much minutes duration event have. Example <b>0</b>.'
			            +'</li>'
			            +'</ul>'
		            +'</div>'
	            +'</div>'
	            
	            +'<div style="padding-left:10px;">'
		            +'<b><span style="font-family: monospace;">!time <i>-events</i></span></b>'
		            +'<div style="padding-left: 10px;padding-right:20px">'
		            	+'<p>This command displays the active events and it&apos;s remaining duration.</p>'
		            +'</div>'
				+'</div>'
				
   			+'</div>'; 

		sendFeedback(content); 
	};
	
	/**
	 * Set the current ingame time
	 */
	var doSetTime = function(args) {
		if (!args) 
			{return;}

		args = args.split(/:| %% /);

		if (args.length < 1 || args.length > 3) {
			sendError('Invalid time syntax.');
			return;
		}

		var hours = parseInt(args[0]),
			minutes = parseInt(args[1]);
		
		if (isNaN(hours) || isNaN(minutes) || hours > 24 || minutes > 60) {
			sendError('Invalid time syntax.');
			return;
		}
			
		if (hours < 10) {
			var hours = '0'+hours;
		}
		
		if (minutes < 10) {
			var minutes = '0'+minutes;
		}	
			
		var newTime = {
			hours: hours,
			minutes: minutes
		};
		
		state.timetracker.time = newTime;
		
		var content = 'Time has been set.';
		
		sendFeedback(content);
		doShowTime();
	};
	
	/**
	 * Add how much time past from init
	 */
	var doPlusTime = function(args) {
		if (!args) 
			{return;}

		args = args.split(/:| %% /);

		if (args.length < 1 || args.length > 3) {
			sendError('Invalid time syntax.');
			return;
		}

		var hours = parseInt(args[0]),
			minutes = parseInt(args[1]);
			
		if (isNaN(hours) || isNaN(minutes)) {
			doShowTime();
			return;
		} else {
			var oldTotalSeconds = (state.timetracker.time.hours * 3600) + (state.timetracker.time.minutes * 60);
			var newTotalSeconds = (hours * 3600) + (minutes * 60);
			
			var newTimeSeconds = oldTotalSeconds + newTotalSeconds;
			
			var newHours = Math.floor((newTimeSeconds % 86400) / 3600);
			var newMinutes = Math.floor(((newTimeSeconds % 86400) % 3600) / 60);
			
			if (newHours < 10) {
				var newHours = '0'+newHours;
			}
			
			if (newMinutes < 10) {
				var newMinutes = '0'+newMinutes;
			}	
						
			var newTime = {
				hours: newHours,
				minutes: newMinutes
			};
			
			state.timetracker.time = newTime;
			
			var content = 'Time has been updated.';
			
			sendFeedback(content);
			doShowTime();
			checkEventsTimeLeft(newTotalSeconds);	
		}
	};
	
	/**
	 * Convert time to 12-hours
	 */
	var timeConvert = function(time) {
		// Check correct time format and split into components
		time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
		
		if (time.length > 1) { // If time format correct
			time = time.slice (1);  // Remove full string match value
			time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
			time[0] = +time[0] % 12 || 12; // Adjust hours
		}
		return time.join (''); // return adjusted time or original string
	};
	 
	/**
	 * Set show time format
	 */
	var doSetFormat = function(args) {
		if (!args) 
			{return;}

		args = args.split(/:| %% /);

		if (args.length < 1 || args.length > 2) {
			sendError('Invalid time format syntax.');
			return;
		}
		
		var timeformat = parseInt(args[0]);
		
		if (timeformat != 24 && timeformat != 12) {
			sendError('Invalid time format syntax.');
			return;
		}
		
		state.timetracker.timeformat = timeformat;
		
		var content = 'Time format has been set to '+timeformat+'-hours.';
		
		sendFeedback(content);
	};
	
	/**
	 * Show current ingame time
	 */
	var doShowTime = function() {
		var time = state.timetracker.time.hours+':'+state.timetracker.time.minutes;
		var disp = '<span style="text-align: center;">The current time is</span>'
			+'<br><span style="text-align: center; font-weight: bold; font-size: 150%">'+time+'</span>';
		
		if (state.timetracker.timeformat == 12) {
			var timeConverted = timeConvert(time);
			var dispConverted = '<span style="text-align: center;">The current time is</span>'
			+'<br><span style="text-align: center; font-weight: bold; font-size: 150%">'+timeConverted+'</span>';
			
			sendPublic(dispConverted);
		} else {
			sendPublic(disp);
		}
	};
	
	/**
	 * Add event to tracker
	 */
	var doAddEvent = function(args) {
		if (!args) 
			{return;}

		args = args.split(/:| %% /);

		if (args.length < 3 || args.length > 4) {
			sendError('Invalid event syntax');
			return;
		}

		var name = args[0],
			durHours = parseInt(args[1]),
			durMinutes = parseInt(args[2]);

		if (typeof(name) === 'string')
			{name = name.toLowerCase();}

		if (isNaN(durHours) || isNaN(durMinutes)) {
			sendError('Invalid event syntax');
			return;
		}

		if (eventExists(name)) {
			sendError('Event with the name "'+name+'" already exists');
			return; 
		}
		
		var durTotalSeconds = (durHours * 3600) + (durMinutes * 60);
		var newHours = Math.floor(durTotalSeconds / 3600);
		var newMinutes = Math.floor((durTotalSeconds % 3600) / 60);
		
		var newEvent = {
			name: name,
			durHours: newHours,
			durMinutes: newMinutes 
		};

		state.timetracker.events[name] = newEvent;
		
		var content = 'Event ' + '<span style="color: green;">'+name+'</span> was added.';
		
		sendFeedback(content);
	};
	
	/**
	 * Check if a event exists
	 */
	var eventExists = function(statusName) {
		statusName = statusName.toLowerCase(); 
		var found = _.find(_.keys(state.timetracker.events), function(e) {
			return e === statusName; 
		});
		if (found)
			{found = state.timetracker.events[found]; }
		return found; 
	};
	
	/**
	 * Build a listing of events
	 * 
	 */
	var makeEventsConfig = function() {
		var midcontent = '',
			content = '';

		_.each(state.timetracker.events,function(e) {
			if (e.durHours < 10) {
				var leftHours = '0'+e.durHours;
			} else {
				var leftHours = e.durHours;
			}
			
			if (e.durMinutes < 10) {
				var leftMinutes = '0'+e.durMinutes;
			} else {
				var leftMinutes = e.durMinutes;
			}	
			
			midcontent += 
				'<tr>'
					+'<td>'
						+leftHours+':'+leftMinutes
					+'</td>'
					+'<td>'
						+e.name
					+'</td>'
					+'<td width="32px" height="32px">' 
						+'<a style="height: 16px; width: 16px; background: none;" title="Remove '+e.name+' status" href="!time -removeevent '+e.name
							+'"><img src="'+design.delete_icon+'"></img></a>' 
					+ '</td>'
				+'</tr>'; 
		});

		if ('' === midcontent)
			{midcontent = 'No Events Available';}

		content = '<div style="background-color: #FFF; border: 1px solid #000; text-align: center;">'
			+ '<div style="font-weight: bold; font-size: 125%; border-bottom: 1px solid black;">'
				+ 'Events'
			+ '</div>'
			+ '<table width="100%">'; 
		content += midcontent; 
		content += '</table></div>'; 

		return content; 
	};
	
	/**
	 * Display events configuration
	 */ 
	var doDisplayEvents = function() {
		var content = makeEventsConfig(); 
		sendFeedback(content); 
	};
	
	/**
	 * Remove event from the tracker
	 */
	var doRemoveEvent = function(args) {
		if (!args) 
			{return;}

		args = args.split(/:| %% /);

		if (args.length < 1 || args.length > 2) {
			sendError('Invalid event syntax');
			return;
		}

		var name = args[0];

		if (typeof(name) === 'string')
			{name = name.toLowerCase();}


		if (!eventExists(name)) {
			sendFeedback('Event "' + name + '" is not on the list');
			return; 
		}

		var content = 'Event ' + '<span style="color: red;">'+name+'</span> removed from event list.'; 

		delete state.timetracker.events[name]; 
		sendFeedback(content); 
	};  
	
	var checkEventsTimeLeft = function(plusTotalSeconds) {
		_.each(state.timetracker.events,function(e) {
			var durTotalSeconds = (e.durHours * 3600) + (e.durMinutes * 60);
			
			var leftTimeSeconds = durTotalSeconds - plusTotalSeconds;
			
			if (leftTimeSeconds <= 0) {
				var content = '<span style="color: red;">'+e.name+'</span> went off.';
				
				sendFeedback(content);
				doRemoveEvent(e.name);
			} else {
				var newHours = Math.floor(leftTimeSeconds / 3600);
				var newMinutes = Math.floor((leftTimeSeconds % 3600) / 60);
				
				e.durHours = newHours;
				e.durMinutes = newMinutes;
			}	
		});
	}
	
	/**
	 * Write to log if its ready
	 */
	var loadMessage = function() {
		log('-=> TimeTracker v'+version+' is ready! Time format is set to '+state.timetracker.timeformat+'-hours. <=-');
	}; 
	
	/**
	 * Register and bind event handlers
	 */ 
	var registerAPI = function() {
		on('chat:message',handleChatMessage);
	};
 
	return {
		init: init,
		registerAPI: registerAPI,
		loadMessage: loadMessage
	};
	 
 }());

on("ready", function() {
	'use strict'; 
	TimeTracker.init(); 
	TimeTracker.registerAPI();
	TimeTracker.loadMessage();
});