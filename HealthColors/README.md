# HealthColors

**HealthColors** is a Roll20 API script that provides automated visual feedback for token health. It dynamically updates a token's **Aura 1** or **Tint** color based on its current hit point percentage, allowing GMs and players to see a token's status at a glance without checking character sheets.

---

## Features

- **Palette-Based Color Shifting**: Automatically transitions across a 3-stop health gradient with a dedicated dead color at 0 HP.
- **Built-In Palettes**: Choose between `default` and `colorblind` palettes for clearer table visibility.
- **Aura & Tint Modes**: Choose between a glowing health ring (Aura 1) or a full token color overlay (Tint).
- **Exclusive Mode Management**: The script manages either Aura 1 (aura mode) or the token tint (tint mode) — never both simultaneously. In tint mode, Aura 1 is left untouched alongside Aura 2, freeing both rings for manual use as range indicators, light sources, or status markers.
- **All Six Roll20 Aura Shapes**: The Aura 1 health ring can be a Circle, Square, Hex, Circle Border, Square Border or Hex Border, or **Auto** (hex on hex-grid pages once the radius is at least one grid cell, circle otherwise). Border shapes draw an outline without shading the token. **Keep** leaves each token's own shape alone. See [Aura Shapes & Appearance](#aura-shapes--appearance).
- **Aura Opacity & Player Lock**: Make the health ring see-through (`!aura opacity`) and stop controlling players from editing it by accident (`!aura lock`).
- **Any of the Four Token Bars**: Health can be read from bar 1–4 (bar 4 needs the game's *Maximum Token Bubbles/Bars* setting raised to 4).
- **Reference Values in Output**: The menu and settings snapshot also list Aura 1 Color and Aura 2 Radius/Shape/Color. These are reference values for your table only; the script never applies them to tokens.
- **Manual Overrides**: In aura mode, HealthColors owns Aura 1: it is re-synced to the health colour on each HP change and whenever the token's Aura 1 settings are saved. In tint mode, Aura 1 is never touched by the script, so manual aura settings persist permanently alongside the health tint.
- **Heal & Hurt FX**: Spawns particle effects when tokens are hurt or healed — a recoloured default burst, any Roll20 built-in effect (`glow-holy`, `explode-blood`, …), or a custom FX from the Effects menu, set globally or per character. See [Heal & Hurt FX](#heal--hurt-fx).
- **Automated Dead Status**: Automatically applies a configurable status marker (default: Red X) when a token reaching 0 HP.
- **NPC vs PC Config**: Separate settings for players and NPCs, including nameplate visibility and health tracking toggles.
- **In-Game Help Handout**: A GM-only **HealthColors — Help & Reference** handout in the Journal has the command list, aura shapes & appearance, colour palettes, attribute reference, optional integrations, tips & troubleshooting and the game's current settings. It is rebuilt whenever the script loads or a setting changes; open it from the **Help** row of the `!aura` menu or rebuild it with `!aura handout`.
- **Optional Death Save Integration**: An off-by-default feature that distinguishes **dying** (configurable marker), **stable** (green), and **dead** (Red X) player characters at 0 HP, with marker sync driven automatically from watched death-save attributes (works on both the D&D 2024 and 2014 sheets; 2024/Beacon sheets need Mod Script Sandbox v1.5). See [Death Save Integration](#death-save-integration-optional).

---

## Manual Installation

1. Copy the code from `HealthColors.js`.
2. In your Roll20 Game Settings, go to **API Scripts**.
3. Create a **New Script**, name it `HealthColors.js`, and paste the code.
4. Click **Save Script**.

A manual install has no One-Click dialog; configure everything in-game with `!aura`.

## One-Click Install Options

When installed from the Roll20 One-Click library, every HealthColors setting can be pre-set in the install dialog (the option names match the setting names used below, e.g. `auraBar`, `FX`, `HealFX`, `deathSavesOn`). HealthColors applies those values when the game's API sandbox next starts, and again whenever you save the One-Click dialog. Between saves, changes made in-game with `!aura` are kept across restarts. `!aura reset` and `!aura reset-all` return to the One-Click values. Blank options are ignored, and invalid values keep the current setting.

---

## Usage & Commands

### The Configuration Menu

Type `!aura` in the chat to open the interactive configuration menu. Every value is a button: click it to change the setting (buttons that need a value open a prompt; hover over a button for a hint where one is shown).

- **Action bar** (top): **Update Selected** re-colours the selected token(s) (`!aura update`), **Refresh All** re-colours every token (`!aura forceall`), and **Post Settings** posts a read-only copy of the settings to game chat (`!aura settings`).
- **Sections:** General · Tracking & markers · Nameplates (a GM/Players × PCs/NPCs grid) · Aura 1 ring · Effects & sound · Death Save Integration · Reference values (not applied).
- **Footer:** **Open Help** opens the help handout and **Rebuild Help** recreates it.

Red buttons are switched off and grey nameplate buttons are set to *Off* (leave the token's own setting alone). When a command changes a setting, HealthColors re-whispers the menu so you can carry on without typing `!aura` again. The `!aura settings` snapshot uses the same layout without buttons.

### Help Handout

HealthColors keeps a GM-only **HealthColors — Help & Reference** handout in the Journal. It contains the command list, aura shapes & appearance, colour palettes, the attribute reference, optional integrations, tips & troubleshooting and a table of the game's current settings. It is rebuilt whenever the script loads and after every setting change. Open it from the **Help** row of the `!aura` menu, or run `!aura handout` to rebuild it.

### Command Reference

| Command                     | Description                                                                                                                   |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `!aura`                     | Opens the main configuration menu.                                                                                            |
| `!aura settings`            | Outputs the current HealthColors settings snapshot to game chat.                                                              |
| `!aura handout`             | Rebuilds the GM-only **HealthColors — Help & Reference** handout and whispers a link to it.                                   |
| `!aura forceall`            | Forces a visual sync for every token on the current map.                                                                      |
| `!aura on/off`              | Enables or disables the script globally.                                                                                      |
| `!aura tint`                | Toggles between **Aura 1** mode and **Tint** mode.                                                                            |
| `!aura palette <name>`      | Sets the health palette (`default` or `colorblind`) and auto-refreshes all tokens.                                            |
| `!aura size <n>`            | Sets the Aura 1 radius in page units (usually feet) from the token edge (e.g., `!aura size 0.35`) and refreshes tokens.       |
| `!aura a1shape <shape>`     | Sets the Aura 1 health-ring shape and refreshes tokens: `Auto` (default), `Auto Border`, `Keep`, `Circle`, `Square`, `Hex`, `Circle Border`, `Square Border`, `Hex Border`. |
| `!aura opacity <1-100>`     | Sets the Aura 1 health-ring opacity in percent (`100` = solid) and refreshes tokens.                                          |
| `!aura lock`                | Toggles whether controlling players are locked out of editing Aura 1 in aura mode (default on).                               |
| `!aura a1tint <hex>`        | Sets the Aura 1 colour reference value (not applied; aura mode colours by health).                                            |
| `!aura a2size <n>`          | Sets the Aura 2 radius reference value (not applied to tokens).                                                               |
| `!aura a2shape <shape>`     | Sets the Aura 2 shape reference value (any of the six Roll20 shapes; not applied to tokens).                                  |
| `!aura a2tint <hex>`        | Sets the Aura 2 colour reference value (not applied to tokens).                                                               |
| `!aura bar <1/2/3/4>`                | Sets which token bar represents health and immediately forces a full token sync. Bar 4 needs *Maximum Token Bubbles/Bars* set to 4. |
| `!aura pc / !aura npc`               | Toggles health tracking for PCs or NPCs.                                                                                      |
| `!aura perc <PC> <NPC>`              | Sets aura/tint visibility threshold: `0` disables, `1-99` shows at or below that HP%, `100` always visible for living tokens. |
| `!aura dead / !aura deadPC`          | Toggles the automatic "Dead" status marker.                                                                                   |
| `!aura gmpc <Yes/No/Off>`            | Sets GM visibility of PC token nameplates (`Yes` = always show, `No` = always hide, `Off` = use Roll20 default).             |
| `!aura gmnpc <Yes/No/Off>`           | Sets GM visibility of NPC token nameplates (`Yes` = always show, `No` = always hide, `Off` = use Roll20 default).            |
| `!aura pcpc <Yes/No/Off>`            | Sets player visibility of PC token nameplates (`Yes` = always show, `No` = always hide, `Off` = use Roll20 default).         |
| `!aura pcnpc <Yes/No/Off>`           | Sets player visibility of NPC token nameplates (`Yes` = always show, `No` = always hide, `Off` = use Roll20 default).        |
| `!aura oneoff`                       | Toggles health tracking for tokens that are not linked to a character sheet.                                                  |
| `!aura update`                       | Re-colours the selected token(s) now (the menu's **Update Selected** button). Reminds you to select a token if none is selected.                                                              |
| `!aura fx`                           | Toggles particle effects for damage and healing.                                                                              |
| `!aura heal <effect>`                | Sets the healing effect: a hex colour (`!aura heal FDDC5C`), a built-in effect (`!aura heal glow-holy`), a custom FX name/id, or `default`. |
| `!aura hurt <effect>`                | Sets the damage effect: a hex colour (`!aura hurt FF0000`), a built-in effect (`!aura hurt explode-blood`), a custom FX name/id, or `default`. |
| `!aura listfx`                       | Lists the campaign's custom FX (with ids and one-click Heal/Hurt set buttons) and the built-in effect names.                  |
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
| `!aura deathsaves sync` | Forces an immediate marker resync for selected tokens using configured success/failure fields (useful after imports/migrations). |
| `!aura deathsaves stablemarker <name>` | Sets the stable status marker (default `green`; same format as `dyingmarker`).                                            |
| `!aura deathsaves debug`             | Whispers a per-token diagnostic (token/character/HP/marker state) for the selected token(s).                                |

### Colour Palettes

Choose a palette with `!aura palette <name>`; every token refreshes straight away. Colours blend smoothly from High (100 % HP) through Mid (50 %) to Low (just above 0).

| Palette      | High (100 %)        | Mid (50 %)          | Low (near 0)       | Dead (0 HP)       |
| :----------- | :------------------ | :------------------ | :----------------- | :---------------- |
| `default`    | Green `#00FF00`     | Yellow `#FFFF00`    | Red `#FF0000`      | Black `#000000`   |
| `colorblind` | Cyan `#33BBEE`      | Orange `#EE7733`    | Magenta `#CC3311`  | Black `#000000`   |

- At exactly 0 HP, the script uses the palette dead colour (`#000000`) for a clear knockout state.
- Above 100 % HP (temporary HP), the colour is always blue (`#0000FF`).

---

## Aura Shapes & Appearance

In aura mode, HealthColors sets these Aura 1 properties on each coloured token:

| Setting       | Command                 | Default | Notes |
| :------------ | :---------------------- | :------ | :---- |
| Radius        | `!aura size <n>`        | `0.35`  | Page units from the token edge (feet on a standard 5 ft grid). |
| Shape         | `!aura a1shape <shape>` | `Auto`  | `Auto` = Hex on hex-grid pages when the radius is at least one grid cell (e.g. 5 ft), otherwise Circle. `Auto Border` = the outline versions. `Keep` = never change the token's shape. Any of Roll20's six shapes can also be chosen directly. Two-word shapes can be typed with or without the space (`Circle Border`, `circleborder`, `circle-border`). |
| Opacity       | `!aura opacity <1-100>` | `100`   | Below 100 the colour gets an alpha channel (e.g. `#ffff0080` at 50 %), so the map shows through the ring. |
| Player lock   | `!aura lock`            | On      | Sets the token's *players can edit Aura 1* option off while HealthColors manages it. |

Changing any of these from the menu or chat refreshes every token straight away.

**Upgrading from 2.3.x or earlier:** the old Aura 1 Shape setting was display-only. If your game still had the old default `Circle`, it is switched to `Keep` on first load so auras you shaped by hand are not changed. Any other stored shape is applied from now on. Pick `Auto` (or another shape) in the menu to let HealthColors manage the shape.

**Switching to tint mode** releases Aura 1: the ring is cleared, the shape returns to Roll20's default Circle (unless Shape is `Keep`) and players can edit Aura 1 again.

---

## Heal & Hurt FX

When a token's HP changes, HealthColors can play a particle effect at the token (`!aura fx` toggles this). The heal and hurt effects are chosen independently with `!aura heal <effect>` and `!aura hurt <effect>`, and each accepts three formats:

| Format                | Example                              | What plays                                                                                                         |
| :-------------------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| 6-digit hex colour    | `!aura hurt FF0000`                  | HealthColors' default particle burst (`-DefaultHeal` / `-DefaultHurt`) in that colour, scaled by token size and damage. |
| Built-in effect name  | `!aura heal glow-holy`               | One of Roll20's built-in effects, exactly as named in the in-game Effects menu (`<type>-<colour>`).                 |
| Custom FX name or id  | `!aura hurt Blood Spray`             | A custom FX you created in the Effects menu, scaled by token size and damage. Names are matched case-insensitively. |

`!aura heal default` / `!aura hurt default` restore the shipped colours (`FDDC5C` / `FF0000`).

Built-in effect names combine a **type** — `beam`, `bomb`, `breath`, `bubbling`, `burn`, `burst`, `explode`, `glow`, `missile`, `nova`, `splatter` — with a **colour** — `acid`, `blood`, `charm`, `death`, `fire`, `frost`, `holy`, `magic`, `slime`, `smoke`, `water` — e.g. `glow-holy`, `explode-blood`, `splatter-blood`, `burst-magic`. Built-in effects are drawn by Roll20 at their fixed size; only colour bursts and custom FX are scaled to the token and the amount of damage.

Run `!aura listfx` (or press **List FX** in the menu) to see every custom FX in the campaign with its id and one-click **Heal** / **Hurt** buttons, plus the built-in name reference. The current heal/hurt choice is shown in the `!aura` menu and the `!aura settings` snapshot.

### Per-character overrides

Individual characters can use different heal/hurt effects, or none, with the `USEBLOOD` and `USEHEAL` attributes. See the [Attribute Reference](#attribute-reference).

---

## Attribute Reference

HealthColors adds these attributes to a character the first time it processes it (`USECOLOR` as `YES`, the others as `DEFAULT`). Edit them on the sheet's Attributes & Abilities tab to make one character differ from the global settings.

| Attribute  | Controls      | Values                                                                                                                                   |
| :--------- | :------------ | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `USECOLOR` | Health colour | `YES` = colour this character by health · `NO` = never colour its tokens                                                                  |
| `USEBLOOD` | Hurt FX       | `DEFAULT` = global hurt setting · `OFF` / `NO` = no HealthColors FX at all for this character · a hex colour · one or more effect names (built-in or custom), comma-separated |
| `USEHEAL`  | Heal FX       | `DEFAULT` = global heal setting · `OFF` / `NO` = no heal FX for this character · a hex colour · one or more effect names, comma-separated |

A list such as `splatter-blood, Bone Shards` plays every entry. If an entry names a custom FX that no longer exists, HealthColors plays the default effect instead and whispers the GM once (per setting change) naming the character and attribute to fix.

---

## Optional Integrations

### Death Save Integration (Optional)

An **optional, off-by-default** feature that distinguishes three states for **player characters** at 0 HP:

- **Dying** — 0 HP, still rolling (default marker **skull**). To use a specific marker — e.g. the D&D **Unconscious** condition marker — run `!aura deathsaves markers` to get its exact tag (custom markers are usually `Name::id`), then `!aura deathsaves dyingmarker <tag>`. A bare name like `unconscious` won't render if the real tag includes an id.
- **Stable** — 3 recorded successes while at 0 HP (default marker **green**).
- **Dead** — 3 failures (existing **Red X** / `status_dead`).

NPCs are unaffected and keep the standard dead Red X at 0 HP.

#### How marker sync works

HealthColors watches the configured success/failure fields and updates markers automatically as those values change:

1. Configure the attribute names if yours differ from the defaults (the defaults target the D&D sheets):
   - `!aura deathsaves success deathsave_succ1,deathsave_succ2,deathsave_succ3`
   - `!aura deathsaves failure deathsave_fail1,deathsave_fail2,deathsave_fail3`
   - (A single counter attribute also works — just give one name.)
2. Enable: `!aura deathsaves on`.
3. Optional: run `!aura deathsaves watch` with selected token(s) to arm/refresh watcher baselines for debug/status visibility.
4. Optional: run `!aura deathsaves sync` with selected token(s) to force an immediate marker reconciliation.
5. In play: marker state updates automatically as watched death-save fields change (`3+` fails -> dead, `3+` successes -> stable, otherwise dying).

#### D&D 2024 / Beacon sheets — sandbox requirement

On Beacon-model sheets (e.g. D&D 2024), the death-save checkboxes are **not** legacy attributes; HealthColors reads them with Roll20's sheet-item API (`getSheetItem`). That API only returns **live** values on **Mod Script Sandbox v1.5** (formerly "Experimental"); on **v1.0** (formerly "Default") it returns sheet defaults, often all `0`, so markers cannot track the sheet.

- Roll20 renamed the sandboxes in September 2026 and made v1.5 the default for games that never chose one. Check yours under **Game Settings → Mod (API) Scripts → Mod Script Sandbox**; pick **v1.5 (Latest)** and **Restart Server** if needed.
- The API console startup banner shows the running version, e.g. `##########> Sandbox [v1.5 2026-08-19] : Ready fired …`. HealthColors also logs it on startup and, on v1.0 or when the version is not reported, notes it under Death Save Integration in the GM menu.
- HealthColors reads the version from `Campaign().sandboxVersion`. When it finds a watched PC whose death saves are not legacy attributes on a v1.0 sandbox, it whispers a one-time GM notice; on v1.5 no notice is needed. `!aura deathsaves debug` reports the sandbox version and the storage/API facts per token.

#### Behaviour

- **PC drops to 0 HP** → starts as **dying** automatically.
- **PC healed above 0 HP** → all death markers cleared automatically.
- **Already-downed PC** (token moved, forced refresh) → marker left as last synced, so a dead/stable PC isn't reset to dying.
- **Mixed checks (some successes and some failures)** -> marker follows rules in priority order: `3+` fails -> dead, else `3+` successes -> stable, else dying.
- **All watched boxes cleared at 0 HP** -> current downed marker is preserved (prevents accidental reset/reclassification from sheet-wide clears).
- The death sound (`!aura deadfx`) plays once when a PC becomes **dead** (3 failures).

### TokenMod

When [TokenMod](https://github.com/Roll20/roll20-api-scripts/tree/master/TokenMod) is installed, HealthColors registers with its token-change observer, so HP set with `!token-mod --set bar1_value|-5` updates colours, markers and FX exactly like a manual edit (one FX per change).

### SmartAoE

When [SmartAoE](https://github.com/Roll20/roll20-api-scripts/tree/master/SmartAoE) is installed, HealthColors registers with its token-change observer, so area damage and healing that SmartAoE applies to token bars re-colours the tokens and updates the dead marker. (Roll20 does not raise change events for changes made by another script, so without this hook SmartAoE damage would leave colours stale.)

**SmartAoE's 0 HP marker takes precedence.** If an AoE has a `zeroHPmarker` set, SmartAoE adds that marker just before it lowers the HP bar. When HealthColors sees a token at 0 HP that carries a SmartAoE 0 HP marker, it adds no marker of its own:

- no dead (Red X) marker, though the death sound (`!aura deadfx`) still plays;
- with Death Save Integration, no dying marker. Stable and dead are death-save results rather than "at 0 HP", so they are still shown when the saves come in.

HealthColors never removes SmartAoE's marker, even if both use the same tag. The rule applies however the token reached 0 HP, as long as the SmartAoE marker is on it. HealthColors recognises the tags set as `zeroHPmarker` on any SmartAoE AoE, including `--instant` AoEs and AoEs deleted since the sandbox started (it asks SmartAoE 1.0.0+ through `SmartAoE.ZeroHPMarkers()`, and reads the AoEs saved by older versions). If SmartAoE isn't installed, the rule is off.

The help handout marks TokenMod and SmartAoE as *detected* or *not installed* for the current game, and the API console logs `HealthColors: observing token changes from …` at startup.

### AlterBars, ChatSetAttr and other attribute scripts

Scripts that change the HP **attribute** rather than the token bar are picked up by HealthColors' `change:attribute` listener, which updates the aura/tint and dead status. Changes to the attribute's max (e.g. sheets that calculate HP max) re-colour the token too. No set-up is needed.

### One-Click install options

Every setting can be pre-set in the Roll20 One-Click install dialog; see [One-Click Install Options](#one-click-install-options).

### Script API

Other Mod scripts can ask HealthColors to re-colour a token:

```js
HealthColors.Update(token, prev); // prev = the token's previous values, or {}
```

---

## Tips & Troubleshooting

- **Aura Visibility**: Aura 1 radius is measured in page units (usually feet) from the token edge. The default is `0.35`, which can appear subtle on some maps. Increase it (e.g., `3.0`) or try a border shape if you want a more obvious health ring.
- **Manual Changes**: In aura mode, manual changes to Aura 1 colour, radius or shape are overwritten when the token's health changes or its settings are saved (set Shape to `Keep` to manage shapes yourself). In tint mode, Aura 1 is never touched by the script, so manual aura settings persist permanently.
- **Auto Shape**: `Auto` uses Hex on hex-grid pages (vertical or horizontal) once the radius is at least one grid cell (e.g. 5 ft), and Circle otherwise.
- **Hex and Square Shapes Need a Bigger Radius**: Roll20 draws hex and square auras in whole grid cells. With the default `0.35` radius, Hex shows little more than a sliver at the token edge and Square fills only the token's own cell. For a thin ring at the default radius, use `Circle Border` (or `Auto Border`).
- **Upgraded from 2.3 or Earlier**: If Aura 1 Shape shows `Keep`, the old default `Circle` was switched so existing shapes were not changed. Pick `Auto` or another shape to let HealthColors manage it.
- **Palette and Aura Changes**: Changing the palette, radius, shape, opacity or player lock from the menu or chat immediately refreshes every token (equivalent to a force update).
- **One-Off Tokens**: You can toggle "One-Offs" in the settings to enable health tracking for tokens that are not linked to a character sheet.
- **FX Rendering Variance**: Some Roll20 sandbox/client combinations can render `spawnFxWithDefinition` colors inaccurately. HealthColors uses a fallback that updates default custom FX objects and spawns by FX ID to keep heal/hurt colors consistent; `!aura reset-fx` rebuilds them.
- **"FX … not found" whisper**: A configured custom FX (global `!aura heal`/`!aura hurt` setting or a character's `USEBLOOD`/`USEHEAL` attribute) no longer exists — typically after a campaign reset or character import. Run `!aura listfx` to see what is available and set a valid effect; the default burst plays in the meantime.
- **Missing Max HP**: If the configured health bar has no `max` value on a token, HealthColors now clears that token's aura/tint until a max value is set.
- **Bar 4**: `!aura bar 4` only works when **Game Settings → Maximum Token Bubbles/Bars** is set to 4.
- **Death-Save Markers Not Updating**: On D&D 2024 sheets, switch the game to Mod Script Sandbox v1.5. Run `!aura deathsaves debug` on the token, and `!aura deathsaves sync` to force a re-check.
- **Help Handout**: The handout is rebuilt when the script loads and after each setting change. Run `!aura handout` if it goes missing.
- **SmartAoE or TokenMod Changes Not Colouring**: Check the API console for `observing token changes from …` at startup. If the script isn't listed, make sure it is installed and enabled in the same game, then restart the sandbox.
- **Third-Party Script Compatibility (AlterBars, etc.)**: When another API script changes HP by writing to a character attribute (rather than directly to the token bar), HealthColors detects the change via its `change:attribute` listener and updates the aura/tint and dead status correctly. No special configuration is required. See [Optional Integrations](#optional-integrations).

---

## Credits

Original Author: DXWarlock
Version 1.7.1 edit by Surok
Refactored and Modernized for v2 by MidNiteShadow7
