# ProximityTrigger

A powerful proximity-based automation system for Roll20 that automatically triggers events when player tokens approach designated areas, NPCs, traps, or other game elements.

## Overview

ProximityTrigger helps Game Masters create dynamic, interactive encounters and environments by automatically displaying messages when tokens move within range of trigger points. Perfect for NPCs, traps, environmental storytelling, passive checks, and more.

## Key Features

- ✅ **Automatic Proximity Detection** - Triggers activate when tokens move within customizable range
- ✅ **Flexible Configuration** - Set distances, timeouts, messages, and visual styles
- ✅ **Weighted Random Messages** - Add variety with probability-weighted message selection
- ✅ **Beautiful Styled Cards** - Customizable message appearance with colors and whisper modes
- ✅ **Multiple Trigger Modes** - Always on, one-time use, or disabled
- ✅ **Multi-Token Support** - One configuration applies to multiple tokens with the same name
- ✅ **Interactive UI** - Full chat-based configuration interface
- ✅ **Persistent State** - All settings saved between game sessions

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

## Message Features

### Placeholders

Use `{playerName}` in your messages to automatically insert the name of the player who triggered the event.

Example: "Welcome, {playerName}!" becomes "Welcome, Aragorn!"

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

To create a new style:
1. Type: `!pt -C new`
2. Enter a name
3. Customize the colors and whisper mode

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

### Version 2.1.0 (Current)
- Comprehensive feature set with full UI
- Multi-token support per trigger
- Message management with weights
- Card style system with customization
- Three trigger modes (on/off/once)
- Automatic token tracking
- Persistent state management

### Version 2.0.0
- Major refactor and improvements
- Added card styling system
- Enhanced message system

### Version 1.0.0
- Initial release
- Basic proximity detection
- Simple message display

## License

MIT License - Free to use and modify

## Credits

Created by bbarr for the Roll20 community

---

**Enjoy dynamic, proximity-based storytelling in your Roll20 games!**
