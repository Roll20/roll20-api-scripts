# Ping Buddy

Ping Buddy moves players' views to tokens, map pins and other places on the map: from chat commands, from menus, and automatically when certain tokens move. Players can also have their view follow their own tokens.

A full help handout, "Help: Ping Buddy", is created when the script starts. Run `!ping --help` for links to it.

## Commands

Each command pulls everyone on the page to its target, with the ping circle. Add `--solo` to pull only yourself.

| Command | Does |
|---|---|
| `!ping` | Pulls to the center of the selected objects. With nothing selected, opens your menu. |
| `!ping --me` | Your first token on your current page. |
| `!ping --me Name` | A token by name. Players find only tokens they control; the GM finds any token on any layer. The name can also go at the end, after `--solo`. |
| `!ping --pin Name` | A map pin, by its title. Players find only pins shown to them. |
| `!ping --inparty` | The center of the party members' tokens, or the Party token if there are none. |
| `!ping --turn` | The token at the top of the turn order (GM only). |
| `!ping --ids TokenID` | A specific token. A comma-separated list cycles through the tokens, one per use. |
| `!ping --menu` | The GM's button menu, or a player's list of their tokens with Follow settings. |
| `!ping --page` | The named tokens on this page, party members first (GM only). |
| `!ping --players` | Each player's Follow settings (GM only). |
| `!ping --follow seen\|unseen\|off` | Sets Follow on the selected tokens, or on the tokens listed with `--ids`. |
| `!ping --followall seen\|unseen\|off` | Sets Follow all for yourself. The GM adds `--ids PlayerID` to set it for players. |
| `!ping --followturn seen\|unseen\|off --to everyone\|controller` | Follow the turn order (GM only). With no value, shows the settings. |
| `!ping --help` | Help links. When the GM runs it, the help handout is rebuilt. |

Seen means the ping circle is shown; Unseen means it isn't. Either way, the view moves to the target.

When objects are selected, Ping Buddy pulls to the middle of the area they cover, so a cluster of tokens does not outweigh one far away.

## Tokens That Pull

A token can pull people to it whenever it moves, whoever moves it. Put one of these codes in its tooltip, in brackets, anywhere in the text, for example `Caravan [party]`.

| Code | Players on the page | The token's controller | GM viewing the page |
|---|---|---|---|
| `[party]` or `[pingallunseen]` | Pulled, unseen | (same as players) | Pulled, seen |
| `[pingallseen]` | Pulled, seen | (same as players) | Pulled, seen |
| `[pingmeseen]` | Not affected | Pulled, seen | Not pulled by Ping Buddy |
| `[pingmeunseen]` | Not affected | Pulled, unseen | Not pulled by Ping Buddy |

A token named `Party` works like `[party]`. The Party token can sit on the GM layer, and an invisible token lets you move everyone's view anywhere on the map. When the player ribbon moves to a page, players are pulled to that page's Party token.

## Following

Players can have their view follow their tokens from their menu (`!ping --menu`):

- **Follow**, on each token: when that token moves, your view moves with it.
- **Follow all my tokens**: the same for every token whose character you control, on every page.

The GM can set these for any player from the Players list or the page list, or use Follow selected on the GM menu.

## Follow the Turn

When the turn order advances, Ping Buddy can pull to the token whose turn it is: everyone on the page, or only the token's controller. It is off by default. If TurnMarker1, Combat Master, Combat Assistant or CombatTracker is installed, Ping Buddy asks you to confirm before turning it on, since those scripts usually do this already.

## Unseen Pulls

For an unseen pull, each player gets a ping sent as themselves and shown only to them; Roll20 does not draw the ping circle for a player's own ping. A GM always sees the circle for a ping sent to them, so a GM can only get a seen pull.

## For Script Authors

Other scripts can call `PingBuddy.pull(target, playerIds, options)`. The target is a token or other object, or `{ left, top, pageid }`. Leave out `playerIds` to pull everyone on the page, or pass one player ID or an array. Pass `{ unseen: true }` to pull without the ping circle. It returns true if a ping was sent.

## Older Forms

These still work, so existing games and macros keep working:

| Older form | Current form |
|---|---|
| `!pingme` | `!ping --me` |
| `!pingme Name` | `!ping --me Name` |
| `[ping]` | `[pingallseen]` |
| `[pingme]` | `[pingmeseen]` |
| `[pingmesilent]` | `[pingmeunseen]` |
| A tooltip that is only a code word, such as `party` | The code in brackets, such as `[party]` |

## Credits

By Keith Curtis. The page start function is adapted from a script by Nick Olivo.
