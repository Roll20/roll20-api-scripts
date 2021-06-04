API Chat Commands

	Settings:
		Log
			* default: 'on' and 'single'
			* Description: Sets the visual output in the chat window for the dice rolls
			* Command: !eed log on|off|multi|single
		
		Graphics
			* default: 'on' and 'm'
			* Description: Sets chat window dice output as graphic, small, medium, or large if "on" or as text if "off"
			* Command: !eed graphics on|off|s|m|l
		
		Test
			* Description: Output every side of every die to the chat window
			* !eed test

		Debug
			* default: 'off'
			* DescriptionL Sets the logging level of the script in the API console.  If you are having issues with the 
			* script rolling incorect dice, turn on debug logging and post the result in the forums. No need to restart the
			* script with this command.
			* Command: !eed debug on|off
	
	Roll:
		Label
			* default: null
			* Description: set the skill name of the roll
			* Command: !eed label(Name of Skill)
		
		Initiative
			* default: false
			* Description: Set NPC/PC initiative true
			* Command: !eed npcinit or pcinit and #b #g #y #blk #p #r #w
		
		Skill
			* default: 
			* Description: create the ability and proficiency dice for a skill check
			* Command: !eed skill(char_value|skill_value)
		
		Opposed
			* default: 
			* Description: create the difficulty and challenge dice for an opposed skill check
			* Command: !eed opposed(char_value|skill_value)
		
		Dice
			* default: 
			* Description: Loop thru the dice and adds or subtracts them from the dice object
			* Command: !eed #g #y #b #blk #r #p #w #s #a
		
		Upgrade
			* default: 
			* Description: upgrades ability and difficulty dice
			* Command: !eed upgrade(ability|#) or upgrade(difficulty|#)
		
		Downgrade
			* default: 
			* Description: downgrades proficiency and challenge dice
			* Command: !eed downgrade(proficiency|#) or downgrade(challenge|#)

        Destiny
          * default:
          * Description: Rolls 1w die and adds the result to the destiny pool
          * Command: !eed #w destiny doRoll

   Other:
      Charsheet
          * default:
          * Description: Generates a blank character sheet and automatically makes it viewable and editable by the person calling the script.
          * Command: !charsheet