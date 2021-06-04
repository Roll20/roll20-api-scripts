# HeroSystem6e api script
This API is designed for use with the [HeroSystem6e character sheet](https://github.com/Roll20/roll20-character-sheets/tree/master/HeroSystem6e).  If you are not using that character sheet, this api script will most likely be of no use to you.

This api script listens to chat for die rolls and its primary functions execute when they detect a "hero6template" roll template.  This API will count the body value of any normal damage dice and compute the DCV hit of any attack roll, sending the output to chat formatted to match the HeroSystem6e roll template.  If by some remote chance you have a use for this api script outside of the HeroSystem6e character sheet, here are the specifics of what this api will do...

---
This script will count the BODY of any damage roll.  The necessary roll properties are:

	{{damage=[8d6]}}
	{{count=BODY}}
The 8d6 is just an example.  All dice must be d6.  Half dice are handled as d3 and do NOT follow the rules in the Hero6System rulebook.  

---
This script will count the levels of luck from a Luck roll.  The necessary roll properties are:

	{{total=[[3d6]]}}
    {{count=Luck}}
The 3d6 is just an example.

---
This script will compute the DCV value of an attack roll.  The necessary roll properties are:

	{{ocv=7}}
    {{attack=[[3d6]]}}
The 7 is just an example.

---
The script does support some command line options that generate unformatted chat output when paired with die rolls.

	/roll 3d6 show body
    [[8d6]] show body
Adding "show body" to a die roll will count and display the body value.  If you rolled damage dice and forgot to include the text "show body", you can enter the chat command "last body" to get the BODY count of the last die roll.

	[[8d6]]
    last body
If you add the text "hit location" to a die roll, it will display the body part hit using the standard hit location chart.

	/roll 3d6 hit location
And that is all.