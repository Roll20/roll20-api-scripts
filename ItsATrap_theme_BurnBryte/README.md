# It's A Trap! - Burn Bryte Generic theme

This is a Burn Bryte trap theme built to support all Burn Bryte character sheets
By default, it will automatically detect which character sheet you're using,
but if needed, you can also specify which sheet the script is using from the
theme-specific trap properties.

This currently supports the following Burn Bryte character sheets:

* Roll20

## Theme-specific properties
The following trap properties are specific to this trap theme script.

### Character Sheet
Manually specify which character sheet your game is using. By default, this
will try to auto-detect your character sheet.

You can also specify that you are using a custom character sheet. If you do so,
an additional property will appear under this one to specify the attribute
names used for the custom sheet.

### Attack Complexity
When the trap activates, any characters affected will be prompted to use an action
to attempt to resolve the trap by avoiding it, disarming it, or otherwise nullifying its effects.
During combat, this property should be ignored in favor of the Adrenaline Effect rules.

### On Hit
Describe here what happens if a target fails their skill roll against the trap.

E.g. 'The target takes 1 damage.' or 'Gain a minor condition - sprained ankle.'

#### Failure Prompts
The On Hit property supports integration with Burn Bryte's Failure-Prompts
rollable table. To use it, just enter 'prompt' (without the quotes) for the
On Hit property.

### Perception Complexity
If this is set, passive perception will be enabled for the trap.
When a character gets close enough, this script will automatically roll their
Perception skill against the trap's Detection Complexity to attempt to notice it.
During combat, this does NOT count as an action.

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
