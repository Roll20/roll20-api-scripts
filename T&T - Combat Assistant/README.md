# T&T - Combat Assistant

**Author:** [AmadeusVF](https://app.roll20.net/users/15900768/amadeusvf)  
**Version:** 1.2.8  
**System:** Dungeons & Dragons 5E — Roll20 D&D 2014 & D&D 2024

Combat Assistant is a Roll20 Mod script designed to automate combat bookkeeping while keeping the GM in control.

It reads attacks, damage, healing, saving throws, initiative, spells, resources, and other information directly from supported Roll20 D&D character sheets and turns that information into interactive combat tools.

Instead of replacing Roll20's normal combat system, Combat Assistant works around it: players can continue rolling from their character sheets while the script handles many of the repetitive tasks that normally follow those rolls.

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
- **Combat**
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

### Spells

```text
!ca spells
```

Displays the character's available spells organized by spell level.

Combat Assistant can use spell information to determine:

- Casting time.
- Range.
- Damage.
- Healing.
- Saving throw.
- Area of effect.
- Concentration.
- Duration.
- Spell slots.
- Other combat-relevant information.

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

The player or GM can position the marker and press **Roll**.

Combat Assistant then determines which tokens are inside the affected area and resolves the effect against those targets.

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

Players can use or recover supported resources directly from Combat Assistant controls.

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

Effects can use Roll20 built-in FX or compatible Custom FX.

Damage types are used to select appropriate visual colors and effects where possible.

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

Combat Assistant can use traditional Roll20 character attributes and native sheet rolls for attacks, saving throws, initiative, resources, and other combat information.

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

When HP is linked to a supported character sheet, Combat Assistant attempts to safely update the corresponding sheet value.

Unlinked NPCs can use token bars directly.

---

# Basic Commands

## Main Menu

```text
!ca menu
```

Opens the Combat Assistant main menu.

---

## Settings

```text
!ca settings
```

or

```text
!ca config
```

Opens Combat Assistant configuration.

---

## Help

```text
!ca help
```

Displays command help and current configuration information.

---

## Manual Damage

```text
!ca deal manual <damage> <type> <DC> <ability> <half>
```

Example:

```text
!ca deal manual 10 Fire
```

Applies 10 Fire damage.

Example:

```text
!ca deal manual 10 Fire 15 Dexterity yes
```

Requests a DC 15 Dexterity saving throw and applies half damage on success.

---

## Manual Healing

```text
!ca heal manual hp <value>
```

Example:

```text
!ca heal manual hp 10
```

Restores 10 HP.

Temporary HP:

```text
!ca heal manual temp 10
```

---

## Saving Throw

```text
!ca save <ability>
```

Example:

```text
!ca save dexterity
```

---

## Initiative

```text
!ca init
```

Rolls initiative for the selected token or tokens.

---

## Combat Menu

```text
!ca combat
```

Shows the selected character's available attacks.

You can also specify a character sheet:

```text
!ca combat <character name>
```

---

## Spell Menu

```text
!ca spells
```

Shows the selected character's spells.

You can also specify a character sheet:

```text
!ca spells <character name>
```

---

## Resources

```text
!ca resources
```

Shows resources and spell slots for the selected character.

You can also specify a character sheet:

```text
!ca resources <character name>
```

---

## Turn Tracker

Show the current turn:

```text
!ca turn
```

Advance to the next turn:

```text
!ca turnnext
```

Focus on the current creature:

```text
!ca turnfocus
```

Stop the active combat:

```text
!ca turnstop yes
```

---

# Command Aliases

Combat Assistant supports:

```text
!combatAssistant
```

```text
!combat-assistant
```

```text
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

Most features can be individually enabled or disabled, allowing the GM to decide how much automation Combat Assistant should perform.

---

# Trinkets & Trackers

Combat Assistant is part of the **Trinkets & Trackers** project.

Combat Assistant focuses specifically on combat automation, while Trinkets & Trackers expands the system into inventory management, items, shops, crafting, resources, token management, campaign tools, and other gameplay systems.

---

## Links

For updates, development information, and other Trinkets & Trackers projects:

[AmadeusVF on Patreon](https://www.patreon.com/cw/AmadeusVF/home)