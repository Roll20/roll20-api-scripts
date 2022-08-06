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

	let version = '0.4.0',

	/* collection of possible commands for fumbler */
	acceptedCommands =
		[
			"!fumble",
			"!addFumble",
			"!removeFumble",
			"!resetFumbleList",
			"!clearFumbleList",
		],

	/* Eclectic collection of fumbles */
	fumble =
		[
			{ weight: 11, result: "Distracted", effect: "Something caught your eye while preparing for your attack, causing you to lose your balance.  Roll DEX or fall prone.", dcLow: 8, dcHigh: 20 },
			{ weight: 4, result: "Negligent", effect: "You didn't properly set your feet while preparing your attack.  Fall prone." },
			{ weight: 6, result: "Careless", effect: "You lost your footing and feel pretty 'off'. -1 to hit on next attack." },
			{ weight: 5, result: "Delinquent", effect: "You've slipped and can't recover your fighting spirit quickly. -2 to hit on next attack." },
			{ weight: 14, result: "Clumsy", effect: "Fall down. Roll DEX or drop primary weapon.", dcLow: 8, dcHigh: 20 },
			{ weight: 11, result: "Very Clumsy", effect: "Fall, drop primary weapon, roll DEX or be stunned for 1 round.", dcLow: 8, dcHigh: 20 },
			{ weight: 3, result: "Useless", effect: "Fall. Stunned for 1 round." },
			{ weight: 4, result: "Dazed", effect: "Fall. Drop primary weapon. Stunned for 1 round." },
			{ weight: 2, result: "Stunned", effect: "Fall. Stunned for 1 round." },
			{ weight: 1, result: "Dazed and Stunned", effect: "Fall. Drop primary weapon. Stunned for 1d4 rounds." },
			{ weight: 1, result: "Unconscious", effect: "Fall, knocked head on floor, knocked out for 1d4 rounds." },
			{ weight: 1, result: "Inept", effect: "Weapon disarmed by opponent and thrown d20 ft in random direction." },
			{ weight: 1, result: "Very Inept", effect: "Weapon or appendage breaks or is broken." },
			{ weight: 1, result: "Fail", effect: "Hit Self in groin. Roll CON or double over in pain, go last next round.", dcLow: 8, dcHigh: 20 },
			{ weight: 1, result: "Loser", effect: "Hit Self in groin. Double over in pain, go last next round." },
			{ weight: 1, result: "Klutz", effect: "Twist ankle, 1/2 movement." },
			{ weight: 2, result: "Dangerous Klutz", effect: "Twist knee, 1/4 movement." },
			{ weight: 1, result: "Untrained", effect: "Twist wrist, weapon arm incapacitated, drop weapon." },
			{ weight: 1, result: "Vulnerable", effect: "Opponent steps on foot, go last next round." },
			{ weight: 1, result: "Knocked Silly", effect: "In a twist of fate, you struck yourself in the head, causing blood to get in your eyes.  You are blinded until the end of next round." },
			{ weight: 2, result: "Poor Judgement", effect: "Wrong move, opponent's next attack +4 to hit." },
			{ weight: 2, result: "Handled Badly", effect: "Knuckles hit, -4 to hit until next round." },
			{ weight: 3, result: "Embarrassing", effect: "Armor piece knocked off, strap cut, belt cut, clothes torn, lose 2 AC until fixed." },
			{ weight: 1, result: "Nards", effect: "Opponent's parry hits groin, 1/2 move, -4 to hit for 3 rounds." },
			{ weight: 1, result: "Not Funny", effect: "Opponent's parry hits funny bone in weapon arm, -2 damage for 3 rounds." },
			{ weight: 1, result: "Blind Eye", effect: "Dirt blinds one eye, -1 to hit until cleaned." },
			{ weight: 1, result: "Blind Mans Bluff", effect: "Dirt blinds two eyes, -3 to hit until cleaned." },
			{ weight: 2, result: "Fool", effect: "Hit self. Normal damage." },
			{ weight: 1, result: "Useless Fool", effect: "Hit self. Normal damage. Stunned for 1 round." },
			{ weight: 2, result: "Moron", effect: "Hit self. Double damage." },
			{ weight: 1, result: "Useless Moron", effect: "Hit self. Double damage. Stunned for 1 round." },
			{ weight: 1, result: "Complete Moron", effect: "Hit self. Critical hit." },
			{ weight: 2, result: "Unaware", effect: "Hit friend, normal damage." },
			{ weight: 1, result: "Very Unaware", effect: "Hit friend, normal damage. Friend stunned for 1 round." },
			{ weight: 2, result: "Unaware Moron", effect: "Hit friend, double damage." },
			{ weight: 1, result: "Liability", effect: "Hit friend, double damage. Friend stunned for 1 round." },
			{ weight: 1, result: "Big Liability", effect: "Hit friend. Critical hit." },
			{ weight: 1, result: "Big Trouble", effect: "Roll twice on fumble chart. If this comes up again re-roll." },
			{ weight: 1, result: "Big Trouble in Little China", effect: "Roll thrice on fumble chart. If this comes up again re-roll." },
			{ weight: 1, result: "Disaster", effect: "Roll thrice on fumble chart. If this comes up again add two more rolls." }
		],

		/**
		 * Gets highest number for fumble range
		 */
		getFumblerRange = function (fumbleChart) {
			if (fumbleChart.length == 0) {
				return 0;
			}
			else if (fumbleChart[0].high) {
				return fumbleChart[fumbleChart.length - 1].high;
			}
			else {
				let weights = fumbleChart.map(u => u.weight);
				return weights.reduce((a, b) => a + b, 0);
            }
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
			let whoops;

			if (fumbleChart.length < 1) {
				sendChat('Fumbler', "Invalid! Fumble Chart has no fumbles to choose from!");
				return;
            }

			if (fumbleChart[0].low && fumbleChart[0].high) {
				whoops = _.find(fumbleChart, function (idiot) {
					return (rolled >= idiot.low && rolled <= idiot.high);
				});
			}
			else if (fumbleChart[0].weight) {
				let foundWeight = 0;

				for (let i = 0; i < fumbleChart.length; i++) {

					if (foundWeight < rolled && rolled <= foundWeight + fumbleChart[i].weight) {
						whoops = fumbleChart[i];
						break;
					}

					foundWeight += fumbleChart[i].weight;
				}
			}
			else {
				sendChat('Fumbler', "Invalid! Fumble Chart does not contain 'high' and 'low', or 'weight' fields!");
            }

			// Sanity check
			if (whoops) {
				let dc = "";
				if (whoops.dcLow && whoops.dcHigh) {
					let res = Math.floor(Math.random() * (whoops.dcHigh - whoops.dcLow + 1)) + whoops.dcLow;
					dc = "DC " + res;
				}

				// Send the fumble result as a formatted string in chat
				sendChat('Fumbler', "Rolled " + rolled + "/" + getFumblerRange(fumble) + "<br><b>" + whoops.result + "</b><br>" + whoops.effect + "<br><b>" + dc + "</b>");
			}
			else {
				sendChat('Fumbler', 'Invalid % roll given, or something went wrong. GM makes something up.');
			}
		},

	/**
	 * Handles removing all fumbles with provided name from the rollable table
	 * @param removeFumbleParams
	 */
		handleRemovingFumble = function (removeFumbleParams) {
			if (removeFumbleParams.length != 1) {
				sendChat('Fumbler', 'Invalid! Please enter the !removeFumble command, then [title (one word)] to remove that fumble');
				return;
			}

			let specificFumbleList = fumble.filter(u => u.result == removeFumbleParams[0]);
			for (let i = 0; i < specificFumbleList.length; i++) {
				fumble.splice(fumble.indexOf(specificFumbleList[i]), 1);
				sendChat('Fumbler', 'Removed "' + specificFumbleList[i].result + '"');
            }
        },


		/**
		 * Handles adding a fumble to the rollable table
		 * @param addFumbleParams
		 */
		handleAddingFumble = function (addFumbleParams) {
			// parameters should be [0]: weight (num), [1]: title - one word (string), [2+] description
			if (addFumbleParams.length < 3) {
				sendChat('Fumbler', 'Invalid! Please enter the !addFumble command, then [weight (number)] [title (one word)] [description]');
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

			fumble.push({
				weight: weight,
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
			let rolled = randomInteger(getFumblerRange(fumble)); // Default to a random roll.
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
							if (chart.length == 0) {
								sendChat('Fumbler', 'The fumble chart handout has zero entries');
							}
							else if (chart[0].low && chart[0].high) {
								chart.sort(sort_json_by_low)
								let bounded_roll = ((rolled > chart[chart.length - 1].high) ? randomInteger(chart[chart.length - 1].high) : rolled) // if a custom chart is allowed, roll up to whatever the maximum value specified is
								showFumble(chart, bounded_roll)
							}
							else {
								let range = getFumblerRange(chart)
								showFumble(chart, rolled > range ? randomInteger(range) : rolled);
                            }
							
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
				case "!removeFumble":
					handleRemovingFumble(words); // handle removing a fumble
					break;
				case "!resetFumbleList": // reset fumble list to default
					fumble = [...state.Fumbler.resetFumble];
					state.Fumbler.fumble = fumble;
					sendChat('Fumbler', 'Fumble list reset!');
					break;
				case "!clearFumbleList": // clear fumble list entirely
					fumble = [];
					state.Fumbler.fumble = fumble;
					sendChat('Fumbler', 'Fumble list cleared!');
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
				state.Fumbler.resetFumble = [...fumble];

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
					fumble: fumble,
					resetFumble: [...fumble]
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
