# DeathTracker

A Roll20 Mod that watches hit points and marks tokens as **Bloodied**, **Dying**, **Stable** or **Dead**. It tracks death saves for player characters, and can move the dead off the map and out of the turn order.

**Version 1.0.0 is a full rewrite of Robin Kuiper's DeathTracker 0.1.8** for Jumpgate and the D&D 2024 sheet. Your 0.1 settings carry over, and `!dead` still works.

## Installation

1. Install **DeathTracker** from the Roll20 One-Click library, or upload `DeathTracker.js` to the game's Mod Scripts.
2. Save. DeathTracker creates two GM-only handouts in the Journal:
   - **DeathTracker - Help**: full instructions.
   - **DeathTracker - Command Deck**: buttons for every command.

## Quick Start

1. Put hit points in Bar 1, or choose another bar in Settings.
2. Damage a token. At half its maximum it gets the Bloodied marker. At 0, an NPC gets the Dead marker.
3. A PC at 0 gets the Dying marker. Tick death saves on the sheet: three successes make it Stable, three failures make it Dead.
4. Heal it above 0 and the markers go away.
5. Type `!deathtracker` for the menu.

## Statuses

| Status   | When                                                                      | Default marker |
| -------- | ------------------------------------------------------------------------- | -------------- |
| Healthy  | Above the Bloodied share of maximum hit points                            | none           |
| Bloodied | At or below that share (50% unless changed)                               | red dot        |
| Dying    | A PC at 0 hit points who is making death saves                            | sleepy         |
| Stable   | A PC at 0 with three successes, or stabilised with `!deathtracker stable` | green dot      |
| Dead     | An NPC at 0, a PC with three failures, or a PC killed by massive damage   | dead (red X)   |

An empty bar, or one that does not hold a number, is never read as 0. Markers can be any marker in the game, including custom sets and the D&D 2024 sheet's condition markers (for example **Unconscious**). DeathTracker only takes away markers it put on itself.

## Death Saves

- **D&D 2024 sheet:** read from the sheet as boxes are ticked or saves are rolled. No macro needed.
- **D&D 2014 sheet** and other sheets that keep death saves as checkboxes: read from the success and failure fields in Settings (`deathsave_succ1` to `3` and `deathsave_fail1` to `3` by default).
- Sheets keep old ticks after healing, so saves are counted from the moment the PC drops to 0. With **Clear sheet boxes** on (the default), DeathTracker clears the sheet's boxes when the PC drops to 0 and when it is healed. On the D&D 2024 sheet it also shows the death save boxes when a PC drops to 0 from the token bar (the sheet only shows them by itself after its own Damage box), and hides them again on healing.
- If the sheet cannot be read, run `!deathtracker macro` to make a **DeathSaves** token action. Players select their token and click it after each save.

### Who is a PC?

A token, or its character, controlled by a player is a PC. With **Who is a PC** set to _Players or sheet_ (the default), a character whose sheet is not an NPC sheet is a PC too, so party members the GM runs work. Select tokens and press **Make PC**, **Make NPC** or **Decide automatically** to choose for their characters.

## When a Token Dies

Each of these is off until you turn it on in Settings:

- **Move the dead to** the GM layer or the Map layer.
- **Turn order:** remove the dead.
- **Applies to:** NPCs only, or NPCs and PCs.

Healing a dead token takes its markers away but does not move it back. Select it and press **Restore**: it goes back to its layer, and into the turn order with the initiative it had.

**Massive damage** (off at first): a PC whose bar goes below 0 by at least its maximum dies outright. The D&D 2024 sheet stops hit points at 0, so this only works when the bar is typed below 0.

## Tint and Effects

As in version 0.1, tokens can be tinted from green to red as they lose hit points, and an effect can play when they are hurt (`splatter-blood`) or healed (`glow-holy`). A token gets its own tint back at full hit points. **Tint PCs** and **Tint NPCs** switch the tint off for either, and **Hurt effect** and **Heal effect** the effects.

## Who Handles What

HealthColors 2.5 and later can also track death saves, colour tokens by health and play hurt and heal effects. **Who handles what**, at the top of Settings, chooses which Mod does each, or neither:

