# Cohors Cthulhu Companion

Version 1.0.0 (2026-10-11), by Han Vanholder.

`CohorsCthulhuCompanion.js` is an optional companion Mod (API script) for
the Cohors Cthulhu character sheet. The sheet works without it; the script
adds:

- **Global Momentum and Threat pools**, kept up to date by every roll made
  from the sheet.
- **Token actions** for each character's weapons and spells.
- **NPC import**: characters built from NPC stat blocks written as JSON.

## Requirements

- A Roll20 **Pro** subscription for the game's creator: Mods (API scripts)
  only run in Pro games.
- A game that uses the **Cohors Cthulhu** character sheet.
- No other scripts. The NPC import can take token images from
  ModifyTokenImage's Journal folders, but it only reads them:
  ModifyTokenImage itself is optional (see "Tokens" below).

## Installing

On the game's page, open **Settings** > **Mod (API) Scripts**, then either:

- find **Cohors_Cthulhu_Companion** in the Mod Library and add it, or
- click **New Script**, paste in the whole of `CohorsCthulhuCompanion.js`,
  and click **Save Script**.

On its first start the script whispers a short note to the GM, and
`!cchelp` lists the commands (anyone can use it; players only see theirs).
Updating keeps the pools and settings.

## Configuration

The CONFIG block at the start of the script holds what you may want to
change:

| Setting | Default | Meaning |
| --- | --- | --- |
| `momentumMax` | `6` | Largest Momentum pool |
| `momentumLabel`, `threatLabel` | `Momentum Pool`, `Threat Pool` | The pools' names in chat and the Turn Order, and the names of the tokens that show them |
| `tokenImagesFolder` | `Token Images` | Journal folder the NPC import takes token images from |
| `tokenLibraryPage` | `Token Library` | Page whose named tokens the NPC import can use |
| `tokenMap` | `{}` | NPC name -> token image URL, looked up first (see "Tokens") |
| `tokenMapHandout` | `Token Map` | Handout whose GM Notes hold more of the token map, as JSON |

Everything the script keeps between sessions is in
`state.CohorsCthulhuCompanion`.

## Momentum and Threat pools

Momentum and Threat are shared, game-wide resources, so they can't live on
a character sheet: each sheet only sees its own attributes. The script
keeps both pools. Each roll from the sheet sends it a hidden signal roll
with what the roll generated and spent; without the script, those signals
do nothing and the roll cards still show the Momentum generated and spent
and the Complications.

- **Momentum** goes up by the Momentum a passed roll generates. It goes
  down by Extra Momentum spent on a spell or on removing Fatigue, and by
  extra damage dice bought on a successful attack (1 each, up to 3). The
  pool holds 0 to 6: announcements report the actual change, and Momentum
  that doesn't fit is reported as lost (e.g. "6/6 (+1, 2 lost - pool
  full)").
- **Buying additional d20s** (up to 3 on any roll) costs 1 Momentum for the
  first, 2 for the second and 3 for the third (so 2 dice cost 3 and 3 dice
  cost 6). The dice are paid first, since they're bought before the roll.
