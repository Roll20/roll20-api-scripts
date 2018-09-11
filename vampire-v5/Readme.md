# Vampire the Masquerade 5th Edition Dice Roller.

### Current Version
Version 1.2 (2018/09/08) 

### Many Thanks	
Many thanks to Konrad J who's Hero Quest roller this is based on.

### Known Bugs

Errors may occur if the player enters a name with tilde (\~), this is because the tilde is symbol I've used to identify names. There are no plans to fix this as this was introduce to enable full names.

### Guide to use the code

There are several different types of rolls that are available.
In these rolls the first two arguments must be !vtm [type] all other numbers are optional and may be ignored depending on the type of roll

!vtm atr a# r# m#	// Rolling for attributes a# is the number of dice associated with the attribute, r# number of dice associated with hunger, m# is a dice modifier to apply. Example !vtm atr a2 r2 m3 
!vtm skill a# s# r# m#	// Rolling for skills a# is the number of dice associated with the attribute, s# the number of dice for the skill r# number of dice associated with hunger, m# is a dice modifier to apply. Example !vtm atr a2 s3 r2 m3 
!vtm will w# a# m#	// Rolling for willpower w# is the number of willpower dice a# is the number of dice associated with an attribute, m# is a dice modifier to apply. Example !vtm atr a2 w2 m3 
!vtm will p# a# m#	// Rolling for willpower p# is an strange number. By and large you should not use it unless you are creating your own multi-state health/willpower boxes. In such cases please look at the html of the V5 character sheet to see how I have implemented it.
!vtm roll w# r#      // Is a straight roll, the w# represents the number of black die, the r# represents the number of red die to roll Example !vtm roll w2 r2
Note: For anyone reading the code, to make the frenzy roll work I had to invert the DC thus asking the play to roll less than 7 is instead interpretted as asking the player to roll 5 or higher (these are probabilistically equal statements).
!vtm rouse          // Rolls one single rouse dice. Success on 6+
!vtm reroll w#      // Used for will power re-roll # is the number of die to roll
!vtm frenzy p# o# q# // Rolls for frenzy. This is used to add 1/3 humanity (rounded down) to willpower, to roll. As mentioned previously p# is a special case and the number of dice rolled is not equal to the number you enter. Unless you are looking at multistate boxes, don't use this. o# is similar but for humanity. q# Should be used to set the difficulty of the Frenzy roll
!vtm remorse x# m# // Used for remorse roll. x# is under a similar constraint as p# and o# due to multistate checkbox issues once again.
!vtm humanity o# m# // Used for humanity roll. 

Optional Flags:
An extra variable (c~custom name ~) may be added to any of these rolls to display a custom name in the roll template. Note: As a coding querk please have a space after the name but before the close in the tilde.
Example !vtm roll w5 r1 c~Prince Wolf ~ will roll 5 black die, 1 red die and the character will have the name - Prince Wolf
An extra variable (t~custom name~) may be added to any of these rolls to display the roll type. This is text below the custom name
Adding b# to a skill roll will add the value/2.0 to the number of vampire dice. This is used for blood potency when handling disciplines
If needs be both the Frenzy and Humanity Roll can be updated to use real values. For now however I'm going to leave it.

For people reading the code there are several functions which I have yet to remove and currently can not be relied on to function. These are:
  !vtm log on|multi|single|off  // default:on and multi
	outputs dice rolled to the chat window if "on", only the result if "off"
	dice rolled will be on single line if "single" and on multiple lines if "multi"
  !vtm graphics on|off|s|m|l  //default:on and m
	shows dice rolled as graphic, small, medium, or large if "on" or as text if "off"
  !vtm test // this will output every side of every die to the chat window (currently does not work)
  !vtm hero // Only for true heroes
  !vtm lupine // When people ask for too much. Currently disabled.

### Versions
Version 1.2
Updated images to a different location. Fixed bugs where players name would not appear for specific rolls. Fixed bug in which speech marks in a players name would cause issues.
Version 1.1
Bug fixes and updated images to a different location. Renamed Humanity to Remorse, added a new "Humanity" roll.