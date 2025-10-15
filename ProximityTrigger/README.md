# ProximityTrigger

A powerful proximity-based automation system for Roll20 that automatically triggers events when player tokens approach designated areas, NPCs, traps, or other game elements.

## Overview

ProximityTrigger helps Game Masters create dynamic, interactive encounters and environments by automatically displaying messages when tokens move within range of trigger points. Perfect for NPCs, traps, environmental storytelling, passive checks, and more.

## Key Features

- ✅ **Automatic Proximity Detection** - Triggers activate when tokens move within customizable range
- ✅ **Flexible Configuration** - Set distances, timeouts, messages, and visual styles
- ✅ **Dynamic Content Parsing** - Advanced message system with placeholders, dice rolls, character attributes, and interactive buttons
- ✅ **Character Sheet Integration** - Access and display character attributes dynamically in messages
- ✅ **Inline Dice Rolling** - Embed dice rolls in messages with automatic calculation and styled display
- ✅ **Interactive Buttons** - Create clickable buttons that execute chat commands, rolls, whispers, or API commands
- ✅ **Weighted Random Messages** - Add variety with probability-weighted message selection
- ✅ **Beautiful Styled Cards** - Customizable message appearance with colors and whisper modes
- ✅ **Multiple Trigger Modes** - Always on, one-time use, or disabled
- ✅ **Multi-Token Support** - One configuration applies to multiple tokens with the same name
- ✅ **Interactive UI** - Full chat-based configuration interface with easy-to-use menus
- ✅ **Persistent State** - All settings saved between game sessions (including button callbacks)
- ✅ **Per-Message Styling** - Override default card styles for individual messages
- ✅ **Automatic Token Management** - Tokens automatically tracked when added or removed from map
- ✅ **Manual Trigger Control** - Manually activate triggers on demand for testing or special events

## Installation

1. In your Roll20 game, go to the API Scripts page
2. Click "New Script" and name it "ProximityTrigger"
3. Copy the contents of `ProximityTrigger.js` into the script editor
4. Save the script
5. The API sandbox will restart and ProximityTrigger will be ready to use

## Quick Start

1. **Place a token** on your map (NPC, trap marker, etc.)
2. **Select the token** and type `!pt -M` in chat
3. **Configure the trigger**:
   - Set trigger distance (in token widths)
   - Add messages
   - Customize appearance
4. **Done!** When player tokens move within range, the trigger activates

## Commands Reference

### Main Commands

| Command | Shorthand | Description |
|---------|-----------|-------------|
| `!pt --help` | `!pt -h` | Display help information |
| `!pt --menu` | `!pt -m` | Open interactive menu |
| `!pt --monitor [Token/Name]` | `!pt -M [Token/Name]` | Add or edit a trigger |
| `!pt --list` | `!pt -l` | List all monitored triggers |
| `!pt --delete [Name]` | `!pt -D [Name]` | Delete a trigger |
| `!pt --trigger [Token/Name]` | `!pt -t [Token/Name]` | Manually activate a trigger |

### Configuration Commands

| Command | Description |
|---------|-------------|
| `!pt --edit [Name] [property] [value]` | Edit trigger properties |
| `!pt --cardstyles` | List all card styles |
| `!pt --cardstyle [StyleName] [property] [value]` | Edit or create a card style |

### Editable Properties

**Trigger Properties:**
- `triggerDistance` - Distance in token widths
- `timeout` - Cooldown in milliseconds (0 = one-time only)
- `img` - Image URL for the message card
- `cardStyle` - Name of the card style to use
- `mode` - Operating mode: `on`, `off`, or `once`

**Card Style Properties:**
- `borderColor` - Border color (hex or CSS color)
- `backgroundColor` - Background color
- `bubbleColor` - Speech bubble color
- `textColor` - Text color
- `whisper` - Whisper mode: `off`, `character`, or `gm`
- `badge` - Optional image URL for style badge/icon

## Usage Examples

### Example 1: Interactive NPC

Create a friendly merchant who greets players:

1. Select the merchant token
2. Type: `!pt -M`
3. Click "Trigger Distance" → Set to 2
4. Click "Messages" → "Add New Message"
5. Add: "Well met, {playerName}! Care to see my wares?"
6. Add more messages for variety:
   - "Greetings, {playerName}! I have the finest goods!"
   - "Welcome, {playerName}! What can I help you find?"

### Example 2: Hidden Trap Warning

Create a one-time trap perception check:

1. Place a marker token where the trap is
2. Type: `!pt -M Trap_Zone`
3. Set mode to "once"
4. Set whisper to "gm"
5. Add message: "{playerName} notices something suspicious about the floor ahead..."

### Example 3: Environmental Description

Create atmospheric descriptions for a spooky corridor:

