# ChatSetAttr

ChatSetAttr is a Roll20 API script that allows users to create, modify, or delete character sheet attributes through chat commands macros. Whether you need to update a single character attribute or make bulk changes across multiple characters, ChatSetAttr provides flexible options to streamline your game management.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Available Commands](#available-commands)
3. [Target Selection](#target-selection)
4. [Attribute Syntax](#attribute-syntax)
5. [Modifier Options](#modifier-options)
6. [Output Control Options](#output-control-options)
7. [Inline Roll Integration](#inline-roll-integration)
8. [Repeating Section Support](#repeating-section-support)
9. [Special Value Expressions](#special-value-expressions)
10. [Global Configuration](#global-configuration)
11. [Complete Examples](#complete-examples)
12. [For Developers](#for-developers)

## Basic Usage

The script provides several command formats:

- `!setattr [--options]` - Create or modify attributes
- `!modattr [--options]` - Shortcut for `!setattr --mod` (adds to existing values)
- `!modbattr [--options]` - Shortcut for `!setattr --modb` (adds to values with bounds)
- `!resetattr [--options]` - Shortcut for `!setattr --reset` (resets to max values)
- `!delattr [--options]` - Delete attributes

Each command requires a target selection option and one or more attributes to modify.

**Basic structure:**
```
!setattr --[target selection] --attribute1|value1 --attribute2|value2|max2
```

## Available Commands

### !setattr

Creates or updates attributes on the selected target(s). If the attribute doesn't exist, it will be created (unless `--nocreate` is specified).

**Example:**
```
!setattr --sel --hp|25|50 --xp|0|800
```

This would set `hp` to 25, `hp_max` to 50, `xp` to 0 and `xp_max` to 800.

### !modattr

Adds to existing attribute values (works only with numeric values). Shorthand for `!setattr --mod`.

**Example:**
```
!modattr --sel --hp|-5 --xp|100
```

This subtracts 5 from `hp` and adds 100 to `xp`.

### !modbattr

Adds to existing attribute values but keeps the result between 0 and the maximum value. Shorthand for `!setattr --modb`.

**Example:**
```
!modbattr --sel --hp|-25 --xp|2500
```

This subtracts 5 from `hp` but won't reduce it below 0 and increase `xp` by 25, but won't increase it above `mp_xp`.

### !resetattr

Resets attributes to their maximum value. Shorthand for `!setattr --reset`.

**Example:**
```
!resetattr --sel --hp --xp
```

This resets `hp`, and `xp` to their respective maximum values.

### !delattr

Deletes the specified attributes.

**Example:**
```
!delattr --sel --hp --xp
```

This removes the `hp` and `xp` attributes.

## Target Selection

One of these options must be specified to determine which characters will be affected:

### --all

Affects all characters in the campaign. **GM only** and should be used with caution, especially in large campaigns.

**Example:**
```
!setattr --all --hp|15
```

### --allgm

Affects all characters without player controllers (typically NPCs). **GM only**.

**Example:**
```
!setattr --allgm --xp|150
```

### --allplayers

Affects all characters with player controllers (typically PCs).

**Example:**
```
!setattr --allplayers --hp|15
```

### --charid

Affects characters with the specified character IDs. Non-GM players can only affect characters they control.

**Example:**
```
!setattr --charid <ID1> <ID2> --xp|150
```

### --name

Affects characters with the specified names. Non-GM players can only affect characters they control.

**Example:**
```
!setattr --name Gandalf, Frodo Baggins --party|"Fellowship of the Ring"
```

### --sel

Affects characters represented by currently selected tokens.

**Example:**
```
!setattr --sel --hp|25 --xp|30
```

### --sel-party

Affects only party characters represented by currently selected tokens (characters with `inParty` set to true).

**Example:**
```
!setattr --sel-party --inspiration|1
```

### --sel-noparty

Affects only non-party characters represented by currently selected tokens (characters with `inParty` set to false or not set).

**Example:**
```
!setattr --sel-noparty --npc_status|"Hostile"
```

### --party

Affects all characters marked as party members (characters with `inParty` set to true). **GM only by default**, but can be enabled for players with configuration.

**Example:**
```
!setattr --party --rest_complete|1
```

## Attribute Syntax

The syntax for specifying attributes is:
```
--attributeName|currentValue|maxValue
```

* `attributeName` is the name of the attribute to modify
* `currentValue` is the value to set (optional for some commands)
* `maxValue` is the maximum value to set (optional)

### Examples:

1. Set current value only:
   ```
   --strength|15
   ```

2. Set both current and maximum values:
   ```
   --hp|27|35
   ```

3. Set only the maximum value (leave current unchanged):
   ```
   --hp||50
   ```

4. Create empty attribute or set to empty:
   ```
   --notes|
   ```

5. Use `#` instead of `|` (useful in roll queries):
   ```
   --strength#15
   ```

## Modifier Options

These options change how attributes are processed:

### --mod

See `!modattr` command.

### --modb

See `!modbattr` command.

### --reset

See `!resetattr` command.

### --nocreate

Prevents creation of new attributes, only updates existing ones.

**Example:**
```
!setattr --sel --nocreate --perception|20 --xp|15
```

This will only update `perception` or `xp` if it already exists.

### --evaluate

Evaluates JavaScript expressions in attribute values. **GM only by default**.

**Example:**
```
!setattr --sel --evaluate --hp|2 * 3
```

This will set the `hp` attribute to 6.

### --replace

Replaces special characters to prevent Roll20 from evaluating them:
- < becomes [
- > becomes ]
- ~ becomes -
- ; becomes ?
- \` becomes @

Also supports \lbrak, \rbrak, \n, \at, and \ques for [, ], newline, @, and ?.

**Example:**
```
!setattr --sel --replace --notes|"Roll <<1d6>> to succeed"
```

This stores "Roll [[1d6]] to succeed" without evaluating the roll.

## Output Control Options

These options control the feedback messages generated by the script:

### --silent

Suppresses normal output messages (error messages will still appear).

**Example:**
```
!setattr --sel --silent --stealth|20
```

### --mute

Suppresses all output messages, including errors.

**Example:**
```
!setattr --sel --mute --nocreate --new_value|42
```

### --fb-public

Sends output publicly to the chat instead of whispering to the command sender.

**Example:**
```
!setattr --sel --fb-public --hp|25|25 --status|"Healed"
```

### --fb-from \<NAME>

Changes the name of the sender for output messages (default is "ChatSetAttr").

**Example:**
```
!setattr --sel --fb-from "Healing Potion" --hp|25
```

### --fb-header \<STRING>

Customizes the header of the output message.

**Example:**
```
!setattr --sel --evaluate --fb-header "Combat Effects Applied" --status|"Poisoned" --hp|%hp%-5
```

### --fb-content \<STRING>

Customizes the content of the output message.

**Example:**
```
!setattr --sel --fb-content "Increasing Hitpoints" --hp|10
```

### Special Placeholders

For use in `--fb-header` and `--fb-content`:

* `_NAMEJ_` - Name of the Jth attribute being changed
* `_TCURJ_` - Target current value of the Jth attribute
* `_TMAXJ_` - Target maximum value of the Jth attribute

For use in `--fb-content` only:

* `_CHARNAME_` - Name of the character
* `_CURJ_` - Final current value of the Jth attribute
* `_MAXJ_` - Final maximum value of the Jth attribute

**Important:** The Jth index starts with 0 at the first item.

**Example:**
```
!setattr --sel --fb-header "Healing Effects" --fb-content "_CHARNAME_ healed by _CUR0_ hitpoints --hp|10
```

## Inline Roll Integration

ChatSetAttr can be used within roll templates or combined with inline rolls:

### Within Roll Templates

Place the command between roll template properties and end it with `!!!`:

```
&{template:default} {{name=Fireball Damage}} !setattr --name @{target|character_name} --silent --hp|-{{damage=[[8d6]]}}!!! {{effect=Fire damage}}
```

### Using Inline Rolls in Values

Inline rolls can be used for attribute values:

```
!setattr --sel --hp|[[2d6+5]]
```

### Roll Queries

Roll queries can determine attribute values:

```
!setattr --sel --hp|?{Set strength to what value?|100}
```

## Repeating Section Support

ChatSetAttr supports working with repeating sections:

### Creating New Repeating Items

Use `-CREATE` to create a new row in a repeating section:

```
!setattr --sel --repeating_inventory_-CREATE_itemname|"Magic Sword" --repeating_inventory_-CREATE_itemweight|2
```

### Modifying Existing Repeating Items

Access by row ID:

```
!setattr --sel --repeating_inventory_-ID_itemname|"Enchanted Magic Sword"
```

Access by index (starts at 0):

```
!setattr --sel --repeating_inventory_$0_itemname|"First Item"
```

### Deleting Repeating Rows

Delete by row ID:

```
!delattr --sel --repeating_inventory_-ID
```

Delete by index:

```
!delattr --sel --repeating_inventory_$0
```

## Special Value Expressions

### Attribute References

Reference other attribute values using `%attribute_name%`:

```
!setattr --sel --evaluate --temp_hp|%hp% / 2
```

### Resetting to Maximum

Reset an attribute to its maximum value:

```
!setattr --sel --hp|%hp_max%
```

## Global Configuration

The script has four global configuration options that can be toggled with `!setattr-config`:

### --players-can-modify

Allows players to modify attributes on characters they don't control.

```
!setattr-config --players-can-modify
```

### --players-can-evaluate

Allows players to use the `--evaluate` option.

```
!setattr-config --players-can-evaluate
```

### --players-can-target-party

Allows players to use the `--party` target option. **GM only by default**.

```
!setattr-config --players-can-target-party
```

### --use-workers

Toggles whether the script triggers sheet workers when setting attributes.

```
!setattr-config --use-workers
```

## Complete Examples

### Basic Combat Example

Reduce a character's HP and status after taking damage:

```
!modattr --sel --evaluate --hp|-15 --fb-header "Combat Result" --fb-content "_CHARNAME_ took 15 damage and has _CUR0_ HP remaining!"
```

### Leveling Up a Character

Update multiple stats when a character gains a level:

```
!setattr --sel --level|8 --hp|75|75 --attack_bonus|7 --fb-from "Level Up" --fb-header "Character Advanced" --fb-public
```

### Create New Item in Inventory

Add a new item to a character's inventory:

```
!setattr --sel --repeating_inventory_-CREATE_itemname|"Healing Potion" --repeating_inventory_-CREATE_itemcount|3 --repeating_inventory_-CREATE_itemweight|0.5 --repeating_inventory_-CREATE_itemcontent|"Restores 2d8+2 hit points when consumed"
```

### Apply Status Effects During Combat

Apply a debuff to selected enemies in the middle of combat:

```
&{template:default} {{name=Web Spell}} {{effect=Slows movement}} !setattr --name @{target|character_name} --silent --speed|-15 --status|"Restrained"!!! {{duration=1d4 rounds}}
```

### Party Management Examples

Give inspiration to all party members after a great roleplay moment:

```
!setattr --party --inspiration|1 --fb-public --fb-header "Inspiration Awarded" --fb-content "All party members receive inspiration for excellent roleplay!"
```

Apply a long rest to only party characters among selected tokens:

```
!setattr --sel-party --hp|%hp_max% --spell_slots_reset|1 --fb-header "Long Rest Complete"
```

Set hostile status for non-party characters among selected tokens:

```
!setattr --sel-noparty --attitude|"Hostile" --fb-from "DM" --fb-content "Enemies are now hostile!"
```

## For Developers

### Registering Observers

If you're developing your own scripts, you can register observer functions to react to attribute changes made by ChatSetAttr:

```javascript
ChatSetAttr.registerObserver(event, observer);
```

Where `event` is one of:
- `"add"` - Called when attributes are created
- `"change"` - Called when attributes are modified
- `"destroy"` - Called when attributes are deleted

And `observer` is an event handler function similar to Roll20's built-in event handlers.

This allows your scripts to react to changes made by ChatSetAttr the same way they would react to changes made directly by Roll20's interface.