# InspirationTracker

A Roll20 Mod that keeps inspiration on the character sheet, the token and the chat in step: D&D's Inspiration and Heroic Inspiration, or a pool of points for any game, such as inspiration points, hero points, luck or bennies.

**Version 1.0.0 is a rewrite that works with the D&D 2024 sheet**, where inspiration is called Heroic Inspiration, as well as the 2014 OGL sheet. Version 0.1.4 could not see the 2024 sheet at all. Your marker, special effect and command name from 0.1.x are kept.

## Installation

1. Install **InspirationTracker** from the Roll20 One-Click library, or upload `InspirationTracker.js` to the game's API Scripts.
2. Save. On startup the Mod reads every character sheet once, puts the marker on the tokens of characters that have inspiration, and creates two GM-only handouts in the Journal:
   - **InspirationTracker - Help**: full instructions.
   - **InspirationTracker - Command Deck**: one-click buttons for every action.

## Quick Start

1. Type `!inspiration` for the menu, or open the Command Deck.
2. Select a token and click **Give**. The character gains inspiration, every token for that character shows the marker, and the chat says so.
3. Click **Player Macro** once. Players then get an **Inspiration** token action to spend it.
4. Click **Party** to see who has inspiration.

## Character Sheets

| Sheet                               | Where inspiration is kept                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| D&D Fifth Edition (5E & 5.5E, 2024) | The Heroic Inspiration box, read and written with `getSheetItem`/`setSheetItem` |
| D&D 5E by Roll20 (2014 OGL)         | The Inspiration box, attribute `inspiration`                                    |

- Ticking or clearing the box on a sheet is noticed straight away. The marker follows, and clearing it counts as spending it, so the GM can undo it.
- With **Wording** set to **From the sheet**, each D&D 2024 character uses the rules chosen in its sheet settings: 2024 rules say Heroic Inspiration, 2014 rules say Inspiration. The 2014 OGL sheet always says Inspiration. The GM can force either wording.
- Characters with neither sheet are left alone.

## Players

- Players can spend inspiration for characters they control: click **Spend** on the chat message, or the **Inspiration** token action (`!inspiration macro` adds it).
- The GM gets a whisper saying who spent it, with an **Undo** button.
- `!inspiration` shows a player their characters and whether they have inspiration.
- Turn **Players Can Spend** off to keep spending in the GM's hands.

## Passing It On (2024 Rules)

A character cannot have Heroic Inspiration twice. When one who has it would gain it again, their players get a whisper asking which party member who does not have it should get it instead, or whether to let it go. The choice lasts an hour and can be used once. Under the 2014 rules, the GM is told that the character already has Inspiration. Turn **Pass On** off to always get that message.

## The Party

The party is every character a player controls. Select tokens and click **Add to Party** or **Remove from Party** to change it, for example to add a sidekick the GM runs. `!inspiration party` shows the GM each member with **Give**, **Remove** and **Spend** buttons. Turn **Players See Party** on to let players see the overview too; they only get **Spend** buttons for their own characters.

## Points Pools

Some tables award inspiration as points that build up and are spent a few at a time, and other games have hero points, luck, bennies and the like. A points pool tracks a number like that, on any character sheet.

- Set **Tracking** to **Points pool**. **Give**, **Remove** and **Spend** then work on the default pool, called Inspiration, and ask how many points. The marker shows while a character has any points.
- **Boost** spends points to raise a roll. Type the bonus wanted, and the pool's **Points per +1** decides the cost: at 2 points per +1, a bonus of 4 costs 8 points. The Mod announces the spend with the old and new totals; add the bonus to the roll yourself.
- A spend is refused when the character does not have enough points. The GM is told who spent what, with an **Undo** button.
- Players see their points with `!inspiration`, with **Spend** and **Boost** buttons for their own characters.
- Changing the number on the sheet by hand is fine: the marker follows.

### Where the points are kept

| Kept in                | Where                                                                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sheet resource box** | The resource box on the sheet that has the pool's name: on the D&D 5E by Roll20 (2014 OGL) sheet, a Class Resource, Other Resource or added resource box named Inspiration. |
| **Attribute**          | A plain attribute named after the pool, such as `inspiration_pool`. It works on any sheet, and can be linked to a token bar.                                                |

With **Sheet resource box**, a character whose sheet has no box with that name uses the attribute instead. The D&D 2024 sheet keeps its resources where a Mod cannot change them, so its characters always use the attribute.

### More pools

Click **Pools** (`!inspiration pools`) to rename the default pool, set its cost and maximum, or add more pools, each with its own name, cost, maximum and token marker. Other pools are used from their **Party** button, or by adding `--pool <name>` to a command: `!inspiration give 2 --pool "Hero Points"`. They work whatever Tracking is set to, so a game can use the D&D inspiration box and a pool of luck side by side.

## Token Markers

- Choose the marker with the **Marker** setting. Roll20's coloured dots, the default markers and the game's custom marker sets are all listed. Custom markers are stored by their tag (for example `Heroic::12345`), so renaming a marker image does not break them.
- Adding the marker to a token by hand, or with TokenMod, gives the character inspiration; taking it off spends it.
- Changing the marker setting moves the marker on every token straight away.
- The D&D 2024 sheet's own condition markers are not offered, because the sheet sets them itself.

## Commands

