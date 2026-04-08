# HealthColors

**HealthColors** is a Roll20 API script that provides automated visual feedback for token health. It dynamically updates a token's **Aura 1** or **Tint** color based on its current hit point percentage, allowing GMs and players to see a token's status at a glance without checking character sheets.

---

## Features

- **Dynamic Color Shifting**: Automatically transitions from Green (Healthy) to Red (Critical) as health drops.
- **Aura & Tint Modes**: Choose between a glowing health ring (Aura 1) or a full token color overlay (Tint).
- **Aura 1 Exclusive Management**: The script only manages Aura 1. You are free to manually use Aura 2 for range indicators, light sources, or status markers without script interference.
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

### Command Reference

| Command                     | Description                                                                        |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `!aura`                     | Opens the main configuration menu.                                                 |
| `!aura forceall`            | Forces a visual sync for every token on the current map.                           |
| `!aura on/off`              | Enables or disables the script globally.                                           |
| `!aura tint`                | Toggles between **Aura 1** mode and **Tint** mode.                                 |
| `!aura size <n>`            | Sets the default radius for Aura 1 (e.g., `!aura size 0.7`).                       |
| `!aura bar <1/2/3>`         | Sets which token bar represents health.                                            |
| `!aura pc / !aura npc`      | Toggles health tracking for PCs or NPCs.                                           |
| `!aura perc <PC> <NPC>`     | Sets the health percentage at which the aura appears (e.g., `!aura perc 100 100`). |
| `!aura dead / !aura deadPC` | Toggles the automatic "Dead" status marker.                                        |
| `!aura fx`                  | Toggles particle effects for damage and healing.                                   |
| `!aura heal <hex>`          | Sets the color of healing particle effects (e.g., `!aura heal 00FF00`).            |
| `!aura hurt <hex>`          | Sets the color of damage particle effects (e.g., `!aura hurt FF0000`).             |
| `!aura reset`               | Resets the script's state to factory defaults.                                     |

---

## Tips & Troubleshooting

- **Aura Visibility**: If you are using a 5ft grid and set the Aura 1 radius to `0.7`, it may be hidden by the token image. Increase the radius (e.g., `3.0`) if you want the health ring to be visible outside the token's edge.
- **Manual Changes**: If you manually change a token's aura color or radius in the Roll20 dialog, it will stay that way as long as the token's health doesn't change. Once health is updated, the script will re-sync the visuals to the calculated health color.
- **One-Off Tokens**: You can toggle "One-Offs" in the settings to enable health tracking for tokens that are not linked to a character sheet.

---

## Credits

Original Author: DXWarlock
Refactored and Modernized for v2.0.0 by MidNiteShadow7
