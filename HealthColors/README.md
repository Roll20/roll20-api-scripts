# HealthColors

**HealthColors** is a Roll20 API script that provides automated visual feedback for token health. It dynamically updates a token's **Aura 1** or **Tint** color based on its current hit point percentage, allowing GMs and players to see a token's status at a glance without checking character sheets.

---

## Features

- **Palette-Based Color Shifting**: Automatically transitions across a 3-stop health gradient with a dedicated dead color at 0 HP.
- **Built-In Palettes**: Choose between `default` and `colorblind` palettes for clearer table visibility.
- **Aura & Tint Modes**: Choose between a glowing health ring (Aura 1) or a full token color overlay (Tint).
- **Aura 1 Exclusive Management**: The script only manages Aura 1. You are free to manually use Aura 2 for range indicators, light sources, or status markers without script interference.
- **Aura 1 & Aura 2 Details in Output**: Settings output includes Aura 1 Shape/Tint and Aura 2 Radius/Shape/Tint rows using state-backed defaults for clear reference.
- **Manual Overrides**: Visual updates are only triggered when health values change. You can manually adjust colors or radii in the token settings, and they will "stick" until the next time the token takes damage or heals.
- **Blood & Heal FX**: Spawns custom particle effects when tokens are hurt or healed.
- **Automated Dead Status**: Automatically applies a configurable status marker (default: Red X) when a token reaching 0 HP.
- **NPC vs PC Config**: Separate settings for players and NPCs, including nameplate visibility and health tracking toggles.

---

## Manual Installation

1. Copy the code from `HealthColors.js`.
2. In your Roll20 Game Settings, go to **API Scripts**.
3. Create a **New Script**, name it `HealthColors.js`, and paste the code.
4. Click **Save Script**.

---

## Usage & Commands

### The Configuration Menu

Type `!aura` in the chat to open the interactive configuration menu. From here, you can toggle all features and adjust percentages.
When a command changes a setting, HealthColors posts a single read-only settings snapshot to game chat (instead of duplicating menu output).

### Command Reference

| Command                     | Description                                                                        |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `!aura`                     | Opens the main configuration menu.                                                 |
| `!aura settings`            | Outputs the current HealthColors settings snapshot to game chat.                   |
| `!aura forceall`            | Forces a visual sync for every token on the current map.                           |
| `!aura on/off`              | Enables or disables the script globally.                                           |
| `!aura tint`                | Toggles between **Aura 1** mode and **Tint** mode.                                 |
| `!aura palette <name>`      | Sets the health palette (`default` or `colorblind`) and auto-refreshes all tokens. |
| `!aura size <n>`            | Sets Aura 1 radius in feet from token edge (e.g., `!aura size 0.35`).              |
| `!aura a1shape <shape>`     | Sets Aura 1 display shape (`Circle`, `Square`).                                    |
| `!aura a1tint <hex>`        | Sets Aura 1 display tint color (e.g., `!aura a1tint 00FF00`).                      |
| `!aura a2size <n>`          | Sets Aura 2 display radius (e.g., `!aura a2size 5`).                               |
| `!aura a2shape <shape>`     | Sets Aura 2 display shape (`Square`, `Circle`).                                    |
| `!aura a2tint <hex>`        | Sets Aura 2 display tint color (e.g., `!aura a2tint 806600`).                      |
| `!aura bar <1/2/3>`         | Sets which token bar represents health and immediately forces a full token sync.   |
| `!aura pc / !aura npc`      | Toggles health tracking for PCs or NPCs.                                           |
| `!aura perc <PC> <NPC>`     | Sets the health percentage at which the aura appears (e.g., `!aura perc 100 100`). |
| `!aura dead / !aura deadPC` | Toggles the automatic "Dead" status marker.                                        |
| `!aura fx`                  | Toggles particle effects for damage and healing.                                   |
| `!aura heal <hex>`          | Sets the color of healing particle effects (e.g., `!aura heal FDDC5C`).            |
| `!aura hurt <hex>`          | Sets the color of damage particle effects (e.g., `!aura hurt FF0000`).             |
| `!aura reset`               | Resets the script's state to factory defaults.                                     |
| `!aura reset-fx`            | Rebuilds `-DefaultHeal` and `-DefaultHurt` custom FX objects.                      |
| `!aura reset-all`           | Restores all settings to `DEFAULTS`, rebuilds default FX, and force-syncs tokens.  |

### Health Palettes

- `default`: High = Green, Mid = Yellow, Low = Red, Dead = Black.
- `colorblind`: High = Cyan, Mid = Orange, Low = Magenta, Dead = Black.
- At exactly 0 HP, the script uses the palette dead color (`#000000`) for clear knockout state.
- If HP is above 100%, the script still uses blue (`#0000FF`) for overflow/temporary HP visualization.

---

## Tips & Troubleshooting

- **Aura Visibility**: Aura 1 radius is measured in feet from the token edge. The default is `0.35`, which can appear subtle on some maps. Increase it (e.g., `3.0`) if you want a more obvious health ring.
- **Manual Changes**: If you manually change a token's aura color or radius in the Roll20 dialog, it will stay that way as long as the token's health doesn't change. Once health is updated, the script will re-sync the visuals to the calculated health color.
- **Palette Changes**: Switching palettes from the menu or with `!aura palette ...` immediately runs a full refresh of tokens (equivalent to a force update).
- **One-Off Tokens**: You can toggle "One-Offs" in the settings to enable health tracking for tokens that are not linked to a character sheet.
- **FX Rendering Variance**: Some Roll20 sandbox/client combinations can render `spawnFxWithDefinition` colors inaccurately. HealthColors uses a fallback that updates default custom FX objects and spawns by FX ID to keep heal/hurt colors consistent.
- **Missing Max HP**: If the configured health bar has no `max` value on a token, HealthColors now clears that token's aura/tint until a max value is set.

---

## Credits

Original Author: DXWarlock
Refactored and Modernized for v2 by MidNiteShadow7