Every command starts with `!inspiration`. Commands act on the selected tokens, or on the token or character IDs given with `--ids <id;id;…>`.

| Command                                        | What it does                                                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `!inspiration`                                 | The menu. With tokens selected, gives or takes away inspiration, as version 0.1 did.                       |
| `!inspiration give`                            | Gives inspiration.                                                                                         |
| `!inspiration remove`                          | Takes inspiration away, without counting it as spent.                                                      |
| `!inspiration toggle`                          | Gives it to characters without it, and takes it from those with it.                                        |
| `!inspiration spend`                           | Spends it and tells the GM. Players can use this for their own characters.                                 |
| `!inspiration party`                           | The party overview.                                                                                        |
| `!inspiration party add / remove`              | Adds the selected characters to the party, or takes them out.                                              |
| `!inspiration undo <id>`                       | Gives back spent inspiration. The ID comes from the GM's whisper about the spend.                          |
| `!inspiration give / remove / spend <points>`  | With a points pool: that many points (1 when left out). `remove all` takes every point.                    |
| `!inspiration boost <bonus>`                   | With a points pool: spends points for that bonus to a roll, at the pool's cost per +1.                     |
| `… --pool <name>`                              | Works on the named pool instead of the default one (give, remove, spend, boost, party).                    |
| `!inspiration pools`                           | The points pools and their settings.                                                                       |
| `!inspiration pool add <name>`                 | Adds a pool. `pool delete <name>` deletes one; the points on the sheets are left alone.                    |
| `!inspiration pool set <name> <field> <value>` | Changes a pool's `name`, `source` (`resource` or `attribute`), `cost`, `max` (0 for no limit) or `marker`. |
| `!inspiration macro`                           | Adds the **Inspiration** token action for players.                                                         |
| `!inspiration sync`                            | Reads every sheet again and puts the markers right.                                                        |
| `!inspiration set [<key> <value>]`             | Shows the settings, or changes one.                                                                        |
| `!inspiration reset`                           | Puts every setting back to its default, except the language.                                               |
| `!inspiration status`                          | The version, the sheets found and the main settings.                                                       |
| `!inspiration journal rebuild`                 | Rebuilds the Help and Command Deck handouts.                                                               |
| `!inspiration help`                            | The command list.                                                                                          |

Players can use `!inspiration`, `spend`, `boost`, `party` and `help`.

## Settings

| Setting          | Default      | What it does                                                                                      |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------------- |
| `language`       | `en-US`      | Language for menus, messages and handouts (24 languages).                                         |
| `tracking`       | `flag`       | `flag` uses the inspiration box on the D&D sheets; `pool` uses the default points pool.           |
| `marker`         | `black-flag` | Token marker shown while a character has inspiration.                                             |
| `wording`        | `auto`       | `auto` follows each sheet; `2014` always says Inspiration; `2024` always says Heroic Inspiration. |
| `announce`       | `public`     | Who sees gains and spends: `public`, `gm` (the GM and the character's players) or `off`.          |
| `fx`             | `on`         | Play a special effect on the token when it gains inspiration.                                     |
| `fxType`         | `nova-holy`  | The effect, such as `burst-holy`, or the ID of a custom effect.                                   |
| `playerSpend`    | `on`         | Let players spend inspiration for characters they control.                                        |
| `playerOverview` | `off`        | Let players see the party overview.                                                               |
| `passOn`         | `on`         | Under the 2024 rules, offer to pass on Heroic Inspiration a character cannot hold twice.          |

`language`, `wording` and `playerOverview` can also be set on the Mod's One-Click settings.

## Working with Other Mods

Other Mods, such as ScriptCards, can send any of the commands above. They can also call:

```js
await InspirationTracker.isInspired(characterOrTokenId); // true or false
await InspirationTracker.give(id); // 'given', 'already', 'offered', 'failed' or 'unknown'
await InspirationTracker.spend(id); // 'spent', 'none', 'failed' or 'unknown'
await InspirationTracker.remove(id); // 'removed', 'none', 'failed' or 'unknown'
InspirationTracker.ObserveTokenChange((token, prev) => {}); // called when it changes a token's markers
InspirationTracker.points(id, 'Hero Points'); // a character's points; the default pool when no pool is named
await InspirationTracker.givePoints(id, 2, 'Hero Points'); // 'given', 'full' or 'unknown'
await InspirationTracker.spendPoints(id, 2, 'Hero Points'); // 'spent', 'short', 'poolNone' or 'unknown'
```

InspirationTracker registers with TokenMod's `ObserveTokenChange`, so adding the marker with TokenMod gives inspiration.

## Upgrading from 0.1.x

- The marker, the special effect and its type are kept.
- If you chose your own command name in 0.1.x, it still works as well as `!inspiration`.
- `!inspiration` with tokens selected still gives or takes away inspiration.
- The old settings in `state.INSPIRATIONTRACKER` are left in place, so going back to 0.1.4 still works.

## Credits

- Original Mod by [Robin Kuiper](https://app.roll20.net/users/1226016/robin) ([Patreon](https://www.patreon.com/robinkuiper)).
- Version 1 by [MidNiteShadow7](https://app.roll20.net/users/16506286/midniteshadow7) ([GitHub](https://github.com/steverobertsuk)).

Report bugs and ideas on the Roll20 Mod forum or on GitHub.
