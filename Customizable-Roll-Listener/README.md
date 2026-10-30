# Customizable Roll Listener

Run chat commands automatically when a matching roll or message appears in chat. Play a sound on a critical hit, roll on a fumble table on a natural 1, post a reminder when a character uses a certain attack, react to a rollable table result, and so on.

- **Version:** 2.0.0
- **Authors:** Scott C. (original), The Aaron (version 1.1 fixes), MidNiteShadow7 (version 2)
- **Dependencies:** none
- **Command:** `!crl` (GM only)

Version 2 is a full rewrite. It reads roll templates, plain chat, emotes, `/roll` results, rollable table results and the output of other mods, and comes with an inspector that shows exactly what a message contains. Version 1 listeners are upgraded automatically, and the version 1 `!crl \\create` style commands still work.

## Quick Start

1. Install the mod and type `!crl` in chat, or open the **Customizable Roll Listener - Command Deck** handout.
2. Click **New Listener** and give it a name, such as `Crit Sound`.
3. Click **Change** next to **Roll result** and choose **Critical**.
4. Click **Set Commands** and enter what to run, for example `!roll20AM --audio,play|Crit`.
5. Click **Test** to check the commands, then roll an attack. If nothing happens, click **Inspect Next Message** and roll again to see why.

The same listener in one line:

```
!crl new Crit Sound --results crit --commands !roll20AM --audio,play|Crit
```

## Examples

```
!crl new Fumble --natural 1 --commands /em fumbles! \\ /roll 1t[Fumbles]
!crl new Ambush --text Combat --commands !roll20AM --audio,play|Battle
!crl new Alice Crits --who Alice --results crit --speaker roller --commands /em grins wickedly
!crl new Big Hit --templates atkdmg --text dmg1=## --total >=20 --commands /desc ${character} hits for ${total}!
!crl new Narrator --results crit fumble --commands /desc ${who} rolled a ${result} on ${expression}
```

## What a Listener Checks

A listener triggers when **every** filter it has matches. Empty filters match everything.

