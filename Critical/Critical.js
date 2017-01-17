/* jshint undef: true */
/* globals
 sendChat,
 randomInteger,
 _,
 on
 */

var Critical = (function()
{
	'use strict';

	const criticalHit =
	[
		{low: 1,  high: 30,  result: "Hard Hit", slash: "2x Damage.", blunt: "2x Damage.", pierce: "2x Damage"},
		{low: 31, high: 40,  result: "Powerful Hit", slash: "2x Damage. 30% Chance shield breaks.", blunt: "2x Damage. 30% Chance shield breaks.", pierce: "2x Damage. Roll DEX or be knocked down."},
		{low: 41, high: 65,  result: "Massive Hit", slash: "3x Damage.", blunt: "3x Damage.", pierce: "3x Damage."},
		{low: 66, high: 69,  result: "Eviscerating Hit", slash: "3x Damage. 55% chance shield breaks", blunt: "3x Damage. 55% chance shield breaks", pierce: "3x Damage. Roll DEX or be knocked down."},
		{low: 70, high: 70,  result: "Hand", slash: "Slashed open, -1 to hit and damage.", blunt: "Smashed, -1 to hit and damage.", pierce: "Punctured muscle, -1 to hit and damage."},
		{low: 71, high: 71,  result: "Hand", slash: "Lose 1 finger, -1 to hit and damage.", blunt: "1d4 fingers broken, -1 to hit and damage.", pierce: "Punctured muscle, -1 to hit and damage."},
		{low: 72, high: 72,  result: "Hand", slash: "Lose 1d4 fingers, -2 to hit and damage.", blunt: "hand broken, -2 to hit and damage.", pierce: "Punctured hand incapacitated, -2 to hit and damage."},
		{low: 73, high: 73,  result: "Foot", slash: "Slashed open, 1/2 movement.", blunt: "Toe crushed, 1/2 movement.", pierce: "Punctured muscle, 1/2 movement."},
		{low: 74, high: 74,  result: "Foot", slash: "Lose 1d2 toes, 1/2 movement.", blunt: "Smashed, 1/4 movement.", pierce: "Punctured muscle, 1/2 movement."},
		{low: 75, high: 75,  result: "Leg", slash: "Slashed open, 1/2 movement.", blunt: "Crushed thigh, 1/2 movement. Roll DEX or fall", pierce: "Punctured thigh, 1/2 movement. Roll DEX or fall."},
		{low: 76, high: 76,  result: "Leg", slash: "Removed at ankle, opponent falls.", blunt: "Broken knee, 1/4 movement. Roll DEX or fall", pierce: "Punctured thigh, 1/4 movement. Roll DEX or fall."},
		{low: 77, high: 77,  result: "Leg", slash: "Removed at knee, opponent falls.", blunt: "Broken hip bone, opponent falls, 1/4 movement. Roll DEX or fall", pierce: "Split knee, fall, 1/2 movement."},
		{low: 78, high: 78,  result: "Leg", slash: "Removed below hip, opponent falls.", blunt: "Broken skin, opponent falls, 1/4 movement.", pierce: "Split knee, fall, 1/4 movement."},
		{low: 79, high: 79,  result: "Arm", slash: "Wrist removed.", blunt: "Broken wrist.", pierce: "Pierced wrist, -1 to hit and damage."},
		{low: 80, high: 80,  result: "Arm", slash: "Elbow removed.", blunt: "Broken elbow.", pierce: "Torn shoulder, -1 to hit and damage."},
		{low: 81, high: 81,  result: "Arm", slash: "Arm removed below shoulder.", blunt: "Broken shoulder, incapacitated.", pierce: "Torn shoulder, incapacitated."},
		{low: 82, high: 82,  result: "Abdominal", slash: "Ripped open, guts hanging out, roll STR or fall.", blunt: "Broken shoulder, incapacitated.", pierce: "Torn shoulder, incapacitated."},
		{low: 83, high: 83,  result: "Abdominal", slash: "Ripped open, guts hanging out, stunned for one round.", blunt: "Crushed guts, stunned for one round.", pierce: "Stabbed, dead."},
		{low: 84, high: 84,  result: "Abdominal", slash: "Ripped open, dead.", blunt: "Pulped guts, dead.", pierce: "Stabbed, dead."},
		{low: 85, high: 85,  result: "Chest and Neck", slash: "Lung slashed, -1 on attack and damage.", blunt: "Shoulder smashed, -1 on attack and damage.", pierce: "Lung pierced, -1 on attack and damage."},
		{low: 86, high: 86,  result: "Chest and Neck", slash: "Rib broken, stunned one round.", blunt: "Shoulder crushed, -1 on attack and damage.", pierce: "Lung pierced, stunned for 1 round."},
		{low: 87, high: 87,  result: "Chest and Neck", slash: "Chest slashed open, dead.", blunt: "Rib broken, stunned one round.", pierce: "Lung pierced, stunned for 1 round."},
		{low: 88, high: 88,  result: "Chest and Neck", slash: "Throat cut, no speech.", blunt: "Rib broken, stunned one round.", pierce: "Chest pierced, incapacitated."},
		{low: 89, high: 89,  result: "Chest and Neck", slash: "Throat cut, no speech, lose helm.", blunt: "Ribcage broken, incapacitated.", pierce: "Heart pierced, dead."},
		{low: 90, high: 90,  result: "Chest and Neck", slash: "Chest slashed, -2 on attack and damage.", blunt: "Chest crushed, -2 on attack and damage.", pierce: "Heart pierced, dead."},
		{low: 91, high: 92,  result: "Chest and Neck", slash: "Throat cut, dead.", blunt: "Chest crushed, dead.", pierce: "Throat pierced, no speech."},
		{low: 93, high: 94,  result: "Head", slash: "Eye removed, stunned one round.", blunt: "Skull hit, stunned 1 round, lose 1d4 INT", pierce: "Throat pierced, dead."},
		{low: 95, high: 96,  result: "Head", slash: "Ear removed, lose helm.", blunt: "Skull hit, stunned 1 round, lose 2d4 INT", pierce: "Eye removed, lose helm."},
		{low: 95, high: 96,  result: "Head", slash: "Ear removed, lose helm.", blunt: "Skull hit, stunned 1 round, lose 2d4 INT", pierce: "Eye removed, lose helm."},
		{low: 97, high: 97,  result: "Head", slash: "Nose removed.", blunt: "Nose crushed.", pierce: "Skull hit, stunned 1 round, lost 1d4 INT."},
		{low: 98, high: 98,  result: "Head", slash: "1d4 teeth lost.", blunt: "1d4 teeth crushed.", pierce: "Skull hit, stunned 1 round, lost 1d4 INT."},
		{low: 99, high: 99,  result: "Head", slash: "Nose removed, 1d4 teeth lost.", blunt: "Nose crushed, 1d4 teeth crushed.", pierce: "Skull pierced, dead."},
		{low: 100, high: 100,  result: "Head", slash: "Decapitated, dead.", blunt: "Skull crushed, dead.", pierce: "Skull pierced, dead."}
	];

	function registerEventHandlers()
	{
		on('chat:message', Critical.handleChatMessage);
	}

	/**
	 * Grab chat message objects
	 *
	 * @param {object} msg
	 */
	function handleChatMessage(msg)
	{

		// Check if we are dealing with a !critical command.
		if (msg.type === "api" && msg.content.indexOf("!critical") !== -1)
		{
			var content = msg.content;
			var words = content.split(' ');

			// Sanity check
			if (words.length > 0)
			{
				// Sanity check
				if (words[0] === '!critical')
				{
					var rolled = 0;

					// Was a roll amount given? If so parse the second "word" as an int, otherwise create a randomInteger.
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

					// Get the smack object as a smash variable
					var smash = Critical._determineCritical(rolled);

					// Sanity check
					if (smash)
					{
						// Send the critical result as a formatted string in chat
						sendChat('Critical Hit', rolled.toString() + "% <b>" + smash.result + "</b><br><i><b>Slash: </b>" + smash.slash + '</i><br><i><b>Blunt: </b>' + smash.blunt + '</i><br><i><b>Pierce: </b>' + smash.pierce + '</i>');
					}
					else
					{
						sendChat('Critical Hit', 'Invalid % roll given, or something went wrong. GM makes something up.');
					}
				}
			}
		}
	}

	/**
	 * Internal function given the roll value returns the object indicating the result and effect.
	 *
	 * @param {int} roll
	 * @return {object} smack
	 * @private
	 */
	function _determineCritical(roll)
	{
		// Use _.find to figure out what happened.
		return _.find(criticalHit, function (hit)
		{
			return (roll >= hit.low && roll <= hit.high);
		});
	}

	return {
		registerEventHandlers: registerEventHandlers,
		handleChatMessage: handleChatMessage,
		_determineCritical: _determineCritical
		}
}());

/**
 * Fires when the page has loaded.
 */
on("ready", function()
{
	Critical.registerEventHandlers();
});
