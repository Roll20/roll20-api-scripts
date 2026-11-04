# Combat Encounter Director

A Roll20 API Mod for rapid GM control over combat encounters.

## Overview

Combat Encounter Director gives Game Masters fast, journal-driven control over combat encounters — scaling enemy stats for party size, applying boss/minion presets, duplicating reinforcements, managing layers and visibility, saving encounter templates, and recovering all changes safely.

The mod is designed to support anything from solo adventures to large convention-style games (1–30 players).

## Installation

1. Upload `CombatEncounterDirector.js` to your Roll20 campaign's API Scripts.
2. Save the script. The mod installs two journal handouts automatically:
   - **Combat Encounter Director - Command Deck** — the primary GM control panel.
   - **Combat Encounter Director - Status** — the encounter status report.

## Quick Start

Type `!ced` in chat for the quick-action menu, or open the **Combat Encounter Director - Command Deck** journal for the full control panel.

## Primary Command

```
!ced
```

Legacy `!director` is accepted for backward compatibility when no conflicting Director mod is detected. If a conflict is detected, the GM is warned to use `!ced`.

---

## Features

### Party Scaling

Scale enemy HP, AC, and damage for different party sizes.

**Presets:**

| Preset           | Party Size | HP   | AC  | Damage |
| ---------------- | ---------- | ---- | --- | ------ |
| Solo             | 1          | 25%  | −2  | 75%    |
| Duo              | 2          | 50%  | −1  | 85%    |
| Small Party      | 3          | 75%  | 0   | 90%    |
| Standard Party   | 4          | 100% | 0   | 100%   |
| Large Party      | 6          | 140% | +1  | 120%   |
| Convention Table | 10         | 200% | +2  | 150%   |
| Massive Table    | 20         | 300% | +3  | 200%   |

Apply a preset to selected tokens:

```
!ced scale preset standard
!ced scale party 6
```

Set individual values:

```
!ced scale hp 150
!ced scale ac +2
!ced scale damage 125
!ced scale apply
```

### Boss Tools

Apply a boss-type preset to selected tokens:

```
!ced boss minion
!ced boss elite
!ced boss boss
!ced boss legendary
```

| Preset    | HP       | AC  | Damage |
| --------- | -------- | --- | ------ |
| Minion    | Set to 1 | −2  | 50%    |
| Elite     | 150%     | +1  | 125%   |
| Boss      | 300%     | +2  | 150%   |
| Legendary | 500%     | +3  | 200%   |

### Reinforcements

Duplicate selected tokens and auto-enumerate them:

```
!ced reinforce duplicate 3
!ced reinforce enumerate
```

Duplicate copies are placed 1 grid square to the right of the original.

### Layer & Visibility

```
!ced layer token
!ced layer gm
!ced layer map
!ced hide
!ced reveal
```

### Position Management

Save and restore token positions:

```
!ced position save
!ced position restore
```

### Encounter Templates

Save the full state of all tokens on the current page and restore them later:

```
!ced encounter save goblin-ambush
!ced encounter load goblin-ambush
!ced encounter delete goblin-ambush
!ced encounter list
```

### Reset & Recovery

Every modified token retains its original values. Reset at any time:

```
!ced reset selected
!ced reset page
!ced reset all
```

### Reporting

Generate a status report in the **Combat Encounter Director - Status** journal:

```
!ced report refresh
!ced report selected
!ced report changed
!ced report clear
```

### Configuration

```
!ced config
!ced config hp-bar bar1
!ced config ac-bar bar2
!ced config ac-bar none
!ced config language fr
```

### Journal Management

Rebuild the control panel and status journals:

```
!ced journal rebuild
```

---

## Configuration

| Setting  | Default | Options                | Description                           |
| -------- | ------- | ---------------------- | ------------------------------------- |
| HP Bar   | bar1    | bar1, bar2, bar3       | Which token bar tracks HP             |
| AC Bar   | bar2    | bar1, bar2, bar3, none | Which token bar tracks AC             |
| Language | en-US   | see below              | Language of chat replies and handouts |

