# It's A Trap! - D&D 5E Generic

_v3.2 Updates:_

* Implemented automatic character sheet detection.
* User can also manually select which character sheet is being used in-game.
* User can specify custom sheet and its attributes in-game.

This is a trap theme to support any campaign using D&D 5th Edition rules.
By default, it will automatically detect which character sheet you're using,
but if needed, you can also specify which sheet the script is using from the
theme-specific trap properties.

This currently supports the following D&D 5E character sheets:

* Roll20 Official
* Community
* Shaped

## Theme-specific properties
The following trap properties are specific to this trap theme script.

### Character Sheet
Manually specify which character sheet your game is using. By default, this
will try to auto-detect your character sheet.

You can also specify that you are using a custom character sheet. If you do so,
an additional property will appear under this one to specify the attribute
names used for the custom sheet.

### Attack Bonus
The modifier for the trap's attack roll, if it makes an attack roll.

### Damage
A dice expression for the damage dealt by the trap on a hit. This does not
take any damage resistances or immunities into account. Neither does it
actually subtract the hit points. You'll have to do that manually.

### Miss - Half Damage
This property specifies whether victims of the trap will still take half damage,
even if they avoided the trap. This does not take into account any special
abilities such as _Evasion_.

### Saving Throw
This property allows you to configure a saving throw for the trap which is
rolled automatically for each affected character.

The first prompt asks for which saving throw to use.

The second prompt asks for the saving throw's DC.

The third prompt asks whether the result of the saving throw should be visible
only to the GM, hidden from the players.

### Passive Detection DC
This property specifies the passive Perception score needed for a character to
passively detect the trap.

## Help

My scripts are provided 'as-is', without warranty of any kind, expressed or implied.

That said, if you experience any issues while using this script,
need help using it, or if you have a neat suggestion for a new feature,
please shoot me a PM:
https://app.roll20.net/users/46544/stephen-l

When messaging me about an issue, please be sure to include any error messages that
appear in your API Console Log, any configurations you've got set up for the
script in the VTT, and any options you've got set up for the script on your
game's API Scripts page. The more information you provide me, the better the
chances I'll be able to help.

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, maintaining, and providing tech support my API scripts,
please consider buying one of my art packs from the Roll20 marketplace:

https://marketplace.roll20.net/browse/search?category=itemtype:Art&author=Stephen%20Lindberg|Stephen%20L
