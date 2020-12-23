# Dungeon Master Tools

## Features
This script provides a Framework to enhance the Roll20 experience.

The Dungeon Master tools currently provides the following features
* Automatically adding the *dead* Token Icon 
* Removing items from the turn order once their value drops below zero
* provides a command for awarding XP.

Additional class specific modules can be installed to extend the functionality provided here.

## API Commands

**!dm-help** - Gives a list of the script's API commands in the chat tab.

**!dm-status** - Lists the current status of the script's features in the chat tab.

**!dm-reset** - Resets all configuration options, ignore any one-click user options currently set

**!dm-token-tracking** _icon_ _value_ - Sets tracking of the token icon status, only supported <value> are 'on' and 'off'.
Initially the only <icon> supported is 'dead', but class modules will intro additional tracked icons.

**!dm-config** _option_ _value_ - Sets status of configuration option, only supported <value> are 'on' and 'off'.  Initially the only <option> supported is 'purge-turn-order', but class modules will intro additional options that can be toggled.

**!dm-action** _module_ _action_ _options_ - Used to dispatch an action to a class module.

Here's an example that would dispatch the **rage** action to the barbarian module passing the selected token and setting the gender as **her**: *!dm-action barbarian rage @{selected|character_id} her* 

**!dm-award-xp** <amount> <message> - This will give each player character currently in the turn order the amount of xp specified and display the message in chat.  Use *###XP###* as a place holder for the xp awarded.  

Here's an example use in a macro that prompts for xp amount:
_!dm-award-xp ?{How much?|100} Your heroics have earned you ###XP### experience points!_

**!dm-award-selected-xp** <amount> <message> - This will give each character selected on the map the amount of xp specified and display the message in chat.  Use *###XP###* as a place holder for the xp awarded.

## Interested in Expanding?
*  All expansions are done by extending the **RatWorkshop_Module** class
* Include a **static MODULE_NAME** set to the name of the module.
* Call the register method from out side the class

Here is a bare shell for a Barbarian Module
```javascript
class DungeonMasterToolsBarbarian extends RatWorkshop_Module {
   static MODULE_NAME = 'Barbarian';
}
DungeonMasterToolsBarbarian.register();
```

#### Actions
All action methods need to have a prefix of **action_** and accepts an array of options and the original message (which can be deconstructed)
```javascript
action_rage(options, { playerid: playerId })
```
Callback functions can have any name, but for convention I prefix them with **end_action_** and match the action
```javascript
end_action_rage({ characterId })
```

#### Dungeon Master Tools API
* sendMessage(who, message, template, prefix = '', options = {}, callback = null)
* sendErrorMessage(playerId, message)
* sendActionMessage(character, message) 
* addTurnOrder(event)
* addEvent(eventId, characterId, tokenId, action, callbackModule, callbackAction)
* getTrait(characterId, trait)
* getResource(characterId, resource) 
* getGlobalModifier(characterId, modifier)
* getToken(characterId)