1. Place marker tokens at key locations
2. Monitor each: `!pt -M Corridor_1`
3. Add multiple messages with different weights:
   - "The air grows cold as you approach..." (weight: 3)
   - "You hear a distant whisper..." (weight: 2)
   - "Shadows seem to move at the edge of your vision..." (weight: 2)
   - "A chill runs down your spine..." (weight: 1)

### Example 4: Quest Marker

Create a discovery notification:

1. Place a marker at the quest location
2. Type: `!pt -M Quest_Marker`
3. Set mode to "once"
4. Add message: "You've discovered the Ancient Ruins!"
5. Set card style to something distinctive

### Example 5: Interactive Combat Encounter

Create an NPC with dynamic combat options:

1. Select the NPC token
2. Type: `!pt -M`
3. Add message with buttons and dice rolls:
   - "The bandit notices you! [Attack]([[1d20+5]] to hit!) [Intimidate]([[1d20]] intimidation check!) [Talk](I mean no harm!)"
4. Set appropriate trigger distance

### Example 6: Trap with Damage Roll

Create a trap that rolls damage dynamically:

1. Place trap marker
2. Type: `!pt -M Spike_Trap`
3. Set mode to "once"
4. Add message: "{playerName} triggered the trap! You take {2d6} piercing damage!"
5. Set whisper to "character" so only they see the damage

### Example 7: Health Check Point

Create a healing station that shows current HP:

1. Place marker at healing location
2. Type: `!pt -M Healing_Shrine`
3. Add message: "You rest at the shrine. Current HP: {playerName.hp}/{playerName.hp_max}"
4. Add another message: "Your wounds begin to heal... [Rest 1 Hour]([[1d8+2]] HP restored) [Continue](Moving on...)"

## Message Features

### Dynamic Content Parsing

ProximityTrigger includes a powerful chat parsing system that processes dynamic content in messages:

#### Placeholders

- **`{playerName}`** - Triggering player's first name
  - Example: "Welcome, {playerName}!" becomes "Welcome, Aragorn!"
- **`{monitoredName}`** - The trigger/NPC's name
  - Example: "{monitoredName} greets you" becomes "Guard greets you"

#### Character Attributes

Access character sheet attributes dynamically:

- **`{playerName.attribute}`** - Triggering player's character attribute
  - Example: "You have {playerName.hp} HP remaining"
- **`{monitoredName.attribute}`** - Monitored NPC's character attribute
  - Example: "{monitoredName} has {monitoredName.AC} AC"
- **`{CharacterName.attribute}`** - Any character's attribute by name
  - Example: "The king's influence is {King_Roland.influence}"

Attribute names are case-insensitive and support common variations (hp/HP, ac/AC, etc.)

#### Dice Rolls

Embed dice rolls directly in messages with automatic calculation:

- **`{1d6}`** - Simple roll
- **`{2d20+3}`** - Complex expressions with modifiers
- **`{1d20+5-2}`** - Math operations supported
- Rolls display as styled badges with tooltips showing individual die results

Example: "You take {2d6+3} damage!" might display "You take **14** damage!"

#### Interactive Buttons

Create clickable buttons that execute commands:

- **`[Button Text](command)`** - Creates an interactive button
- Buttons support any chat command:
  - **Inline rolls:** `[Attack]([[1d20+5]] attack roll)`
  - **Whispers:** `[Secret]( /w gm Secret information)`
  - **API commands:** `[Light](!pt -t)`
  - **Regular chat:** `[Shout](Huzzah!)`

Example message: "What do you do? [Fight](I attack with [[1d20+5]]!) [Flee](I run away!)"

### Message Weights

Control how often different messages appear:

- **Weight 1**: Normal probability (default)
- **Weight 2**: Twice as likely to appear
- **Weight 0**: Disabled, won't appear
- **Higher numbers**: Proportionally more likely

This creates natural variety in repeated encounters.

### Per-Message Styling

Override the default card style for specific messages. Useful for:
- Critical information (different color)
- Hostile vs. friendly NPCs
- Different types of environmental descriptions

## Card Styles

Create multiple card styles for different types of triggers:

- **Friendly NPC**: Warm colors, public messages
- **Hostile Encounter**: Red/dark colors, GM whisper
- **Environment**: Neutral colors, public
- **Trap**: Warning colors, GM whisper
- **Quest**: Distinctive colors, public

**Customizable Properties:**
- Border, background, bubble, and text colors
- Whisper mode (off/character/gm)
- Optional badge/icon image

To create a new style:
1. Type: `!pt -C new`
2. Enter a name
3. Customize the colors, whisper mode, and optional badge
4. Use `!pt --cardstyle [StyleName] [property] [value]` to edit individual properties

## Trigger Modes

### Mode: On
- Trigger activates every time a token enters range
- Respects the timeout/cooldown setting
- Use for NPCs that should react repeatedly