| Setting                      | Command                                                          | What it covers                                                              |
| :--------------------------- | :--------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| Death saves and 0 HP markers | `!deathtracker set deathSavesBy DeathTracker\|HealthColors\|off` | Death save tracking, announcements, and the dying, stable and dead markers. |
| Health colours               | `!deathtracker set coloursBy DeathTracker\|HealthColors\|off`    | DeathTracker's tint, or HealthColors' aura or tint.                         |
| Hurt and heal effects        | `!deathtracker set effectsBy DeathTracker\|HealthColors\|off`    | The effects played when hit points go down or up.                           |

The choice is stored once, and HealthColors' `!aura` menu shows and changes the same values, so the two Mods never fight over a token. Changing it in either Mod brings both Mods' tokens up to date. At first DeathTracker handles death saves and HealthColors the colours and effects; without HealthColors, DeathTracker handles all three.

When DeathTracker does not handle death saves it adds no dying, stable or dead marker, reads no sheets and announces nothing, but still knows each token's status (for the menu, the bloodied marker and the on-death actions).

## Commands

All commands start with `!deathtracker` (or `!dt`, or `!dead` from version 0.1). They are GM-only, except the death save macro.

| Command                                 | What it does                                                               |
| --------------------------------------- | -------------------------------------------------------------------------- |
| `!deathtracker`                         | Open the menu.                                                             |
| `!deathtracker status [all]`            | Status of the selected tokens, or of every tracked token on your page.     |
| `!deathtracker check [all]`             | Judge the selected tokens again (`all`: every token on your page).         |
| `!deathtracker stable`                  | Mark the selected PCs at 0 hit points as stable.                           |
| `!deathtracker restore`                 | Put dead tokens DeathTracker moved back on their layer and in turn order.  |
| `!deathtracker clear`                   | Take DeathTracker's markers and tint off the selected tokens.              |
| `!deathtracker pc` / `npc` / `auto`     | Treat the selected tokens' characters as PCs or NPCs, or decide for them.  |
| `!deathtracker markers`                 | List the markers in this game.                                             |
| `!deathtracker macro`                   | Make the DeathSaves token action.                                          |
| `!deathtracker settings`                | Open the settings.                                                         |
| `!deathtracker set <setting> <value>`   | Change a setting.                                                          |
| `!deathtracker reset`                   | Put every setting back to its default.                                     |
| `!deathtracker config [setting\|value]` | Version 0.1's command: open the settings, or change one (`config bar\|2`). |
| `!deathtracker journal rebuild`         | Rebuild the handouts.                                                      |
| `!deathtracker help`                    | List the commands.                                                         |

Add `--ids id1,id2` to work on tokens by ID instead of the selection.

## Settings