Configure via Roll20 One-Click settings, the Config section of the Command Deck, or with `!ced config`.

### Languages

Combat Encounter Director speaks 24 languages: Afrikaans, Catalan, Chinese (Traditional), Czech, Danish, Dutch, English, Finnish, French, German, Greek, Hebrew, Hungarian, Italian, Japanese, Korean, Polish, Portuguese (Portugal), Portuguese (Brazil), Russian, Spanish, Swedish, Turkish and Ukrainian.

The Config section of the Command Deck lists them all in a table, with their flags, codes and native names. Its **Language** button opens a drop-down to choose one; or type `!ced config language <code>`, such as `!ced config language fr`. Chat replies, the Command Deck and the Status handout switch straight away.

---

## How Scaling Works

HP scaling modifies both `bar_value` (current HP) and `bar_max` (max HP) proportionally, preserving the token's damage state. For example, if a token is at 50% HP before scaling, it remains at 50% after.

AC scaling applies a flat modifier to the AC bar value.

Damage scaling is tracked as metadata and shown in the status report. It does not modify character sheet attributes — it informs the GM how much to adjust damage.

---

## Preset Reference

What every scaling preset changes. The examples are worked for a monster with **40 HP** and **AC 15** that deals **20 damage**. HP is rounded to the nearest whole number (never below 1), and a wounded monster keeps the same share of its HP: at 20/40 HP, Elite makes it 30/60. The damage figure is only a guide for your damage dice. The same tables are at the end of the Command Deck handout, on its All and Scaling tabs.

### Party Presets

`!ced scale preset <name>` applies one by name. `!ced scale party <size>` picks the preset for that many players, as in the Players column (a size halfway between two presets takes the smaller one).

| Preset           | Players | Changes                     | Example                                 |
| ---------------- | ------- | --------------------------- | --------------------------------------- |
| Solo             | 1       | HP 25%, AC −2, damage 75%   | 40 HP → 10, AC 15 → 13, 20 damage → 15  |
| Duo              | 2       | HP 50%, AC −1, damage 85%   | 40 HP → 20, AC 15 → 14, 20 damage → 17  |
| Small Party      | 3       | HP 75%, AC 0, damage 90%    | 40 HP → 30, AC 15 → 15, 20 damage → 18  |
| Standard Party   | 4–5     | HP 100%, AC 0, damage 100%  | No change                               |
| Large Party      | 6–8     | HP 140%, AC +1, damage 120% | 40 HP → 56, AC 15 → 16, 20 damage → 24  |
| Convention Table | 9–15    | HP 200%, AC +2, damage 150% | 40 HP → 80, AC 15 → 17, 20 damage → 30  |
| Massive Table    | 16–30   | HP 300%, AC +3, damage 200% | 40 HP → 120, AC 15 → 18, 20 damage → 40 |

### Boss Presets

`!ced boss <name>` applies one to the selected tokens.

| Preset    | Changes                        | Example                                 |
| --------- | ------------------------------ | --------------------------------------- |
| Minion    | HP set to 1, AC −2, damage 50% | 40 HP → 1, AC 15 → 13, 20 damage → 10   |
| Elite     | HP 150%, AC +1, damage 125%    | 40 HP → 60, AC 15 → 16, 20 damage → 25  |
| Boss      | HP 300%, AC +2, damage 150%    | 40 HP → 120, AC 15 → 17, 20 damage → 30 |
| Legendary | HP 500%, AC +3, damage 200%    | 40 HP → 200, AC 15 → 18, 20 damage → 40 |

Every preset works from the token's original values, so applying another one replaces the last instead of adding to it. `!ced reset selected` puts the original values back.

---

## Credits

Creator: [MidNiteShadow7](https://app.roll20.net/users/16506286/midniteshadow7)

Maintainer: [MidNiteShadow7](https://app.roll20.net/users/16506286/midniteshadow7)

---

## License

This script is licensed under the MIT License.
