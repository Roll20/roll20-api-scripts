# T&T - Combat Assistant

**Author:** [AmadeusVF](https://app.roll20.net/users/15900768/amadeusvf)  
**Version:** 1.2.16  
**System:** Dungeons & Dragons 5E — Roll20 D&D 2014 & D&D 2024

Combat Assistant is a Roll20 Mod script designed to automate combat bookkeeping while keeping the GM in control.
It reads attacks, damage, healing, saving throws, initiative, spells, resources, and other information directly from supported Roll20 D&D character sheets and turns that information into interactive combat tools.

Instead of replacing Roll20's normal combat system, Combat Assistant works around it: players can continue rolling from their character sheets while the script handles many of the repetitive tasks that normally follow those rolls.

---
## What's New in v1.2.16

- **Settings footer:** Default, Recommended, and the pale-green **Language Template** each occupy an equal third of the available footer width. Language Template opens the [current language template](https://amadeusvf.s.gy/combat-assistant-language-template-latest).
- **Recommended Settings preset:** a pale-blue **Recommended / Recomendado** button beside Default requests confirmation and applies only 52 requested ON/OFF flags (40 ON, 12 OFF), preserving image URLs, handout language, marker names, numbers, spell templates and macros. The exact provided preset sets the optional resource gate and both movement blockers to OFF.
- **Healing recipient fix:** a failed resource deduction suppresses the player's Heal/Temp HP target-selection button, including stale sheet balances. A valid cast that spent its final slot can finish its already-paid resolution once. Players cannot run denied action IDs manually. The GM also receives a separate **Single Use Heal / Temp HP** target card, in addition to the normal GM review card; players with the button setting OFF still get their read-only healing roll result.
- **Spanish localization:** the initiative-request success message is explicitly translated, Settings and help phrasing are more natural for Latin American Spanish, and Spanish GM-related wording consistently uses **DM**.
- **Three language choices:** English (EN), Spanish (ES) and Custom (CUS) from Settings → Extra → Language. French can be loaded using the supplied JSON in the `CA Language` handout under Custom.
- **Narrative localization:** Dash, Disengage and Dodge actions, resource depletion (`No uses remain.`), combat misses, conditions and resource usage now use complete translated sentences rather than ambiguous word substitutions.
- **Attack descriptions:** Melee Attack, Ranged Attack, and Range Attack display in the selected language without changing underlying attack classifications or Roll20 commands.
- **Optional resource gate:** Settings > Resources > **Block Without Resources** (Spanish: **Bloquear sin recursos**, default OFF) hides depleted-resource Roll/ATK/Heal player controls, including prompts from captured native rolls. GM review/resolution cards remain available; rejected casts do not expose player ATK/Heal buttons; valid once-paid final-slot casts can still be resolved.
- **Turn Tracker movement locks:** **Turn Movement Blocker** and **Movement Consumed Blocker** (both default OFF) use individual token `lockMovement` for player-controlled initiative tokens outside their turn or after spending their speed. CA applies off-turn locks as soon as it writes native initiative results to Turn Order; manual Turn Order changes use the Roll20 event handler. Dash can restore available movement; CA locks are cleared when tokens leave initiative, settings are disabled or combat ends. Does not pause campaign movement globally.
- **Compatibility:** Persistent schema **7**, original gameplay logic and existing ON/OFF/+ /X button geometry are unchanged. The French JSON is included as a reference, not a required installation step.

### Block Without Resources

In **`!ca settings` → Resources**, enable **Block Without Resources** to replace CA's unavailable player Roll/DMG/ATK/Heal/Cast/Send controls with a short localized “Out of resources” notice. This checks sheet resource balances, appropriate spell slots (including upcasting and Pact Magic), and known item charge costs. The setting defaults **OFF**, operates independently from automatic consumption, and never restricts GM controls. It does not disable buttons native to the Roll20 character sheet or already-rendered chat buttons; refresh CA cards after changing resource totals. A cast that legally spent its final slot retains its resulting target-resolution controls for one authorized use. The GM receives an independent Heal/Temp HP single-use card as well as their general healing review card.

## Languages (English, Spanish, and Custom JSON)

- English is the default and **Spanish is built in**. French and other languages use the **Custom** handout.
- Open **`!ca settings` → Extra → Language**, and select `English`, `Español`, or `Custom` using the compact `EN`/`ES`/`CUS` control.
- For French or another language, create a Roll20 Journal handout named **`CA Language`**, place a valid translation JSON in **Notes**, and choose **Custom**. The supplied French JSON can be used directly in the handout. If a campaign previously selected built-in FR, it defaults to EN until a supported language is selected.
- To reload an edited handout, select **Custom** again; it also reloads on sandbox startup. Invalid JSON leaves the previous language intact.
- External translations use native English text keys; preserve `{source}`, `{target}`, `{amount}` and other placeholders. Unknown translations fall back to English.
- User-supplied character, player, attack, spell, item and macro names, as well as Roll20 commands, remain untranslated.
- Translated buttons, Settings and titles adapt font size to their available space, with wrapping for longer labels. **ON/OFF remain universal and untranslated** (32×15 px); English retains its existing layout.
- Spell preparation labels (`Level`, `Prepared`, `Unprepared`, `Slots`) and standard D&D damage types are localized in cards, tooltips and selectors; the values passed to Roll20 remain the canonical English identifiers.
- Spanish terminology was reviewed for D&D usage (`Save` is a saving throw, not an instruction to save a file), with natural spell and combat narratives. Narrow columns display readable abbreviations and full translated tooltips; the supplied French JSON follows the same rules.
- All Settings menus use flexible label columns and a fixed 36px control cell, avoiding premature text wrapping in translated languages. Marker settings reserve a separate value cell.
- Main-menu controls also localize **Dmg → Daño**, **Init → Iniciar**, **Sheet → Hoja**, **Turn Card → Tarjeta de Turno** and **Next Turn → Siguiente Turno** (Spanish); `Conc.` stays `Conc.`. Icons and button sizes remain fixed.
- Expanded CA-owned tooltip translations in built-in Spanish and Custom French, including contextual prompts and dice-roll details. Player/character/spell/attack names remain native.


## Changes Since the Earlier One-Click Release

This update builds on the previously published **v1.2.8**. All improvements between those versions are included; versions 1.2.9–1.2.14 were not published as separate One-Click entries in the upstream Roll20 repository.

- **Compact Sheet:** `!ca sheet` offers a token-bound character overview with HP/AC, attributes, saving throws, skills, initiative, and common turn actions.
- **Special Actions:** `!ca combat-special` provides a unified menu for Bonus Actions, Reactions, Free Actions, Legendary Actions, and Mythic Actions when available on the supported sheet.
- **Prepared Spells:** The Spells menu links to a preparation manager with ON/OFF controls, locked Always Prepared / item-granted entries, and prepared counts. Supports native 2014 and 2024 preparation data where available.
- **Prepared-only filtering:** The 2024 Spells menu honors the supported sheet preference and the stricter **2024 Prepared Spells Only** Combat Assistant setting. The preparation manager still displays unprepared spells so they can be enabled.
- **Magic-item spells:** Improved 2024 identification of spells supplied by items and supported charge consumption, using verifiable native Roll20 IDs rather than spell names alone.
- **Spell resource tracking:** Improved attribution of class Spell Slots, item charges, and linked spell uses; ambiguous casts are not charged automatically. Requires **Chat Monitoring** and **Consume Spell Slots** where applicable.
- **Auto-hit spells:** Improved correlation of native 2024 multi-projectile rolls such as *Magic Missile*, including deduplication and safer cast-level inference. The latest build uses a **1-second inactivity window** after the final detected projectile; this timing should be tested in live campaigns, especially with upcast spells or network delays.
- **Concentration and actions:** Improved correlation of concentration follow-up damage, native action identifiers, and repeated actions such as *Witch Bolt*.
- **Menus and controls:** Unified character-title presentation for Combat, Special Actions, Spells and Prepared Spells, with 30×30 token portraits and centered Back/Book controls. Corrected the appearance of locked preparation buttons.
- **Reliability and maintenance:** Improved ownership checks on imported tokens, legacy/2024 roll handling, Settings validation, and removal of redundant internal code.

The **persistent state schema remains version 7**. Updating the script does not require a separate state schema migration, but test a new release in a copy of your campaign before replacing a working version.

---
## Installation and First Use

1. Add **T&T - Combat Assistant** from Roll20's Mod (One-Click) library in a game with Mod API access, or install the matching JavaScript version manually. Use only **one active copy** of Combat Assistant.
2. Select a token that represents a character using the official Roll20 D&D 2014 or 2024 sheet.
3. Enter `!ca menu` in chat; use `!ca settings` to review the features you want enabled.
4. Try `!ca sheet`, `!ca combat`, `!ca spells`, and `!ca resources` with a supported token selected.
5. For automatic spell-resource tracking, configure **Chat Monitoring** and **Consume Spell Slots**, and verify the applicable sheet's native resource behavior.

For complete integration with linked D&D 2024 Beacon character data, Roll20's **Experimental API Sandbox** is recommended. If Beacon-specific data is unavailable, supported 2014 and unlinked-token features can still operate in compatibility mode.

---
## Main Features

### Attack & Damage Automation

Combat Assistant monitors supported Roll20 attack and damage rolls and creates interactive action cards for the GM.

It can:
- Compare attacks against the target's AC.
- Apply damage directly to selected tokens.
- Handle multiple damage types.
- Apply damage from saving throw effects.
- Support half damage on successful saves.
- Process critical attacks.
- Apply manual damage when needed.
- Display public combat results and damage sources.
- Optionally hide token names from public combat logs.

### Damage Resistances, Immunities & Vulnerabilities

Combat Assistant can read damage traits from supported character sheets and automatically modify incoming damage.

Supported behavior includes:
- Resistance.
- Immunity.
- Vulnerability.
- Multiple damage types in the same attack.
- Temporary HP before normal HP damage.

This allows attacks such as Fire, Cold, Slashing, Necrotic, Radiant, Psychic, Force, and other standard D&D damage types to be resolved automatically.

---
## Healing & Temporary HP

Healing rolls can be captured directly from Roll20 and converted into interactive healing actions.

Combat Assistant supports:
- Normal HP healing.
- Temporary HP.
- Manual healing.
- Healing multiple selected targets.
- Player-controlled healing buttons when enabled.
- Public or private healing results.

**Healing privacy:** Combat Logs never reveal a target's previous/current/maximum HP or Temporary HP totals. With **Settings → Privacy → Hide Damage Details** OFF, they show the effective healing amount (e.g. *Healer heals 8 Hit Points to Target using Healing Word*); ON hides the amount. **Reveal Damage Source in Log** controls the healer/ability, and **Hide Combat Log** only changes delivery to a GM whisper. Public logs never include a healing rollbox; private GM rollboxes appear only when details are visible. GM-only manual healing summaries remain private. This does not suppress native Roll20 chat messages generated by the character sheet.

---
## Saving Throws

Combat Assistant can resolve saving throws for individual creatures or entire groups.

Supported abilities:
- Strength
- Dexterity
- Constitution
- Intelligence
- Wisdom
- Charisma

Depending on the sheet and configuration, Combat Assistant can use Roll20's native rolls or roll the saving throw itself.

It supports:
- Normal rolls.
- Advantage.
- Disadvantage.
- Group saving throws.
- Player-controlled saving throws.
- Saving throw damage.
- Automatic success/failure comparison against a DC.

---
## Initiative

Combat Assistant includes group initiative tools for both D&D 2014 and D&D 2024 characters.

It can:
- Roll initiative for selected tokens.
- Read initiative bonuses from character sheets.
- Handle multiple tokens at once.
- Use Roll20 native initiative rolls when appropriate.
- Roll initiative directly through Combat Assistant when configured.
- Automatically update the Roll20 Turn Order.

---
# Turn Tracker

Combat Assistant includes a complete Turn Tracker built around Roll20's Turn Order.

When combat begins, the script can automatically track:
- Current turn.
- Combat rounds.
- Tokens participating in combat.
- Player-controlled turns.
- NPC turns.
- Concentration duration.
- Movement.
- Limited resources.
- Spell slots.

Players can receive their own Turn cards while the GM retains control of the complete combat.

---
## Turn Controls

Turn cards can provide quick access to:
- **Next Turn**
- **Focus**
- **Dash**
- **Disengage**
- **Dodge**
- **Compact Sheet**
- **Combat**
- **Special Actions**
- **Spells**

The Combat and Spells buttons open information directly from the current character's sheet without requiring the player or GM to constantly open the character sheet.

---
## Round Counter

Combat Assistant can automatically count combat rounds.

The Round Counter can:
- Track when a complete round has finished.
- Display the current round.
- Show creatures participating in combat.
- Whisper the information to the GM.
- Optionally display the Round Counter publicly.

---
## Turn Marker

Combat Assistant can spawn a visual marker around the creature whose turn is currently active.

The marker can:
- Automatically move between turns.
- Follow the active token.
- Resize itself based on the token size.
- Remain GM-only.
- Optionally be visible to players.
- Use a custom Roll20-hosted image.

---
## Turn Auto Focus

When enabled, Combat Assistant can automatically ping and focus the table on the token whose turn has started.
Players can also use the Focus control during turns they control.

---
# Movement Tracker

Combat Assistant can track how far the active token moves during its turn.

The Movement Tracker can:
- Read the creature's movement speed.
- Track movement spent during the current turn.
- Detect movement across the map.
- Warn the player and GM when movement exceeds the available speed.
- Reset movement when the next turn begins.
- Increase the available movement when the creature uses **Dash**.

---
# Combat & Spell Menus

Combat Assistant can read attacks and spells directly from supported character sheets.

### Compact Sheet

```text
!ca sheet
```

Shows a token-bound character overview, including HP/AC, abilities, saving throws, skills, initiative and common actions. Players may open it for characters they control.

### Combat

```text
!ca combat
```

Displays the attacks available to the selected character.

The Combat menu can show:
- Attack name.
- Attack bonus.
- Attack type.
- Ability used.
- Range.
- Damage formula.
- Damage type.
- Saving throw DC when applicable.

Attacks can be rolled directly from the chat card.

### Special Actions

```text
!ca combat-special
```

Displays supported Bonus Actions, Reactions, Free Actions, Legendary Actions and Mythic Actions for the selected character. Options depend on the supported sheet's data.

### Spells

```text
!ca spells
```

Displays the character's available spells organized by spell level. It can use spell information to determine casting time, range, damage, healing, saving throw, area of effect, concentration, duration and spell slots.

### Prepared Spells

```text
!ca spells-prepared
```

Opens the preparation manager. It shows both prepared and unprepared entries so that preparation can be changed. **Always Prepared** or item-granted spells may have locked ON controls because their preparation status is not user-editable.

For D&D 2024, the sheet's prepared-only preference and Combat Assistant's stricter **2024 Prepared Spells Only** setting control the ordinary Spells menu, **not** this management view. Cantrips are handled differently by these two filters: the native sheet preference may include them while CA's strict filter requires the prepared state.

Spell entries backed by magic items use their native item/spell associations when available; ambiguous item origins or charges are not automatically guessed.

---
# Area of Effect Automation

Combat Assistant can detect supported area effects from spell and attack information and create movable area markers directly on the Roll20 map.

Supported area types include:
- Radius
- Sphere
- Cylinder
- Emanation
- Cube
- Square
- Cone
- Line

The player or GM can position the marker and press **Roll**. Combat Assistant then determines which tokens are inside the affected area and resolves the effect against those targets.

---
## Area Markers

Area markers can:
- Scale according to the map's configured distance.
- Detect creatures inside the area.
- Support rotated areas.
- Support movable cones and lines.
- Snap to the Roll20 grid when configured.
- Move freely when configured.
- Use custom Roll20-hosted images.
- Use configurable opacity.
- Remain on the map until all affected saving throws are resolved.

Self-centered effects can remain attached to the caster when appropriate.

---
# Concentration Tracker

Combat Assistant can automatically track concentration spells.

When a concentration spell is activated, the script can:
- Track the concentrating creature.
- Track the spell or effect.
- Track remaining duration.
- Keep persistent area markers active.
- Request Constitution saving throws when the caster takes damage.
- End the previous concentration effect when a new concentration spell begins.
- Remove associated area markers when concentration ends.

When **Concentration Turn Tracker** is enabled, finite concentration durations can also decrease automatically during combat turns and end when their duration reaches zero.

---
# Resource Manager

Combat Assistant includes a Resource Manager for limited character abilities.

It can read and display supported resources such as:
- Class resources.
- Limited-use abilities.
- Character resources.
- Spell slots.

Resources can appear directly on the creature's Turn card.

The system supports separate behavior for:
- Player characters.
- NPCs.
- GM-only resource information.
- Public or private resource usage.

Players can use or recover supported resources directly from Combat Assistant controls. Exact native identifiers are preferred for resource deductions; when a 2024 item's charge cost or spell source cannot be established safely, the script avoids an automatic deduction rather than guessing.

---
# Player Combat Controls

Combat Assistant can optionally give players more direct control over combat automation.

Depending on GM configuration, players can receive buttons for:
- Attacks.
- Healing.
- Saving throws.
- Initiative.
- Area spells.
- Combat actions.
- Spell lists.
- Resources.
- Turn controls.

The GM decides which automation features are available to players.

---
## Target Range Checking

Combat Assistant can optionally validate the distance between the acting token and its target.
When enabled, generated player actions can verify that the selected target is within the action or spell's available range before resolving it.

---
# Combat Visual Effects

Combat Assistant can use Roll20 FX to provide visual feedback when combat actions occur.

Optional effects include:
- Projectile attacks.
- Direct hits.
- Area damage.
- Healing.
- Temporary HP.
- Explosions.
- Beams.
- Cone and breath effects.
- Self-centered area effects.

Effects can use Roll20 built-in FX or compatible Custom FX. Damage types are used to select appropriate visual colors and effects where possible.

---
# NPC Combat Management

Combat Assistant also includes tools designed specifically for running groups of NPCs.

The GM can:
- Resolve attacks against player AC.
- Roll NPC saving throws.
- Roll NPC initiative.
- Access NPC Combat and Spell menus.
- View NPC limited resources.
- Track NPC turns.
- Track NPC movement.
- Remove defeated NPCs from combat automatically when configured.

---
# D&D 2014 & D&D 2024 Support

Combat Assistant supports both official Roll20 D&D sheet generations.

### D&D 2014

Combat Assistant can use traditional Roll20 character attributes and native sheet rolls for attacks, saving throws, initiative, spell preparation, resources, and other combat information.

### D&D 2024

Combat Assistant supports Roll20's newer character sheet and Beacon sheet information.
For the most complete D&D 2024 integration, particularly operations involving linked character-sheet values, the **Experimental API Sandbox** is recommended.

Combat Assistant can continue operating in compatibility mode when Beacon-specific functionality is unavailable, allowing supported 2014 functionality, unlinked token bars, and other non-Beacon systems to remain active.

---
# HP, AC & Temporary HP Bars

The GM can configure which Roll20 token bars Combat Assistant uses.

Default configuration:
- **Bar 1:** HP
- **Bar 2:** AC
- **Bar 3:** Temporary HP

These can be changed from the Combat Assistant settings.
When HP is linked to a supported character sheet, Combat Assistant attempts to safely update the corresponding sheet value. Unlinked NPCs can use token bars directly.

---
# Basic Commands

## Main Menu

```text
!ca menu
```

Opens the Combat Assistant main menu.

## Settings

```text
!ca settings
!ca config
```

Opens Combat Assistant configuration.

## Help

```text
!ca help
```

Displays command help and current configuration information.

## Manual Damage

```text
!ca deal manual <damage> <type> <DC> <ability> <half>
```

Examples:

```text
!ca deal manual 10 Fire
!ca deal manual 10 Fire 15 Dexterity yes
```

Applies 10 Fire damage, or requests a DC 15 Dexterity saving throw and applies half damage on success.

## Manual Healing

```text
!ca heal manual hp 10
!ca heal manual temp 10
```

Restores 10 HP or grants 10 Temporary HP.

## Saving Throw

```text
!ca save dexterity
```

Rolls a Dexterity saving throw for the selected token(s).

## Initiative

```text
!ca init
!ca player-init
```

`!ca init` handles GM/group initiative. `!ca player-init` is a controlled-token initiative shortcut for players where enabled.

## Character, Combat and Spells

```text
!ca sheet
!ca combat
!ca combat-special
!ca spells
!ca spells-prepared
!ca resources
```

The main menus use selected-token context. Where supported, `!ca combat <character name>`, `!ca spells <character name>`, and `!ca resources <character name>` are also available.

## Turn Tracker

```text
!ca turn
!ca turncard
!ca turnnext
!ca turnfocus
!ca turnstop yes
```

These show the active turn, a Turn Card, advance or focus the tracker, and stop the active encounter according to GM/player permissions.

---
# Command Aliases

Combat Assistant supports:

```text
!combatAssistant
!combat-assistant
!ca
```

The shorter `!ca` alias is recommended for normal use.

---
# Configuration

Combat Assistant includes configuration sections for:
- Main combat automation.
- Players.
- Area effects.
- Visual effects.
- Turn Tracker.
- Resources.
- Advanced/debug options.

Most features can be individually enabled or disabled, allowing the GM to decide how much automation Combat Assistant should perform. Some options apply only to one character-sheet generation; consult the option description in `!ca settings`.

---
# Known Limitations and Upgrade Notes

- **Magic Missile timing:** The 1-second inactivity window for native 2024 projectile batches reduces the final wait but can split a cast when Roll20 takes more than one second between darts. Test with 3, 4, and 5 projectiles, particularly when upcast.
- **Ambiguous casts:** Automatic spell-slot or item-charge deductions are intentionally skipped when cast source, cost, or level cannot be verified. Review the GM warning and adjust resources manually if necessary.
- **Beacon updates:** Sheet-worker timing and Experimental API Sandbox differences may affect linked 2024 resources. Always test upgrades in a copy of your game.
- **Permissions:** Player controls are restricted to supported characters and tokens the player controls; GM-only settings and actions remain GM-only.
- **One-Click upgrades:** Earlier published versions should be preserved in the Roll20 repository. The persistent state schema stays at version 7. Changing script versions is not a campaign-state backup.

---
# Trinkets & Trackers

Combat Assistant is part of the **Trinkets & Trackers** project.

Combat Assistant focuses specifically on combat automation, while Trinkets & Trackers expands the system into inventory management, items, shops, crafting, resources, token management, campaign tools, and other gameplay systems.

---
## Links

For updates, development information, and other Trinkets & Trackers projects:

- [Combat Assistant — Roll20 Forum](https://app.roll20.net/forum/post/12797865/script-combat-assistant-animated-combat-automated-attacks-and-spells-aoe-concentration-track-damage-and-healing-d-and-d-2014-slash-2024)
- [AmadeusVF on Patreon](https://www.patreon.com/cw/AmadeusVF/home)

### Final recommended/recipient update (v1.2.16)

The **Recommended** button is on the main Settings page next to Default. Confirm Yes to apply only the boolean values of the provided preset; all non-boolean settings, macros and spell templates are preserved. The supplied preset intentionally disables the optional resource and movement blocking flags.

The player resource gate and GM one-use healing controls are independent. When blocked, a player never receives a Heal/Temp HP targeting button, but a healing roll from a CA-generated action can still show a read-only result. The GM receives a dedicated one-use Heal/Temp HP control alongside the existing GM card. A legitimate final-slot cast remains usable once.

The project includes a new focused regression test, bringing the total to **17 suites**. Validate with actual Roll20 chat and native 2014/2024 sheets before submitting the PR.
