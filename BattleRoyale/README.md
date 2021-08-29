# **Battle Royale - A GM-less solution for PvP combat**

### Disclaimer
I'm relatively new to Roll20 API development, and rarely use js so it seems very likely that this script is terribly optimized and in direct violation of countless best-practices.

### Releases:
* 0.1.0: Initial Release. Any feedback and bug-reports are more then welcome!

### What is this:
This script contains a list of features that facilitates players to run a Battle Royale PvP without having a DM present, or with the DM having joined as a player. This way no player has to feel left out of the action! 

### Brief summary of features in this script;
 * Automatically generated token macros or chat buttons for all commands 
 * Spectator mode (*For spectators or dead contestants*)
 * Turn order control via chat (*Order, Clear, Advance etc.*)
 * Randomized spawning on predetermined spawn points
 * Easy team assignment through status markers (*Teams spawn together*)
 * Open/Closable doors that block vision when closed
 * A beautiful example arena map created in Dungeon Draft
 * Allow players to claim imported characters through a simple chat button
 * Turn your token invisible to other players (*Useful for invisibility etc.*)
 * Allow players to resize tokens
 * Change vision range for tokens

## **Getting Started**
Once you have added this Script to a campaign, simply create a new page. This will generate an example arena, complete with dynamic lighting, interactive doors and spawn points. 

That is all that is needed from a GM. From here the GM can "Join as Player" and be on even-footing as any other player.

### Characters
Either use the "!br contestant" command in chat to create a new sheet, or simply import a character to the game. If you import a character, a button will appear in chat for all players, allowing you to claim the character as your own, giving you access to the sheet.  

### Getting on the map
Once your sheet is in order, simply drag your character out onto the map. By default tokens are given 0 ft of vision. This is to allow for quick creation of summons or allies, that shouldn't necessarily give the controlling player direct vision. 

### Granting vision
Assuming your character is not meant to be blind, select your token and click "Grant Vision" in the top left. Alternatively, if you want to fight at night, or with limited vision, select "Change Vision Range" and specify a range of vision.

### Let the battle begin!
If you want to fight in teams, make sure all team-members have the same status marker on their token. This way the script will know to spawn you at the same spawn point. Once everyone is on the field, someone needs to type "!br spawn" in chat. Everyone will be whisked away to random spawn points and the battle begins!

### The Map
To change map, one of the players simply have to type "!br map" followed by the map name. In the case of our auto-generated example map, you'd need to type "!br map example".

### Doors
Across the map you'll encounter walls with small semi-circles poking out with "Door" written on it. These are interactive doors. Selecting your token, you'll see a "Open/Close Door" button in the top left. Click this, and then on the door, and it will open or close. 

### Invisibility
Occasionally, you'll need to be invisible. Either due to a spell or some temporary cover. To do this, select your token and click "Toggle Invisibility" in the top left or type "!br invis" in chat. This will hide your token and any statusmarkers, while leaving a small red circle for your eyes only. 

### Sound Ping
While being noisy while invisible or behind a wall, other players might want to justifiably know your general location. You can do this with a "Sound Ping". Select your token and click "Sound Ping" in the top left or type "!br soundping" in chat. This will ping everyone to a location within 200 px of your token (approx. 3 tiles).

### Spectating
Maybe you died. Maybe you just arrived late and you're sitting this round out. Whatever the reason, you might want to spectate the fight. Simply click the button that appeared in your chat when you logged in, or type "!br spectate". A small spectator token will appear in the top left corner of the map. By default this token is also visible to contestants, but this can be turned off in the code.

## **Creating New Maps**
Creating a new area is super easy. 
Simply make a new map like you would any Roll20 game. The page name should start with [BR], eg. '[BR]Arena' to allow the "!br map" command to show it. This is to ensure players don't accidentally see 'BBEG's Ambush site for next session' in the list of Battle Royale maps.

Drag in the "Spawn Point" character token from your journal to any places you want spawn points. 
Drag in the "Door" character token to any doors on your map. If you want the doors to be closed, select the token and click "Open/Close Door". 
Voila! You have a new arena!