| Filter                | Option        | Matches when…                                                                                                                                                             |
| --------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Roll templates        | `--templates` | The message uses one of these templates (`none` = no template). See [Roll Template Names](#roll-template-names).                                                          |
| Message types         | `--types`     | The message is one of: `general`, `rollresult`, `gmrollresult`, `emote`, `whisper`, `desc`, `advancedroll` (Beacon), `api`. Empty means every type except `api` commands. |
| Text                  | `--text`      | Every piece of text (separated by `&&`) appears. Case is ignored. Roll totals and rollable table results count as text. `##` stands for an inline roll.                   |
| Text mode             | `--regex`     | `on` reads the text as regular expressions.                                                                                                                               |
| Speakers / characters | `--who`       | The name shown in chat, or the character name in the roll template, is listed (comma separated).                                                                          |
| Players               | `--players`   | The sending player's display name is listed (comma separated).                                                                                                            |
| Roll result           | `--results`   | `crit` (highest face or `cs` range), `fumble` (a 1 or `cf` range), `success` (a die meets a target such as `1d20>15`), `fail` (a target roll with no successes).          |
| Roll total            | `--total`     | A roll's total meets `15`, `>=15`, `<5` or `19-20`.                                                                                                                       |
| Natural die           | `--natural`   | A die landed on `20`, `<=2`, `19-20` and so on.                                                                                                                           |
| Dice checked          | `--dice`      | `auto` (only d20s when a d20 was rolled, so damage dice do not count as crits), `any`, or a size such as `20` or `d100`.                                                  |

Roll checks look at every roll in the message, or only the rolls a `##` in the text found. Dropped dice (advantage and disadvantage) and rerolled dice are ignored. A listener triggers when at least one roll meets every roll check.

The D&D 5E by Roll20 (2014) sheet rolls advantage and disadvantage as two separate d20 rolls (`r1` and `r2`) instead of keeping one, so CRL cannot tell which one counts and checks both. With advantage, a 1 on the lower die still counts as a fumble; with disadvantage, a 20 on the higher die still counts as a crit.

## Roll Template Names

A roll template is the layout a character sheet uses for its roll cards. Its name is the part after `template:` in a macro, so `&{template:atkdmg}` uses the `atkdmg` template. Each sheet has its own templates, so `--templates` takes whatever names your game's sheet uses.

To find a name:

1. **Use the inspector.** Type `!crl inspect` (or click **Inspect Next Message**), make the roll from the sheet, and read the **Roll template** line CRL whispers back. This works for every sheet, including Beacon sheets.
2. **Read the macro.** A sheet button or macro that starts `&{template:NAME}` uses the `NAME` template.
3. **Read the sheet's source.** Community sheets are in the [Roll20 character sheets repository](https://github.com/Roll20/roll20-character-sheets), where each template is a `<rolltemplate class="sheet-rolltemplate-NAME">`.

Templates of common sheets:

| Sheet                       | Template names                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| Any game (built in)         | `default`                                                                                        |
| D&D 5E by Roll20 (2014)     | `simple`, `atk`, `dmg`, `atkdmg`, `spell`, `desc`, `npcaction`, `npcfullatk`, `npcatk`, `npcdmg` |
| D&D 2024 by Roll20 (Beacon) | `dnd-2024` (see [Beacon Sheets](#beacon-sheets-dd-2024-and-others) for its fields)               |

More about roll templates:

- [How to Make Roll Templates](https://help.roll20.net/hc/en-us/articles/360037257334-How-to-Make-Roll-Templates) (Roll20 Help Center): the built-in `default` template and how sheets define theirs.
- [D&D 5e OGL Roll Templates](https://help.roll20.net/hc/en-us/articles/360037257834-D-D-5e-OGL-Roll-Templates) (Roll20 Help Center): the D&D 5E by Roll20 (2014) templates and their fields, useful for `${field:name}`. NPC attacks use `npcfullatk`, which the article does not list.
- [Roll20 character sheets repository](https://github.com/Roll20/roll20-character-sheets): the source of community sheets and their templates.

## Other Options

| Option       | Meaning                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| `--cooldown` | Seconds before the listener can trigger again.                              |
| `--stop`     | `on` stops later listeners from triggering on the same message.             |
| `--speaker`  | Send commands as `crl`, as the `roller`, or use the `default` setting.      |
| `--enabled`  | `on` or `off`.                                                              |
| `--name`     | Rename the listener.                                                        |
| `--commands` | The commands to run, with lines separated by `\\`. Must be the last option. |

Leave a value empty, or use `-`, to clear it.

## Placeholders

These are replaced in a listener's commands when it triggers:

| Placeholder     | Replaced with                                                   |
| --------------- | --------------------------------------------------------------- |
| `${who}`        | The name shown in chat.                                         |
| `${character}`  | The character name from the roll template, or the name in chat. |
| `${player}`     | The player's display name.                                      |
| `${template}`   | The roll template name.                                         |
| `${total}`      | The total of the roll that matched (or the first roll).         |
| `${natural}`    | The natural d20 (or first die) of that roll.                    |
| `${result}`     | `crit`, `fumble`, `success` or `fail`, when one was asked for.  |
| `${expression}` | The roll expression, such as `1d20+5`.                          |
| `${table}`      | Rollable table results of that roll.                            |
| `${listener}`   | The listener's name.                                            |
| `${field:name}` | A roll template field, such as `${field:rname}`.                |

## Commands

| Command                                 | What it does                                                        |
| --------------------------------------- | ------------------------------------------------------------------- |
| `!crl`                                  | List the listeners.                                                 |
| `!crl new <name> [--option value …]`    | Make a listener.                                                    |
| `!crl show <name>`                      | Show a listener with buttons to change each setting.                |
| `!crl edit <name> --option value …`     | Change a listener.                                                  |
| `!crl enable <name>` / `disable <name>` | Turn a listener on or off.                                          |
| `!crl up <name>` / `down <name>`        | Change the order listeners are checked in.                          |
| `!crl test <name>`                      | Run a listener's commands now, as if a natural 20 had been rolled.  |
| `!crl delete <name>`                    | Delete a listener (asks first).                                     |
| `!crl inspect` / `inspect off`          | Explain the next chat message and which listeners it would trigger. |
| `!crl on` / `off`                       | Turn all listening on or off.                                       |
| `!crl config [setting value]`           | Show or change the settings.                                        |
| `!crl journal`                          | Rebuild the Help and Command Deck handouts.                         |
| `!crl help`                             | List the commands in chat.                                          |

## Settings

| Setting        | One-Click option     | Meaning                                                                                  |
| -------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `enabled`      | —                    | Listening on or off.                                                                     |
| `speaker`      | Send Commands As     | Send commands as `crl` (as version 1 did) or as the `roller`.                            |
| `listenToMods` | Listen to Other Mods | Whether chat sent by other mods can trigger listeners. CRL never reacts to its own chat. |
| `language`     | Language             | Language for menus, messages and handouts.                                               |

## How Commands Run

- Each line is sent as its own chat message, except that a `{{ … }}` block spread over several lines (a roll template or a ScriptCards script) is kept together.
- Commands can use inline rolls, roll templates, `@{Character|attribute}` and `%{Character|ability}`. `@{selected|…}` and `?{queries}` do not work, because nobody is there to answer them.
- When typed into `!crl`, Roll20 replaces `@{…}` and `%{…}` before CRL sees them. For those, edit the listener's ability in the Journal (the **Open in Journal** button). Inline rolls and roll templates typed into `!crl` are kept.
- CRL ignores its own messages. A listener that still triggers more than 20 times in 10 seconds is switched off and the GM is told.

## Where Listeners Are Kept

Each listener is an ability on the archived **Customizable Roll Listener** character, as in version 1. The ability holds the commands, so you can use the Journal's macro editor. The ability's description holds the listener's rules as JSON, which lets listeners survive copying the game (Roll20 does not copy mod state). Deleting an ability deletes its listener. An ability added by hand appears in the list switched off.

## Beacon Sheets (D&D 2024 and others)

Beacon sheets post roll cards (message type `advancedroll`) instead of roll templates. CRL reads them:

- The template is the card's first class, `dnd-2024` for the D&D 2024 sheet.
- The character comes from the card, and its title (such as `Dexterity Check`), subcategory (such as `Ability Check`) and mode become fields: `${field:title}`.
- Attacks and damage arrive as separate cards: the `subcategory` field is `Attack`, `Damage`, `Ability Check` and so on, and `action`/`args` say what was rolled (`args` ends in `dmg` for damage). With `--dice auto`, damage cards never count as crits or fumbles.
- Each roll in the card's breakdown is a roll, so `crit`, `fumble`, `--total` and `--natural` work. The total is the card's headline result.

Mods only see Beacon rolls in the newer (v1.5 / Experimental) Mod sandbox. Use `!crl inspect` to see exactly what a sheet sends.

## Upgrading from Version 1

- Listeners are converted on the first start and keep their commands.
- Text that only holds plain characters becomes plain text and now ignores case. Text using regular expression symbols stays a regular expression.
- Listeners with a roll result but no `##` used to fail with "not parseable"; they now check every roll in the message.
- `fail` now means a target roll with no successes; a roll exactly on the target counts as a success only.
- The version 1 commands (`!crl \\create`, `\\edit`, `\\delete`, `\\config`, `\\set`) still work.

## For Other Mods

```js
CRL.version; // "2.0.0"
CRL.analyse(msg); // how listeners see a chat message
CRL.matches(msg); // names of the listeners a message would trigger
CRL.onMatch(({ id, listener, message, verdict }) => {}); // called when a listener triggers
```

## Languages

Menus, messages and handouts are translated into 23 languages; choose one with `!crl config language`. The Help handout lists them. Commands, options and the values you type (such as `crit` or `on`) stay in English in every language.

## Support

Report problems on the Roll20 forums or the GitHub repository. Original mod by [Scott C.](https://app.roll20.net/users/459831); version 2 by [MidNiteShadow7](https://app.roll20.net/users/16506286/midniteshadow7) ([GitHub](https://github.com/steverobertsuk)).
