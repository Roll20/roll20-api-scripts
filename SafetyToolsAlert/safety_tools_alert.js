var SafetyToolsAlert = (function() {
	'use strict';
	var version = 0.5,
		author = 'James C. (Chuz)',
		lastUpdated = 'Sep 16 2021';


	var config = {
		deckname: 'Safety Tools',
		cardname_prefix: 'Safety:',
		play_sound: false,
		alert_sound: ''
	};

	var init = function() {
		if(! state.safety_tools_alert) {
			state.safety_tools_alert = config;
		} else {
			config = state.safety_tools_alert;
		}

		log('-=> SafetyToolAlerts v'+version+' loaded <=-');
	};

	// Handler for when a graphic is added to the table
	var imagePlaced = function(obj) {
		if(obj.get('_subtype') === 'card') {
			var card = getObj('card', obj.get('_cardid'));
			var cardName = card.get('name') || 'Unknown Card';

			var deck = getObj('deck', card.get('_deckid'));
			if(deck.get('name') === config.deckname) {
				sendChat('Safety Card Alerts', '/w GM **'+cardName+'** Placed');
			}
		} else if (obj.get('_subtype') == 'token') {
			var tok = findObjs({
				_subtype: 'token',
				_id: obj.id
			});

			// if it has an empty 'represents' it's not going to lead back to a character
			if(! tok[0].get('represents')) {
				return;
			}

			var char = findObjs({
				_type: 'character',
				_id: tok[0].get('represents')
			});

			if(! char[0]) {
				return;
			}

			if(char[0].get('name').startsWith(config.cardname_prefix)) {
				var cardName = char[0].get('name').slice(config.cardname_prefix.length) || 'Unknown Card';
				sendChat('Safety Card Alerts', '/w GM **'+cardName+'** Placed');

				if(config.play_sound) {
					playSound();
				}
			}

		}
	};



	var playSound = function() {
		if(config.play_sound && config.alert_sound) {
			var track = findObjs({type: 'jukeboxtrack', title: config.alert_sound})[0] || '';

			if(track) {
				track.set('playing', false);
				track.set('softstop', false);
				track.set('volume', 50);
				track.set('playing', true);
			}
		}
	};



	// Handler for chat messages
	var handleChatMessage = function(msg) {
		var args = msg.content,
			senderId = msg.playerid,
			selected = msg.selected;

		// We only listen to API messages, from the GM that start with !sta-config
		if (msg.type === 'api' && args.indexOf('!sta-config') === 0 && playerIsGM(senderId)) {
			args = args.replace('!sta-config','').trim();

			if (args.indexOf('-deckname') === 0) {
				config.deckname = args.replace('-deckname', '').trim();
				state.safety_tools_alert.deckname = config.deckname;
			} else if (args.indexOf('-cardname_prefix') === 0) {
				config.cardname_prefix = args.replace('-cardname_prefix', '').trim();
				state.safety_tools_alert.cardname_prefix = config.cardname_prefix;
			} else if (args.indexOf('-play_sound') === 0) {
				var sound = args.replace('-play_sound', '').trim();
				if(sound) {
					var track = findObjs({type: 'jukeboxtrack', title: sound})[0] || '';
					if(track) {
						config.alert_sound = sound;
						config.play_sound = true;
					} else {
						config.alert_sound = '';
						config.play_sound = false;
					}
					state.safety_tools_alert.alert_sound = config.alert_sound;
					state.safety_tools_alert.play_sound = config.play_sound;
				}
			}
		}
	};



	var registerAPI = function() {
		on('chat:message',handleChatMessage);
		on('add:graphic', imagePlaced);
	};


	/**
	 * Register and bind event handlers
	 */
	return {
		init: init,
		registerAPI: registerAPI
	};


}());


on("ready", function() {
	'use strict';

	SafetyToolsAlert.registerAPI();
	SafetyToolsAlert.init();
});



