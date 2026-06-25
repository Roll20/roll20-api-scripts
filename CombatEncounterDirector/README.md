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
```

### Journal Management

Rebuild the control panel and status journals:

```
!ced journal rebuild
```

---

## Configuration

| Setting | Default | Options                | Description               |
| ------- | ------- | ---------------------- | ------------------------- |
| HP Bar  | bar1    | bar1, bar2, bar3       | Which token bar tracks HP |
| AC Bar  | bar2    | bar1, bar2, bar3, none | Which token bar tracks AC |

Configure via Roll20 One-Click settings or with `!ced config`.

---

## How Scaling Works

HP scaling modifies both `bar_value` (current HP) and `bar_max` (max HP) proportionally, preserving the token's damage state. For example, if a token is at 50% HP before scaling, it remains at 50% after.

AC scaling applies a flat modifier to the AC bar value.

Damage scaling is tracked as metadata and shown in the status report. It does not modify character sheet attributes — it informs the GM how much to adjust damage.

---

## Credits

Creator: [MidNiteShadow7](https://app.roll20.net/users/16506286/midniteshadow7)

Maintainer: [MidNiteShadow7](https://app.roll20.net/users/16506286/midniteshadow7)

---

## License

This script is licensed under the MIT License.