| Setting           | Default                                           | What it does                                                                                                                       |
| ----------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `deathSavesBy`    | `DeathTracker`                                    | Who handles death saves and the dying, stable and dead markers: `DeathTracker`, `HealthColors` or `off`. Shared with HealthColors. |
| `coloursBy`       | `HealthColors` if installed, else `DeathTracker`  | Who colours tokens by hit points. Shared with HealthColors.                                                                        |
| `effectsBy`       | `HealthColors` if installed, else `DeathTracker`  | Who plays the hurt and heal effects. Shared with HealthColors.                                                                     |
| `language`        | `en-US`                                           | Language of menus, messages and handouts (24 languages).                                                                           |
| `hpBar`           | `1`                                               | The bar that holds hit points.                                                                                                     |
| `bloodiedPercent` | `50`                                              | Bloodied at or below this percentage of maximum (`0` turns Bloodied off).                                                          |
| `bloodiedMarker`  | `red`                                             | Marker for Bloodied (`none` for no marker).                                                                                        |
| `dyingMarker`     | `sleepy`                                          | Marker for a dying PC.                                                                                                             |
| `stableMarker`    | `green`                                           | Marker for a stable PC.                                                                                                            |
| `deadMarker`      | `dead`                                            | Marker for the dead.                                                                                                               |
| `pcDetection`     | `auto`                                            | `auto`: player-controlled or the sheet says PC. `players`: player-controlled only.                                                 |
| `deathSaves`      | `on`                                              | Track death saves for PCs at 0.                                                                                                    |
| `resetSheetSaves` | `on`                                              | Clear the sheet's death save boxes at the drop to 0 and when healed; show them on the 2024 sheet.                                  |
| `successFields`   | `deathsave_succ1,deathsave_succ2,deathsave_succ3` | Sheet fields for successes (2014 and other sheets).                                                                                |
| `failureFields`   | `deathsave_fail1,deathsave_fail2,deathsave_fail3` | Sheet fields for failures.                                                                                                         |
| `massiveDamage`   | `off`                                             | A PC whose bar goes below 0 by at least its maximum dies outright.                                                                 |
| `announce`        | `controllers`                                     | Who is told that a PC went down, became stable, died or got up: `off`, `gm`, `controllers`.                                        |
| `deathLayer`      | `none`                                            | Move the dead to `none`, `gmlayer` or `map`.                                                                                       |
| `deathTurnOrder`  | `keep`                                            | `keep` or `remove` the dead from the turn order.                                                                                   |
| `deathActionsFor` | `npc`                                             | `npc`, or `all` for PCs as well.                                                                                                   |
| `tintPlayers`     | `on`                                              | Tint PCs by hit points.                                                                                                            |
| `tintNpcs`        | `on`                                              | Tint NPCs by hit points.                                                                                                           |
| `hurtFx`          | `on`                                              | Play an effect when a token loses hit points.                                                                                      |
| `hurtFxType`      | `splatter-blood`                                  | That effect.                                                                                                                       |
| `healFx`          | `off`                                             | Play an effect when a token gains hit points.                                                                                      |
| `healFxType`      | `glow-holy`                                       | That effect.                                                                                                                       |

## Working with Other Mods

- **HealthColors 2.5 and later:** choose who handles death saves, colours and effects in **Who handles what** (see above); both Mods share the choice.
- **HealthColors before 2.5** does not share the choice: use one Mod for death saves. If both track them, DeathTracker warns once; turn HealthColors' off with `!aura deathsaves off`.
- **TokenMod:** hit point changes made with TokenMod are seen.
- **Other Mods** that change hit points (API changes raise no Roll20 events) can call `DeathTracker.check(token)`.
- **CombatMaster, LazyExperience, StatusInfo** and other Mods that call `DeathTracker.ObserveTokenChange` keep working.

### API

| Function                              | What it does                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `DeathTracker.check(token)`           | Judge a token now; returns its status.                                        |
| `DeathTracker.getStatus(token)`       | `healthy`, `bloodied`, `dying`, `stable`, `dead`, or `null`.                  |
| `DeathTracker.onStatusChange(fn)`     | Called with `{token, status, previous, isPc}` when a status changes.          |
| `DeathTracker.ObserveTokenChange(fn)` | Version 0.1: called with `(token, prev)` after a hit point change is handled. |
| `DeathTracker.isManagingDeathSaves()` | `true` when DeathTracker tracks death saves.                                  |

## Upgrading from Version 0.1

- Markers, bar, tint and effect settings are carried over; the old settings are left in place in case you go back.
- `!dead`, `!dead config` and `!dead reset` still work, and so does a custom command you set in 0.1.
- The PC Unconscious marker is now the Dying marker, and PCs at 0 now make death saves (turn **Track death saves** off for 0.1's behaviour).
- Changing the bar no longer needs a restart.
- Clearing a bar no longer marks the token dead, and a blank maximum no longer gives a broken tint.

## Credits

- Original Mod by [Robin Kuiper](https://app.roll20.net/users/1226016/robin) ([GitHub](https://github.com/RobinKuiper/Roll20APIScripts), [Patreon](https://www.patreon.com/robinkuiper)), with TokenMod support by The Aaron.
- Version 1.0 by [MidNiteShadow7](https://app.roll20.net/users/16506286/midniteshadow7) ([GitHub](https://github.com/steverobertsuk)).

## License

This script is licensed under the MIT License.
