/* jshint undef: true */
/* globals
 state,
 sendChat,
 randomInteger,
 _,
 on
 */

/* Eclectic collection of fumbles */
const fumble =
	[
		{low: 1,  high: 10, result: "Distracted", effect: "Roll DEX or fall down."},
		{low: 11, high: 14, result: "Negligent", effect: "Fall down."},
		{low: 15, high: 20, result: "Careless", effect: "Lost footing. -1 to hit on next turn."},
		{low: 21, high: 25, result: "Delinquent", effect: "Slip. Do the splits. -2 to hit on next turn."},
		{low: 26, high: 39, result: "Clumsy", effect: "Fall down. Roll DEX or drop primary weapon."},
		{low: 40, high: 50, result: "Very Clumsy", effect: "Fall, drop primary weapon, roll DEX or be stunned for 1 round."},
		{low: 51, high: 53, result: "Useless", effect: "Fall. Stunned for 1 round."},
		{low: 54, high: 57, result: "Dazed", effect: "Fall. Drop primary weapon. Stunned for 1 round."},
		{low: 58, high: 59, result: "Stunned", effect: "Fall. Stunned for 1 round."},
		{low: 60, high: 60, result: "Dazed and Stunned", effect: "Fall. Drop primary weapon. Stunned for 1d4 rounds."},
		{low: 61, high: 61, result: "Unconscious", effect: "Fall, knocked head on floor, knocked out for 1d4 rounds."},
		{low: 62, high: 62, result: "Inept", effect: "Weapon disarmed by opponent and thrown d20 ft in random direction."},
		{low: 63, high: 64, result: "Very Inept", effect: "Weapon or appendage breaks or is broken."},
		{low: 65, high: 65, result: "Fail", effect: "Hit Self in groin. Roll CON or double over in pain, go last next round."},
		{low: 66, high: 66, result: "Loser", effect: "Hit Self in groin. Double over in pain, go last next round."},
		{low: 67, high: 67, result: "Klutz", effect: "Twist ankle, 1/2 movement."},
		{low: 68, high: 69, result: "Dangerous Klutz", effect: "Twist knee, 1/4 movement."},
		{low: 70, high: 70, result: "Untrained", effect: "Twist wrist, weapon arm incapacitated, drop weapon."},
		{low: 71, high: 71, result: "Vulnerable", effect: "Opponent steps on foot, go last next round."},
		{low: 72, high: 72, result: "Knocked Silly", effect: "Helm twists, blind till end of next round. Roll again if not wearing helm."},
		{low: 73, high: 74, result: "Poor Judgement", effect: "Wrong move, opponent's next attack +4 to hit."},
		{low: 75, high: 76, result: "Handled Badly", effect: "Knuckles hit, -4 to hit until next round."},
		{low: 77, high: 79, result: "Embarrassing", effect: "Armor piece knocked off, strap cut, belt cut, clothes torn, lose 2 AC until fixed."},
		{low: 80, high: 80, result: "Nards", effect: "Opponent's parry hits groin, 1/2 move, -4 to hit for 3 rounds."},
		{low: 81, high: 81, result: "Not Funny", effect: "Opponent's parry hits funny bone in weapon arm, -2 damage for 3 rounds."},
		{low: 82, high: 82, result: "Blind Eye", effect: "Dirt blinds one eye, -1 to hit until cleaned."},
		{low: 83, high: 83, result: "Blind Mans Bluff", effect: "Dirt blinds two eyes, -3 to hit until cleaned."},
		{low: 84, high: 85, result: "Fool", effect: "Hit self. Normal damage."},
		{low: 86, high: 86, result: "Useless Fool", effect: "Hit self. Normal damage. Stunned for 1 round."},
		{low: 87, high: 88, result: "Moron", effect: "Hit self. Double damage."},
		{low: 89, high: 89, result: "Useless Moron", effect: "Hit self. Double damage. Stunned for 1 round."},
		{low: 90, high: 90, result: "Complete Moron", effect: "Hit self. Critical hit."},
		{low: 91, high: 92, result: "Unaware", effect: "Hit friend, normal damage."},
		{low: 93, high: 93, result: "Very Unaware", effect: "Hit friend, normal damage. Friend stunned for 1 round."},
		{low: 94, high: 95, result: "Unaware Moron", effect: "Hit friend, double damage."},
		{low: 96, high: 96, result: "Liability", effect: "Hit friend, double damage. Friend stunned for 1 round."},
		{low: 97, high: 97, result: "Big Liability", effect: "Hit friend. Critical hit."},
		{low: 98, high: 98, result: "Big Trouble", effect: "Roll twice on fumble chart. If this comes up again re-roll."},
		{low: 99, high: 99, result: "Big Trouble in Little China", effect: "Roll thrice on fumble chart. If this comes up again re-roll."},
		{low: 100, high: 100, result: "Disaster", effect: "Roll thrice on fumble chart. If this comes up again add two more rolls."},
	];


var fumbler =
{

	/**
	 * Register Fumbler
	 */
	init: function ()
	{
		'use strict';

		if (!state.hasOwnProperty('fumbler'))
		{
			state.fumbler = {};
		}

		if (!state.fumbler.hasOwnProperty('fumble'))
		{
			state.fumbler.fumble = fumble;
		}

		on("chat:message", fumbler.handleChatMessage);
	},

	/**
	 * Hook to chat events
	 *
	 * @param {object} msg
	 */
	handleChatMessage: function (msg)
	 {
		'use strict';

		// Is the message the `!fumble` command?
		if (msg.type === "api" && msg.content.indexOf("!fumble") !== -1)
		{
			var content = msg.content;
			var words = content.split(' '); // Split each word into an array.

			// Sanity check
			if (words.length > 0)
			{
				// Sanity check
				if (words[0] === '!fumble')
				{
					var rolled = 0; // Set to integer.

					// Was a roll amount given? If so parse the second "word" as an int,
					// otherwise create a randomInteger.
					if (words.length === 2)
					{
						rolled = parseInt(words[1]);
					}
					else
					{
						rolled = randomInteger(100);
					}

					// Sanity check
					if (typeof rolled !== 'number' || rolled === 0)
					{
						rolled = randomInteger(100);
					}

					// Get the moron object as a whoops variable.
					var whoops = fumbler._determineFumble(rolled);

					// Sanity check
					if (whoops)
					{
						// Send the fumble result as a formatted string in chat
						sendChat('Fumbler', rolled.toString() + "% <b>" + whoops.result + "</b><br>" + whoops.effect);
					}
					else
					{
						sendChat('Fumbler', 'Invalid % roll given, or something went wrong. GM makes something up.');
					}
				}
			}
		}
	},

	/**
	 * Internal function given the roll value returns the object indicating the result and effect of the fumble.
	 *
	 * @param {int} roll
	 * @return {object} moron
	 * @private
	 */
	_determineFumble: function (roll)
	{
		'use strict';

		// Use _.find to figure out what happened.
		return _.find(state.fumbler.fumble, function (idiot)
		{
			return (roll >= idiot.low && roll <= idiot.high);
		});
	}
};

/**
 * Fires when the page has loaded.
 */
on("ready", function()
{
	'use strict';

	fumbler.init();
});
