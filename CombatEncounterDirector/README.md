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

Type `!director` in chat for the quick-action menu, or open the **Combat Encounter Director - Command Deck** journal for the full control panel.

## Primary Command

```
!director
```

No aliases are provided to avoid collisions with other scripts.

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
!director scale preset standard
!director scale party 6
```

Set individual values:

```
!director scale hp 150
!director scale ac +2
!director scale damage 125
!director scale apply
```

### Boss Tools

Apply a boss-type preset to selected tokens:

```
!director boss minion
!director boss elite
!director boss boss
!director boss legendary
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
!director reinforce duplicate 3
!director reinforce enumerate
```

Duplicate copies are placed 1 grid square to the right of the original.

### Layer & Visibility

```
!director layer token
!director layer gm
!director layer map
!director hide
!director reveal
```

### Position Management

Save and restore token positions:

```
!director position save
!director position restore
```

### Encounter Templates

Save the full state of all tokens on the current page and restore them later:

```
!director encounter save goblin-ambush
!director encounter load goblin-ambush
!director encounter delete goblin-ambush
!director encounter list
```

### Reset & Recovery

Every modified token retains its original values. Reset at any time:

```
!director reset selected
!director reset page
!director reset all
```

### Reporting

Generate a status report in the **Combat Encounter Director - Status** journal:

```
!director report refresh
!director report selected
!director report changed
!director report clear
```

### Configuration

```
!director config
!director config hp-bar bar1
!director config ac-bar bar2
!director config ac-bar none
```

### Journal Management

Rebuild the control panel and status journals:

```
!director journal rebuild
```

---

## Configuration

| Setting | Default | Options                | Description               |
| ------- | ------- | ---------------------- | ------------------------- |
| HP Bar  | bar1    | bar1, bar2, bar3       | Which token bar tracks HP |
| AC Bar  | bar2    | bar1, bar2, bar3, none | Which token bar tracks AC |

Configure via Roll20 One-Click settings or with `!director config`.

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