### Mode: Once
- Trigger activates one time
- Automatically switches to "off" after triggering
- Use for discoveries, one-time events, traps

### Mode: Off
- Trigger is disabled
- No proximity detection occurs
- Use to temporarily disable without deleting

## Advanced Features

### Multi-Token Support

Multiple tokens with the same name automatically share one trigger configuration. Perfect for:
- Groups of similar enemies
- Multiple trap markers of the same type
- Repeated environmental triggers

### Automatic Token Management

- When you add a token to the map, it's automatically added to any matching trigger
- When you delete a token, it's automatically removed from triggers
- No manual management needed

### Distance Calculation

Trigger distance is measured from token center in "token body widths":
- Distance 1 = tokens must overlap
- Distance 2 = trigger within 2 token widths (default)
- Distance 5 = larger detection radius

Distance includes half the token's width, so triggers naturally activate when tokens get close.

### Timeout System

- **Timeout > 0**: Creates a cooldown period (in milliseconds)
  - Example: 10000 = 10 seconds between triggers
- **Timeout = 0**: Trigger fires once per token until manually reset
  - Token pair won't trigger again until game reload

## Tips & Best Practices

### For NPCs
- Use multiple messages with varied weights for natural conversation
- Set appropriate trigger distances (2-3 for friendly, 1-2 for cautious)
- Use character whisper mode for personal interactions

### For Traps
- Use "once" mode to trigger only on first discovery
- Use GM whisper for passive perception checks
- Set tight trigger distance (1-2) for precise placement

### For Environment
- Use public messages for atmospheric descriptions
- Create multiple messages with weights for variety
- Place markers strategically throughout the area

### For Performance
- Don't over-monitor: only set up triggers where needed
- Use appropriate timeout values to prevent spam
- Clean up unused triggers with `!pt -D`

## Troubleshooting

**Trigger not activating?**
- Check that the trigger mode is "on" or "once"
- Verify the trigger distance is large enough
- Ensure the token has messages configured
- Confirm tokens are on the same page

**Messages appearing too often?**
- Increase the timeout value
- Check that multiple tokens aren't causing repeated triggers

**Can't find a trigger?**
- Use `!pt -l` to list all triggers
- Remember to use underscores for spaces in names
- Check spelling of token/character name

**Token not being monitored?**
- Token must have a name (either token name or character name)
- Try deleting and re-adding the token
- Use `!pt -M TokenName` to manually add

## Technical Notes

- State is stored in `state.ProximityTrigger`
- Triggers persist between game sessions
- Distance calculations use Euclidean distance
- The API monitors all graphic token movements
- Default card style is protected and cannot be deleted

## Support & Contribution

For issues, questions, or contributions:
- Roll20 Forums: Post in the API Scripts section
- Describe your use case and any error messages
- Include your Roll20 API console output if relevant

## Version History

### Version 2.1.0 (Current - First Published Version)

**Development Story:**
This is the first publicly released version of ProximityTrigger. The script evolved from ProximityNPC, which I initially created to trigger message cards when player tokens approached a preset list of NPCs. As development progressed, I enhanced it with commands to create and manage triggers dynamically in state rather than hardcoding them. The script was then refactored and cleaned up to remove personal presets and made ready for community use as ProximityTrigger. All functionality from the original has been preserved and expanded.

**Original Development:** The complete development history, including the original ProximityNPC version and TypeScript refactor, can be found at [GitHub](https://github.com/bbarrington0099/Roll20API/tree/main)

**Features:**
- Comprehensive feature set with full interactive UI
- Multi-token support per trigger (one configuration applies to all tokens with same name)
- Message management system with weights and per-message styling
- Card style system with full customization (colors, whisper modes, badges)
- Three trigger modes: always on, one-time use, or disabled
- Automatic token tracking (tokens added/removed automatically)
- Persistent state management (all settings saved between sessions)
- Interactive chat-based configuration interface
- **Advanced Dynamic Content Parsing:**
  - Placeholder support: `{playerName}`, `{monitoredName}`
  - Character attribute integration: `{playerName.hp}`, `{CharacterName.attribute}`
  - Inline dice rolling: `{1d20+5}`, `{2d6+3}` with styled results
  - Interactive buttons: `[Button Text](command)` supporting rolls, whispers, API commands
  - Persistent button callback system
- Weighted random message selection
- Manual trigger activation capability
- Configurable trigger distances and timeouts

### Version 2.0.0
- Major refactor and feature additions
- Added card styling system
- Enhanced message system with weights
- Improved configuration interface

### Version 1.0.0
- Initial release as ProximityNPC
- Basic proximity detection
- Simple message display with preset NPCs

## License

MIT License - Free to use and modify

## Credits

Created by Brandon B. for the Roll20 community - https://github.com/bbarrington0099

---

**Enjoy dynamic, proximity-based storytelling in your Roll20 games!**
