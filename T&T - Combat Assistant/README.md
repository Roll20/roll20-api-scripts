# T&T - Combat Assistant

# IMPORTANT: THE API SANDBOX MUST BE SET TO EXPERIMENTAL

Combat Assistant requires Roll20's Experimental API sandbox because it uses the
Beacon sheet functions needed to read and update character sheet HP safely. If
the game is using the Default sandbox, the script will warn the GM and will not
finish loading.

## What This Script Does

Combat Assistant is a Roll20 API script for D&D combat automation. It listens to
Roll20 attack, damage, healing, saving throw, and initiative rolls, then gives
the GM compact chat buttons to apply the result to selected or targeted tokens.

It supports both Roll20 D&D 2024 and D&D 2014 sheet roll templates.

## Main Features

- Apply damage from captured Roll20 attack and damage cards.
- Apply manual damage with damage type, challenge, save ability, and half damage
  on success.
- Apply healing and temporary HP.
- Read HP from linked token bars and write linked HP through sheet attributes.
- Use unlinked token bars for NPC HP and temporary HP.
- Read 2024 sheet defenses and 2014 NPC resistance, immunity, and vulnerability
  attributes.
- Resolve group saving throw checks for selected tokens.
- Resolve saving throw damage with Roll20 rolls or Combat Assistant rolls for
  2014 NPCs when configured.
- Roll group initiative for selected tokens and write the turn order for both
  Roll20 D&D 2014 and D&D 2024 sheets.
- Whisper player-controlled tokens limited-use buttons for supported attacks,
  healing, and saving throws when those settings are enabled.
- Public combat logs with token icons, optional hidden token names, and optional
  damage source reveal.

## Installation

1. Install `combatassistant.js` as a Roll20 API Script / Mod.
2. In Roll20, go to **Mod Library**.
3. Set **API Sandbox Version** to **Experimental**.
4. Save or restart the API sandbox.
5. Run `!combatAssistant menu` to confirm the script is responding.

No handouts are required.

## Recommended GM Macro

```text
!combatAssistant menu
```

This opens the GM combat menu with quick buttons for damage, healing, saving
throws, and initiative.

## Useful Commands

- `!combatAssistant menu` opens the main menu.
- `!combatAssistant config` opens settings.
- `!combatAssistant help` shows command help.
- `!combatAssistant deal manual ?{Damage|0} ?{Type|fire} ?{Challenge|0} ?{Save|none} ?{Half on Success|no|yes}`
  applies manual damage to selected tokens.
- `!combatAssistant heal manual ?{Heal Type|HP,hp|Temp,temp} ?{Healing|0}`
  applies healing or temporary HP to selected tokens.
- `!combatAssistant save ?{Ability|Strength,strength|Dexterity,dexterity|Constitution,constitution|Intelligence,intelligence|Wisdom,wisdom|Charisma,charisma}`
  asks selected tokens for a saving throw.
- `!combatAssistant init` rolls initiative for selected tokens.

Aliases are also available:

```text
!combat-assistant
!ca
```

## Notes

Combat Assistant is focused on combat flow. For inventory, shops, token setup,
spell lists, and broader campaign tooling, use Trinkets & Trackers.

Created by [AmadeusVF](https://www.patreon.com/cw/AmadeusVF/home).
