/* jshint undef: true */
/* globals
 state,
 sendChat,
 randomInteger,
 _,
 on
 */
var fumbler = fumbler || (function () {
	'use strict';

	let version = '0.3.0',

		/* collection of possible commands for fumbler */
		acceptedCommands =
			[
				"!fumble",
				"!addFumble",
			],

		/* Eclectic collection of fumbles */
		fumble =
			[
				{ low: 1, high: 10, result: "Distracted", effect: "Something caught your eye while preparing for your attack, causing you to lose your balance.  Roll DEX or fall prone.", dcLow: 8, dcHigh: 20 },
				{ low: 11, high: 14, result: "Negligent", effect: "You didn't properly set your feet while preparing your attack.  Fall prone." },
				{ low: 15, high: 20, result: "Careless", effect: "You lost your footing and feel pretty 'off'. -1 to hit on next attack." },
				{ low: 21, high: 25, result: "Delinquent", effect: "You've slipped and can't recover your fighting spirit quickly. -2 to hit on next attack." },
				{ low: 26, high: 39, result: "Clumsy", effect: "Fall down. Roll DEX or drop primary weapon.", dcLow: 8, dcHigh: 20 },
				{ low: 40, high: 50, result: "Very Clumsy", effect: "Fall, drop primary weapon, roll DEX or be stunned for 1 round.", dcLow: 8, dcHigh: 20 },
				{ low: 51, high: 53, result: "Useless", effect: "Fall. Stunned for 1 round." },
				{ low: 54, high: 57, result: "Dazed", effect: "Fall. Drop primary weapon. Stunned for 1 round." },
				{ low: 58, high: 59, result: "Stunned", effect: "Fall. Stunned for 1 round." },
				{ low: 60, high: 60, result: "Dazed and Stunned", effect: "Fall. Drop primary weapon. Stunned for 1d4 rounds." },
				{ low: 61, high: 61, result: "Unconscious", effect: "Fall, knocked head on floor, knocked out for 1d4 rounds." },
				{ low: 62, high: 62, result: "Inept", effect: "Weapon disarmed by opponent and thrown d20 ft in random direction." },
				{ low: 63, high: 64, result: "Very Inept", effect: "Weapon or appendage breaks or is broken." },
				{ low: 65, high: 65, result: "Fail", effect: "Hit Self in groin. Roll CON or double over in pain, go last next round.", dcLow: 8, dcHigh: 20 },
				{ low: 66, high: 66, result: "Loser", effect: "Hit Self in groin. Double over in pain, go last next round." },
				{ low: 67, high: 67, result: "Klutz", effect: "Twist ankle, 1/2 movement." },
				{ low: 68, high: 69, result: "Dangerous Klutz", effect: "Twist knee, 1/4 movement." },
				{ low: 70, high: 70, result: "Untrained", effect: "Twist wrist, weapon arm incapacitated, drop weapon." },
				{ low: 71, high: 71, result: "Vulnerable", effect: "Opponent steps on foot, go last next round." },
				{ low: 72, high: 72, result: "Knocked Silly", effect: "In a twist of fate, you struck yourself in the head, causing blood to get in your eyes.  You are blinded until the end of next round." },
				{ low: 73, high: 74, result: "Poor Judgement", effect: "Wrong move, opponent's next attack +4 to hit." },
				{ low: 75, high: 76, result: "Handled Badly", effect: "Knuckles hit, -4 to hit until next round." },
				{ low: 77, high: 79, result: "Embarrassing", effect: "Armor piece knocked off, strap cut, belt cut, clothes torn, lose 2 AC until fixed." },
				{ low: 80, high: 80, result: "Nards", effect: "Opponent's parry hits groin, 1/2 move, -4 to hit for 3 rounds." },
				{ low: 81, high: 81, result: "Not Funny", effect: "Opponent's parry hits funny bone in weapon arm, -2 damage for 3 rounds." },
				{ low: 82, high: 82, result: "Blind Eye", effect: "Dirt blinds one eye, -1 to hit until cleaned." },
				{ low: 83, high: 83, result: "Blind Mans Bluff", effect: "Dirt blinds two eyes, -3 to hit until cleaned." },
				{ low: 84, high: 85, result: "Fool", effect: "Hit self. Normal damage." },
				{ low: 86, high: 86, result: "Useless Fool", effect: "Hit self. Normal damage. Stunned for 1 round." },
				{ low: 87, high: 88, result: "Moron", effect: "Hit self. Double damage." },
				{ low: 89, high: 89, result: "Useless Moron", effect: "Hit self. Double damage. Stunned for 1 round." },
				{ low: 90, high: 90, result: "Complete Moron", effect: "Hit self. Critical hit." },
				{ low: 91, high: 92, result: "Unaware", effect: "Hit friend, normal damage." },
				{ low: 93, high: 93, result: "Very Unaware", effect: "Hit friend, normal damage. Friend stunned for 1 round." },
				{ low: 94, high: 95, result: "Unaware Moron", effect: "Hit friend, double damage." },
				{ low: 96, high: 96, result: "Liability", effect: "Hit friend, double damage. Friend stunned for 1 round." },
				{ low: 97, high: 97, result: "Big Liability", effect: "Hit friend. Critical hit." },
				{ low: 98, high: 98, result: "Big Trouble", effect: "Roll twice on fumble chart. If this comes up again re-roll." },
				{ low: 99, high: 99, result: "Big Trouble in Little China", effect: "Roll thrice on fumble chart. If this comes up again re-roll." },
				{ low: 100, high: 100, result: "Disaster", effect: "Roll thrice on fumble chart. If this comes up again add two more rolls." }
			],

		getFumblerRange = function () {
			return fumble[fumble.length - 1].high;
		},

		/**
		 * Given a fumble chart name (handouts without the 'fumbler-' return the handout object)
		 * @param chartName
		 * @returns {T}
		 */
		getFumblerHandout = function (chartName) {
			let handouts = findObjs({ _type: "handout" });
			return _.find(handouts, function (handout) {
				return (handout.get('name') === 'fumbler-' + chartName);
			});
		},

		/**
		 * Utility function to determine if a variable is a number.
		 * @param obj
		 * @returns {boolean}
		 */
		isNumeric = function (obj) {
			return !isNaN(obj - parseFloat(obj));
		},

		/**
		 * Display in chat the result of the fumble for the given chart and roll.
		 * @param fumbleChart
		 * @param rolled
		 */
		showFumble = function (fumbleChart, rolled) {
			let whoops = _.find(fumbleChart, function (idiot) {
				return (rolled >= idiot.low && rolled <= idiot.high);
			});

			// Sanity check
			if (whoops) {
				let dc = "";
				if (whoops.dcLow && whoops.dcHigh) {
					let res = Math.floor(Math.random() * whoops.dcHigh) + whoops.dcLow;
					dc = "DC " + res;
				}

				// Send the fumble result as a formatted string in chat
				sendChat('Fumbler', "Rolled " + rolled + "/" + getFumblerRange() + "<br><b>" + whoops.result + "</b><br>" + whoops.effect + "<br><b>" + dc + "</b>");
			}
			else {
				sendChat('Fumbler', 'Invalid % roll given, or something went wrong. GM makes something up.');
			}
		},

		/**
		 * Handles adding a fumble to the rollable table
		 * @param addFumbleParams
		 */
		handleAddingFumble = function (addFumbleParams) {
			// parameters should be [0]: weight (num), [1]: title - one word (string), [2+] description
			if (addFumbleParams.length < 3) {
				sendChat('Fumbler', 'Invalid! Please enter the !addFumble, then [weight (number)] [title (one word)] [description]');
				return;
			}

			if (!isNumeric(addFumbleParams[0])) {
				sendChat('Fumbler', 'Invalid weight, should be a number! Please enter the !addFumble, then [weight (number)] [title (one word)] [description]');
				return;
			}

			let weight = parseInt(addFumbleParams[0]);
			let title = addFumbleParams[1];

			addFumbleParams.shift();
			addFumbleParams.shift();

			let description = addFumbleParams.join(' ');

			let highestRoll = getFumblerRange();

			fumble.push({
				low: highestRoll + 1,
				high: highestRoll + weight,
				result: title,
				effect: description
			});

			sendChat('Fumbler', 'Fumble added!');
		},

		/**
		 * Performs the actual logic to determine what chart to use and roll value.
		 * @param fumbleParams
		 */
		parseFumble = function (fumbleParams) {
			let rolled = randomInteger(getFumblerRange()); // Default to a random roll.
			let chart = fumble; // Use the default fumble chart.

			// No parameters so display the default chart and a random roll.
			if (fumbleParams.length === 0) {
				showFumble(chart, rolled);
				return;
			}

			// Single parameter that is numeric so set the roll value to the parameter and use the default fumble chart.
			if (fumbleParams.length === 1 && isNumeric(fumbleParams[0])) {
				rolled = parseInt(fumbleParams[0]);
				showFumble(chart, rolled);
				return;
			}

			// Two parameters so the second parameter must be a percentage.
			if (fumbleParams.length === 2) {
				rolled = parseInt(fumbleParams[1]);
			}

			// The 1st parameter is the name of the fumble chart (without 'fumbler-') in the handout.
			let fumbleHandout = getFumblerHandout(fumbleParams[0]);
			if (fumbleHandout) {
				// URI-escape the notes and remove the HTML elements from the notes.
				fumbleHandout.get('notes', function (notes) {
					try {
						notes = decodeURIComponent(notes).trim();
					}
					catch (err) {
						notes = decodeURI(notes).trim();
					}
					if (notes) {
						try {
							notes = notes.replace(/(<([^>]+)>)/ig, '');
							notes = notes.replace(/&nbsp;/gi, '') // Coder error. Not sure how to incorporate this regex to the above
							chart = JSON.parse(notes);
							chart.sort(sort_json_by_low)
							let bounded_roll = ((rolled > chart[chart.length - 1].high) ? randomInteger(chart[chart.length - 1].high) : rolled) // if a custom chart is allowed, roll up to whatever the maximum value specified is
							showFumble(chart, bounded_roll)
						}
						catch (err) {
							sendChat('Fumbler', 'The fumble chart handout has errors: ' + err.message);
						}
					}
				});
			}
			else {
				sendChat('Fumbler', 'Can not find the fumble chart handout named: ' + fumbleParams[0]);
			}
		},

		/**
		 * Sort json object list by "low" attribute
		 *
		 * @param {object} x
		 * @param {object} y
		 */
		sort_json_by_low = function (x, y) {
			if (x.low < y.low) {
				return -1;
			}
			else if (x.low > y.low) {
				return 1
			}
			return 0
		},


		/**
		 * Handle chat events
		 *
		 * @param {object} msg
		 */
		handleChatMessage = function (msg) {
			// Is the message the `!fumble` command?
			if (msg.type !== "api") {
				return;
			}

			if (msg.content != null) {
				let containsCommand = acceptedCommands.some(function (item) {
					return msg.content.startsWith(item);
				});

				if (!containsCommand) {
					return;
				}
			}
			else {
				return;
			}

			let content = msg.content;
			let words = content.split(' '); // Split each word into an array.
			let command = words[0];
			words.shift(); // Remove command for parameters

			switch (command) {
				case "!fumble":
					parseFumble(words); // Parse the fumble parameters.
					break;
				case "!addFumble":
					handleAddingFumble(words); // handle adding a fumble
					break;
			}
		},

		/**
		 * Start fumbler and handle chat events.
		 */
		init = function () {
			log('Starting Fumbler v' + version);

			on("chat:message", function (msg) {
				handleChatMessage(msg)
			});

			if (state.Fumbler) {
				if (state.Fumbler.fumble) {
					fumble = state.Fumbler.fumble;
				}
				else {
					state.Fumbler.fumble = fumble;
				}

				state.version = version;
			}
			else {
				state.Fumbler = {
					version: version,
					fumble: fumble
				}
			}
		};

	return {
		init: init
	};
}());

/**
 * Fires when the page has loaded.
 */
on("ready", function () {
	'use strict';

	fumbler.init();
});
