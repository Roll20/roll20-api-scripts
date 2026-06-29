# HealthColors

**HealthColors** is a Roll20 API script that provides automated visual feedback for token health. It dynamically updates a token's **Aura 1** or **Tint** color based on its current hit point percentage, allowing GMs and players to see a token's status at a glance without checking character sheets.

---

## Features

- **Palette-Based Color Shifting**: Automatically transitions across a 3-stop health gradient with a dedicated dead color at 0 HP.
- **Built-In Palettes**: Choose between `default` and `colorblind` palettes for clearer table visibility.
- **Aura & Tint Modes**: Choose between a glowing health ring (Aura 1) or a full token color overlay (Tint).
- **Exclusive Mode Management**: The script manages either Aura 1 (aura mode) or the token tint (tint mode) — never both simultaneously. In tint mode, Aura 1 is left untouched alongside Aura 2, freeing both rings for manual use as range indicators, light sources, or status markers.
- **Aura 1 & Aura 2 Details in Output**: Settings output includes Aura 1 Shape/Tint and Aura 2 Radius/Shape/Tint rows using state-backed defaults for clear reference.
- **Manual Overrides**: In aura mode, Aura 1 is re-synced to the health color on each HP change but is otherwise left alone. In tint mode, Aura 1 is never touched by the script, so manual aura settings persist permanently alongside the health tint.
- **Blood & Heal FX**: Spawns custom particle effects when tokens are hurt or healed.
- **Automated Dead Status**: Automatically applies a configurable status marker (default: Red X) when a token reaching 0 HP.
- **NPC vs PC Config**: Separate settings for players and NPCs, including nameplate visibility and health tracking toggles.
- **Optional Death Save Integration**: An off-by-default feature that distinguishes **dying** (configurable marker), **stable** (green), and **dead** (Red X) player characters at 0 HP, with marker sync driven automatically from watched death-save attributes (works on both the D&D 2024 and 2014 sheets). See [Death Save Integration](#death-save-integration-optional).

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
When a command changes a setting, HealthColors re-whispers the interactive GM menu so you can continue adjusting without re-typing `!aura`. Use `!aura settings` to post a read-only public snapshot to game chat on demand.

### Command Reference

| Command                     | Description                                                                                                                   |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `!aura`                     | Opens the main configuration menu.                                                                                            |
| `!aura settings`            | Outputs the current HealthColors settings snapshot to game chat.                                                              |
| `!aura forceall`            | Forces a visual sync for every token on the current map.                                                                      |
| `!aura on/off`              | Enables or disables the script globally.                                                                                      |
| `!aura tint`                | Toggles between **Aura 1** mode and **Tint** mode.                                                                            |
| `!aura palette <name>`      | Sets the health palette (`default` or `colorblind`) and auto-refreshes all tokens.                                            |
| `!aura size <n>`            | Sets Aura 1 radius in feet from token edge (e.g., `!aura size 0.35`).                                                         |
| `!aura a1shape <shape>`     | Sets Aura 1 display shape (`Circle`, `Square`).                                                                               |
| `!aura a1tint <hex>`        | Sets Aura 1 display tint color (e.g., `!aura a1tint 00FF00`).                                                                 |
| `!aura a2size <n>`          | Sets Aura 2 display radius (e.g., `!aura a2size 5`).                                                                          |
| `!aura a2shape <shape>`     | Sets Aura 2 display shape (`Square`, `Circle`).                                                                               |
| `!aura a2tint <hex>`        | Sets Aura 2 display tint color (e.g., `!aura a2tint 806600`).                                                                 |
| `!aura bar <1/2/3>`                  | Sets which token bar represents health and immediately forces a full token sync.                                              |
| `!aura pc / !aura npc`               | Toggles health tracking for PCs or NPCs.                                                                                      |
| `!aura perc <PC> <NPC>`              | Sets aura/tint visibility threshold: `0` disables, `1-99` shows at or below that HP%, `100` always visible for living tokens. |
| `!aura dead / !aura deadPC`          | Toggles the automatic "Dead" status marker.                                                                                   |
| `!aura gmpc <Yes/No/Off>`            | Sets GM visibility of PC token nameplates (`Yes` = always show, `No` = always hide, `Off` = use Roll20 default).             |
| `!aura gmnpc <Yes/No/Off>`           | Sets GM visibility of NPC token nameplates (`Yes` = always show, `No` = always hide, `Off` = use Roll20 default).            |
| `!aura pcpc <Yes/No/Off>`            | Sets player visibility of PC token nameplates (`Yes` = always show, `No` = always hide, `Off` = use Roll20 default).         |
| `!aura pcnpc <Yes/No/Off>`           | Sets player visibility of NPC token nameplates (`Yes` = always show, `No` = always hide, `Off` = use Roll20 default).        |
| `!aura oneoff`                       | Toggles health tracking for tokens that are not linked to a character sheet.                                                  |
| `!aura update`                       | Forces a health-color update on all currently selected tokens.                                                                |
| `!aura fx`                           | Toggles particle effects for damage and healing.                                                                              |
| `!aura heal <hex>`                   | Sets the color of healing particle effects (e.g., `!aura heal FDDC5C`).                                                       |
| `!aura hurt <hex>`                   | Sets the color of damage particle effects (e.g., `!aura hurt FF0000`).                                                        |
| `!aura deadfx <trackname>`           | Sets a jukebox track to play when a token dies (e.g., `!aura deadfx Funeral`), or `None` to disable.                        |
| `!aura reset`                        | Resets the script's state to factory defaults.                                                                                |
| `!aura reset-fx`                     | Rebuilds `-DefaultHeal` and `-DefaultHurt` custom FX objects.                                                                 |
| `!aura reset-all`                    | Restores all settings to `DEFAULTS`, rebuilds default FX, and force-syncs tokens.                                             |
| `!aura deathsaves on/off/toggle`     | Enables or disables the optional Death Save Integration.                                                                     |
| `!aura deathsaves success <attr,…>`  | Sets the success attribute name(s) — single name or comma-separated checkbox list (default targets the D&D sheets).          |
| `!aura deathsaves failure <attr,…>`  | Sets the failure attribute name(s) — single name or comma-separated checkbox list.                                          |
| `!aura deathsaves dyingmarker <name>` | Sets the dying status marker (default `skull`; preserves case and any `::id`; a leading `status_` is stripped).             |
| `!aura deathsaves markers`           | Lists the campaign's status-marker tags (custom markers like "Unconscious" show their exact `Name::id` tag).                 |
| `!aura deathsaves attrs [filter]`    | Debug: whispers the selected character's legacy attributes (`name = value`), optionally filtered by name substring.          |
| `!aura deathsaves watch [status|reset|off]` | Debug: shows watch status, or arms a live watcher for selected tokens using configured success/failure fields; whispers when values register/change/clear. |
| `!aura deathsaves watchstatus` | Debug: reports currently configured watch fields and active watched characters. |
| `!aura deathsaves stablemarker <name>` | Sets the stable status marker (default `green`; same format as `dyingmarker`).                                            |
| `!aura deathsaves debug`             | Whispers a per-token diagnostic (token/character/HP/marker state) for the selected token(s).                                |

### HealthColor Palettes

- `default`: High = Green, Mid = Yellow, Low = Red, Dead = Black.
- `colorblind`: High = Cyan, Mid = Orange, Low = Magenta, Dead = Black.
- At exactly 0 HP, the script uses the palette dead color (`#000000`) for clear knockout state.
- If HP is above 100%, the script still uses blue (`#0000FF`) for overflow/temporary HP visualization.

---

## Death Save Integration (Optional)

An **optional, off-by-default** feature that distinguishes three states for **player characters** at 0 HP:

- **Dying** — 0 HP, still rolling (default marker **skull**). To use a specific marker — e.g. the D&D **Unconscious** condition marker — run `!aura deathsaves markers` to get its exact tag (custom markers are usually `Name::id`), then `!aura deathsaves dyingmarker <tag>`. A bare name like `unconscious` won't render if the real tag includes an id.
- **Stable** — 3 recorded successes while at 0 HP (default marker **green**).
- **Dead** — 3 failures (existing **Red X** / `status_dead`).

NPCs are unaffected and keep the standard dead Red X at 0 HP.

### How marker sync works

HealthColors watches the configured success/failure fields and updates markers automatically as those values change:

1. Configure the attribute names if yours differ from the defaults (the defaults target the D&D sheets):
   - `!aura deathsaves success deathsave_succ1,deathsave_succ2,deathsave_succ3`
   - `!aura deathsaves failure deathsave_fail1,deathsave_fail2,deathsave_fail3`
   - (A single counter attribute also works — just give one name.)
2. Enable: `!aura deathsaves on`.
3. Optional: run `!aura deathsaves watch` with selected token(s) to arm/refresh watcher baselines for debug/status visibility.
4. In play: marker state updates automatically as watched death-save fields change (`3+` fails -> dead, `3+` successes -> stable, otherwise dying).

### Behaviour

- **PC drops to 0 HP** → starts as **dying** automatically.
- **PC healed above 0 HP** → all death markers cleared automatically.
- **Already-downed PC** (token moved, forced refresh) → marker left as last synced, so a dead/stable PC isn't reset to dying.
- **Mixed checks (some successes and some failures)** -> marker follows rules in priority order: `3+` fails -> dead, else `3+` successes -> stable, else dying.
- **All watched boxes cleared at 0 HP** -> current downed marker is preserved (prevents accidental reset/reclassification from sheet-wide clears).
- The death sound (`!aura deadfx`) plays once when a PC becomes **dead** (3 failures).

---

## Tips & Troubleshooting

- **Aura Visibility**: Aura 1 radius is measured in feet from the token edge. The default is `0.35`, which can appear subtle on some maps. Increase it (e.g., `3.0`) if you want a more obvious health ring.
- **Manual Changes**: In aura mode, any manual changes to Aura 1 color or radius will be overwritten the next time the token's health changes. In tint mode, Aura 1 is never touched by the script, so manual aura settings persist permanently.
- **Palette Changes**: Switching palettes from the menu or with `!aura palette ...` immediately runs a full refresh of tokens (equivalent to a force update).
- **One-Off Tokens**: You can toggle "One-Offs" in the settings to enable health tracking for tokens that are not linked to a character sheet.
- **FX Rendering Variance**: Some Roll20 sandbox/client combinations can render `spawnFxWithDefinition` colors inaccurately. HealthColors uses a fallback that updates default custom FX objects and spawns by FX ID to keep heal/hurt colors consistent.
- **Missing Max HP**: If the configured health bar has no `max` value on a token, HealthColors now clears that token's aura/tint until a max value is set.
- **Third-Party Script Compatibility (AlterBars, etc.)**: When another API script changes HP by writing to a character attribute (rather than directly to the token bar), HealthColors detects the change via its `change:attribute` listener and updates the aura/tint and dead status correctly. No special configuration is required.

---

## Credits

Original Author: DXWarlock
Version 1.7.1 edit by Surok
Refactored and Modernized for v2 by MidNiteShadow7
