# Concentration

Concentration keeps track of who is concentrating on which spell in D&D 5e games. It puts a marker on the caster's token, rolls (or asks for) a Constitution save when that token takes damage, and tells the table when concentration starts, switches to a new spell, or ends.

Version 1.1 brings the Mod up to date: new chat cards, end-of-concentration messages, spell switching, Help and Command Deck handouts, and 24 languages. Version 1.0 settings, macros and commands keep working.

## Installation

Install **Concentration** from the Roll20 Mod Library (One-Click), or paste `Concentration.js` into a new Mod script. On startup the GM gets a short welcome whisper, and two GM-only handouts are created in the Journal:

- **Concentration - Help**: full instructions.
- **Concentration - Command Deck**: buttons for every action.

## Quick Start

1. Select the caster's token and type `!concentration Bless` (any spell name). The marker goes on and everyone is told.
2. Change the token's hit points in its bar bubble (for example `-7`). A Constitution save is rolled at DC 10, or half the damage if that is higher.
3. Run `!concentration` again, use `!concentration end`, or take the marker off, to end concentration.
4. Type `!concentration` with nothing selected to open the settings.

## Concentrating

- Naming a different spell switches concentration to it, as casting a new concentration spell does: `!concentration Hold Person` while concentrating on Web.
- Putting the marker on a token by hand starts concentration without a spell; taking it off ends it. Deleting a concentrating token (or a character's last token) ends it too.
- A new linked token of a concentrating character gets the marker, and a pasted token that carries the marker is tracked.
- Every change is announced: "Atala Dumein is now concentrating on Web.", "… stops concentrating on Web and is now concentrating on Hold Person.", "… is no longer concentrating on Hold Person."
- Tokens of one character with a linked hit point bar (player characters, named NPCs) share concentration, on every page. Unlinked tokens, such as a pack of goblins from one sheet, each concentrate on their own.

## Concentration Saves

- The DC is 10 or half the damage taken, whichever is higher, up to DC 30.
- The modifier is the **Bonus Attribute** (`constitution_save_mod` by default) from the character's sheet. D&D 2024 sheets are read with `getSheetItem`, others with `getAttrByName`; a missing or non-numeric value counts as 0.
- With **Auto Roll Save** on, the save is rolled at once and the card says whether concentration was kept or lost. With it off, a reminder with **Roll** and **Advantage** buttons is sent instead; each button works once, for 10 minutes, for the GM or the token's players.
- A failed save ends concentration. With **End at 0 HP** on, dropping to 0 hit points ends it without a save.
- The **Advantage Menu** gives a character advantage on automatic saves, as the War Caster feat does.

Only changes made in Roll20 itself (bar bubbles, the token settings, sheet changes on linked bars) are seen. Changes other Mods make through the API raise no events.

## Spells Cast from a Sheet

With **Auto Add Con. Marker** on, casting a concentration spell from a sheet adds the marker:

- **D&D 5e 2014 (OGL)**: the `spell` roll template with concentration ticked.
- **D&D 2024 (Beacon)**: spell cards (`advancedroll` messages) marked as concentration. These may need the Experimental API server.

The caster's tokens on the page they are viewing are marked; if there are none, tokens on any page are. Only cards posted by the GM, another Mod or one of the character's players count. Casting the same spell again (Moonbeam's damage card each round, say) changes nothing. A D&D 2024 card that only mentions concentration in its text, such as the War Caster feat, can start concentration but never replaces a spell. If a spell is not detected, turn on **Debug Mode**, cast it again and read the API console: each line starts with `[Concentration v1.1.0]` and says why the card did or did not match.

## Commands

| Command                                  | Who            | What it does                                                                             |
| ---------------------------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| `!concentration`                         | GM             | With nothing selected: open the settings.                                                |
| `!concentration [<spell>]`               | GM and players | With tokens selected: start concentrating (on the spell), switch to a new spell, or end. |
| `!concentration end [<id>]`              | GM and players | End concentration for the selected tokens (or, for the GM, a character or token ID).     |
| `!concentration status`                  | GM             | List who is concentrating, with End buttons.                                             |
| `!concentration config [<key>\|<value>]` | GM             | Change a setting (`config <key> <value>` works too).                                     |
| `!concentration advantage-menu`          | GM             | Choose which characters roll saves with advantage.                                       |
| `!concentration toggle-advantage <id>`   | GM             | Switch advantage for one character.                                                      |
| `!concentration roll <id>`               | GM and players | Used by the reminder's Roll button.                                                      |
| `!concentration advantage <id>`          | GM and players | Used by the reminder's Advantage button.                                                 |
| `!concentration journal`                 | GM             | Rebuild the Help and Command Deck handouts.                                              |
| `!concentration reset`                   | GM             | Put every setting back to its default (asks first).                                      |
| `!concentration help`                    | GM and players | Show the command list.                                                                   |

Players can only change tokens they control. Commands sent by other Mods (such as ScriptCards) are treated as the GM's.

## Settings

Change settings with the buttons in the settings card, or with `!concentration config <key>|<value>`. Those marked ✓ can also be set on the Mod's page in the API Scripts screen.

| Key                             | Name                 | Default                 | What it does                                                                        | Mod page |
| ------------------------------- | -------------------- | ----------------------- | ----------------------------------------------------------------------------------- | -------- |
| `language`                      | Language             | `en-US`                 | Language of chat messages and handouts.                                             | ✓        |
| `command`                       | Command              | `concentration`         | The chat command, without the `!`.                                                  | ✓        |
| `statusmarker`                  | Status Marker        | `stopwatch`             | The marker that shows concentration. Custom token markers work (`Name::id`).        | ✓        |
| `bar`                           | HP Bar               | `1`                     | The bar that holds hit points.                                                      | ✓        |
| `send_reminder_to`              | Send Reminder To     | `everyone`              | `everyone`, `gm`, or `character` (whispered to its players, with a copy to the GM). | ✓        |
| `auto_add_concentration_marker` | Auto Add Con. Marker | `true`                  | Add the marker when a concentration spell is cast from a sheet.                     | ✓        |
| `auto_roll_save`                | Auto Roll Save       | `true`                  | Roll saves at once; when off, reminders have Roll and Advantage buttons.            | ✓        |
| `show_roll_button`              | Roll Button          | `true`                  | Add the Roll and Advantage buttons when Auto Roll Save is off.                      |          |
| `end_at_zero`                   | End at 0 HP          | `true`                  | End concentration without a save at 0 hit points.                                   | ✓        |
| `bonus_attribute`               | Bonus Attribute      | `constitution_save_mod` | The sheet attribute added to saves.                                                 | ✓        |
| `debug`                         | Debug Mode           | `false`                 | Write detection and save notes to the API console.                                  |          |
| `support_mode`                  | Support Mode         | `basic`                 | How much Debug Mode writes: `basic` or `detailed`.                                  |          |

Changing the Status Marker moves the marker on every concentrating token. Changing the HP Bar takes effect at once; no restart is needed.

## Working with Other Mods

Other Mods can read and change concentration through `globalThis.Concentration`:

```js
Concentration.isConcentrating(tokenId); // true or false
Concentration.spellOf(tokenId); // 'Web', '' (no spell named) or null (not concentrating)
Concentration.start(tokenId, 'Bless'); // start or switch
Concentration.end(tokenId); // end, with the usual message
Concentration.list(); // [{ key, name, spell, since }]
```

## Languages

Concentration is translated into 24 languages: Afrikaans, Catalan, Chinese (Traditional), Czech, Danish, Dutch, English, Finnish, French, German, Greek, Hebrew, Hungarian, Italian, Japanese, Korean, Polish, Portuguese (Brazil and Portugal), Russian, Spanish, Swedish, Turkish and Ukrainian. Choose one with the **Language** setting; the handouts are rebuilt in that language. API console notes stay in English so they can be shared on the forums.

## Upgrading from Version 1.0

- Settings, the advantage list and every command keep working, including `config <key>|<value>` macros.
- Tokens that already carry the marker are picked up on startup (without a spell name).
- The HP Bar setting no longer needs a restart.
- Roll and Advantage buttons pressed by a player no longer start or end concentration on whatever they have selected.
- The One-Click settings on the Mod's page now work; version 1.0 listed them but never read them.

## Troubleshooting

- **No save when hit points drop**: check that the token has the marker and that HP Bar is the bar you changed.
- **The modifier is 0**: check the Bonus Attribute against the character's sheet.
- **Sheet spells are not detected**: turn on Debug Mode and read the API console. D&D 2024 sheets may need the Experimental API server.
- **Two characters share a name**: detection uses the first exact match (and logs a warning in Debug Mode). Give characters unique names.

When asking for help, include the sheet (2014 or 2024), the API server (Default or Experimental), the Concentration version, the spell, and the Debug Mode lines from the API console.

## Credits

Original Mod by [Robin Kuiper](https://app.roll20.net/users/1226016/robin) ([Patreon](https://www.patreon.com/robinkuiper), [GitHub](https://github.com/RobinKuiper/Roll20APIScripts)).

Maintained by Steve Roberts ([MidNiteShadow7](https://app.roll20.net/users/16506286/midniteshadow7)).

## License

MIT, as in the Roll20 API scripts repository.