- **Spending more than the pool holds** is allowed, for bought d20s and for
  whatever a roll spends beyond the Momentum it generated (extra damage
  dice, a spell's Extra Momentum, removing Fatigue): the shortfall becomes
  an equal amount of Threat. For example, with 1 Momentum in the pool, an
  attack that generates 2 can buy 3 extra damage dice and leaves the pool
  at 0; with an empty pool and 1 generated, the same 3 dice add 2 Threat.
- **Threat** goes up by 1 for each Complication on a player character's
  roll, and by any Momentum shortfall (above).
- **Adversary NPCs** use Threat instead of Momentum: their extra successes
  add to the Threat pool, and the d20s and extra damage dice they buy are
  paid from it. Allied NPCs use Momentum like player characters.
- Neither pool drops below 0. The GM's other Threat spends are made with
  `!threat-adjust`.

Every change is announced in chat. The pools also show in two places
without opening chat:

- the **Turn Order**, as a "Momentum Pool" and a "Threat Pool" custom entry
  (no setup needed; added at the end and updated in place, so they never
  change whose turn it is). If the Turn Order is cleared, the entries come
  back the next time the GM opens it or a pool changes (`!momentum` and
  `!threat` also bring them back);
- bar 1 of any token on the players' page named **Momentum Pool** or
  **Threat Pool** (optional; the names are in CONFIG).

| Command | Who | Effect |
| --- | --- | --- |
| `!momentum` / `!threat` | anyone | Announce the pool |
| `!momentum-set N` / `!threat-set N` | GM | Set the pool to N |
| `!momentum-adjust N` / `!threat-adjust N` | GM | Add N (negative to subtract), e.g. for Threat the GM spends outside NPC rolls |

## Token actions

The script puts each character's weapons and spells in the token action
bar: select a token and click an attack, or "Cast <spell>", to roll it as
from the sheet. The token actions follow the sheet as weapons and spells
are added, renamed or deleted, and imported NPCs get them too. The script
only changes the abilities it created; your own abilities and macros are
left alone.

| Command (GM only) | Effect |
| --- | --- |
| `!cctokenactions` | Rebuild for the selected tokens' characters, or every character if none is selected |
| `!cctokenactions clear` | Remove them (selected, or every character) |
| `!cctokenactions off` / `on` | Pause or resume the automatic updates |

## Importing NPCs

The import turns NPC stat blocks into ready-to-play characters:

1. **Write the NPC as JSON**: one object, or an array of several, in the
   format described in the sheet's
   [`npc-import/FORMAT.md`](https://github.com/Roll20/roll20-character-sheets/tree/master/Cohors_Cthulhu/npc-import/FORMAT.md), with a worked example in
   [`examples/subura_street_thug.json`](https://github.com/Roll20/roll20-character-sheets/tree/master/Cohors_Cthulhu/npc-import/examples/subura_street_thug.json).
   The JSON Schema in [`schema/npc.schema.json`](https://github.com/Roll20/roll20-character-sheets/tree/master/Cohors_Cthulhu/npc-import/schema/npc.schema.json)
   lets any JSON Schema validator check a file before you import it.
2. **Paste the JSON into a handout's GM Notes**, then run (GM only):
   ```
   !ccimport handout|<Handout Name>
   ```
   You get a whispered summary naming every NPC created and anything worth
   a second look.

Imported NPCs open on the sheet's NPC side, at the tier the JSON gives
(Trooper, Toughened or Nemesis), with the stat block's Stress, Injuries,
Armor, Courage and Power, its attacks (including mental attacks), special
rules, spells and escalation options filled in. The first time an
imported character's sheet is opened, the sheet recalculates its derived
values and fills in the keywords and requirements of talents, and the
details of spells, given by name only. Add `description` in the JSON for
any text you want on the sheet.

### Tokens

If the game has a token image with the NPC's name (or the name in the
JSON's `token` field), the import also sets the NPC's default token and
avatar. It looks for the image, in order:

1. in the **token map**: stat block names and the URLs of their token
   images, as a JSON object, in CONFIG's `tokenMap` or in the GM Notes of a
   handout named **Token Map** (the handout adds to and overrides CONFIG):

   ```json
   {
     "Deep_One_Shaman": "https://files.d20.io/images/.../max.webp?123",
     "Roman_Centurion": "https://files.d20.io/images/.../max.webp?456"
   }
   ```

   A name matches ignoring case, accents and extra spaces, and an underscore
   matches a space, so `Deep_One_Shaman` is found for "Deep One Shaman". A
   name ending in a note in brackets is also tried without it ("Sacerdos
   (Priest)" finds `Sacerdos`). The URLs must be images uploaded to Roll20
   (`files.d20.io`); any size works, the import uses the thumbnail. An image's
   URL is in its context menu in the Art Library, or in a token's image
   settings;
2. in the Journal, in a folder named **Token Images** (see CONFIG) with a
   folder per token holding handouts that use the image as their avatar.
   This is ModifyTokenImage's layout, so its folders work as they are; you
   can also make them by hand. `size: 2` in such a handout's GM Notes makes
   the token 2 by 2 squares;
3. among named tokens on a page called **Token Library** (see CONFIG);
4. among custom token markers (uploading a folder of PNGs as a marker set
   names each image after its file).

| Command (GM only) | Effect |
| --- | --- |
| `!ccimport tokens` | List the token images the import can find, the token map's names first |
| `!ccimport token\|<Character Name>[\|<Token Name>]` | Give an existing character its token |

When no image is found, the import card says so and lists the names it
looked for (with debug logging on, the API console also shows each lookup).
Add the missing name to the token map, or give the NPC's JSON a `token`
name that is in it.

See the Token section of [`npc-import/FORMAT.md`](https://github.com/Roll20/roll20-character-sheets/tree/master/Cohors_Cthulhu/npc-import/FORMAT.md) for
the JSON side.

## Debug logging

| Command (GM only) | Effect |
| --- | --- |
| `!ccdebugon` / `!ccdebugoff` | Turn debug logging on or off (any capitalization) |
| `!ccdebug` | Show the current setting |

Debug logging is off by default and stays as set across sandbox restarts.
When on, the script writes what it did to the API console (on the Mod
(API) Scripts page), tagged by part (`[CCMomentum]`, `[CCThreat]`,
`[CCTokenActions]`, `[CCImport]`): every chat message it sees, each pool
before and after a signal or command, how a spend was split between
Momentum and Threat, and each NPC import. Errors are always logged.

## For other scripts

The script's only global is `CohorsCthulhuCompanion`. Other scripts can act
on each imported NPC: add a function to its `importHooks` array, and the
import calls it with the new character's id.

```js
on('ready', () => {
  CohorsCthulhuCompanion.importHooks.push((characterId) => {
    log(`imported ${getObj('character', characterId).get('name')}`);
  });
});
```

## Changelog

- **1.0.0** (2026-10-11): first release.

## License

MIT, like every script in Roll20's API scripts repository.
