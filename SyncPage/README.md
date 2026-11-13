# SyncPage

A Roll20 Mod that keeps pages in step. Pages in a **sync group** share their tokens, drawings, walls, doors, windows, text and page settings: whatever changes on one page changes on the others. Put players on different copies with Roll20's split party, then hide or show things on each copy, so each player sees only what their character should.

**Version 1.0.0 is a full rewrite of Robin Kuiper's SyncPage 0.1.9** for Jumpgate. Your 0.1 set-up carries over, and `!sync` still works.

## Why a mirrored page?

Roll20 still cannot hide an object from only some players on one page. Dynamic lighting gives each token its own vision, which covers "who can see round the corner", but not "this NPC is invisible to the rogue only" or "only the wizard sees the illusion". Split party moves players between pages but does not keep the pages in step. SyncPage does that part.

If all you need is a straight copy of a page, use Roll20's own **Duplicate Page**; SyncPage is for copies that must stay the same while play goes on.

## Installation

1. Install **SyncPage** from the Roll20 One-Click library, or upload `SyncPage.js` to the game's Mod Scripts.
2. Save. SyncPage creates two GM-only handouts in the Journal:
   - **SyncPage - Help**: full instructions.
   - **SyncPage - Command Deck**: buttons for every command.

## Quick Start

1. Go to your map page and type `!syncpage`, then click **Make a group from this page**.
2. Open the page drawer and use **Duplicate** on that page. Roll20's copy keeps marketplace art, which the Mod API cannot copy.
3. Go to the copy, type `!syncpage` and click **Add this page to a group**. SyncPage pairs the objects that match and copies anything missing.
4. Click **Players** to move players to the copy. Select a token and click **Hide here** (or use the grid on the Players card) to hide it on one page only.

A blank page works too: SyncPage copies everything onto it, apart from pictures the API cannot use.

## What Is Mirrored

- Tokens (including Jumpgate lights, which are tokens), text, Legacy and Jumpgate drawings, walls of every kind, doors and windows.
- New objects, changes and deletes, in both directions.
- Page settings such as lighting, grid and size. A page's name is never copied, and archiving one copy does not archive the rest.
- Changes TokenMod makes. Other Mods can call `SyncPage.notify(obj)`; **Repair** catches the rest.

Fog masks drawn with Hide/Reveal are not API objects, so each page keeps its own.

## Hiding Per Page

Select tokens and use **Hide here**, **Hide on other pages**, **Show here** or **Show on other pages**, or click a page on the Players card's grid. Only that page's copy is hidden, and changes on other pages never undo the hide.

**How copies are hidden** (setting):

- **GM layer** (default): the copy moves to the GM layer. Moving it back by hand shows it on that page.
- **Remove**: the copy is deleted and kept as a snapshot, then made again when shown, so nothing is left for players to find. It keeps its place in the turn order. Tokens with marketplace art fall back to the GM layer.

## Players

The **Players** card lists every player and the page they are on, with a button per page to move them. **Everyone to** gathers them on the source page and remembers where they were; **Restore layout** puts them back.

## Repair, Pause and Undo

- **Repair** brings the copies back in step with the source page: properties that drifted, missing copies, and objects deleted or made while SyncPage was not watching. **Preview repair** shows what would change without changing anything. A repair that would change many objects asks first. Repair runs quietly when the sandbox starts (setting); object IDs stay the same.
- **Pause** stops mirroring a group while you rearrange one copy on purpose. **Resume** reports the differences and offers a repair.
- **Undo** puts back the last removal. Every delete that spreads, and every clean-up, goes into the group's **Recycle bin**.

## Settings

Every setting can be changed on the settings card (`!syncpage settings`). Settings marked _group_ can also be changed for one group on its card.

| Setting                       | Options (default first)                                                                  | Scope  |
| ----------------------------- | ---------------------------------------------------------------------------------------- | ------ |
| When an object is deleted     | Everywhere, Source page only, Unlink, Ask                                                | group  |
| How copies are hidden         | GM layer, Remove                                                                         | group  |
| Objects that match nothing    | Ask, Copy, Leave                                                                         | group  |
| New objects                   | Mirror, Source only                                                                      | group  |
| Kept per page (tokens)        | any of GM Notes, Name, Bars, Markers, Tint, Auras, Vision, Light, Controlled by          | group  |
| Kept per page (page settings) | any of Lighting, Daylight, Explorer mode, Fog, Grid, Background, Size and scale, Jukebox | group  |
| Layers not synced             | any of Map, Tokens, GM, Foreground, Walls                                                | group  |
| Mirror page settings          | On, Off                                                                                  | group  |
| Repair on start               | Quietly, And report, Off                                                                 | global |
| Who may open the player card  | GM only, Players too                                                                     | global |
| Recycle bin size              | 25 (1–100)                                                                               | global |
| Language                      | 24 languages                                                                             | global |

## Commands

All commands are GM only. `!sync` and `!sync-page` work too.

| Command                                                 | What it does                                             |
| ------------------------------------------------------- | -------------------------------------------------------- |
| `!syncpage`                                             | Open the menu.                                           |
| `!syncpage group create [name]`                         | Make a sync group from this page.                        |
| `!syncpage group add <group>`                           | Add this page to a group.                                |
| `!syncpage group remove`                                | Take this page out of its group. Objects stay, unlinked. |
| `!syncpage group show\|rename\|source\|delete <group>`  | Show, rename, change the source of, or delete a group.   |
| `!syncpage players [group]`                             | Players card.                                            |
| `!syncpage move <player> <page>` / `move all <page>`    | Move one player, or everyone.                            |
| `!syncpage layout save\|restore [group]`                | Remember or restore the split.                           |
| `!syncpage hide\|show [here\|others\|all\|page=<page>]` | Hide or show the selected objects' copies.               |
| `!syncpage status`                                      | Links of the selected objects and where they are hidden. |
| `!syncpage unlink`                                      | Keep the selected objects on this page only.             |
| `!syncpage repair [group\|all] [--dry-run]`             | Repair, or preview a repair.                             |
| `!syncpage pause\|resume [group]`                       | Pause or resume mirroring.                               |
| `!syncpage undo [group]` / `recycle [group]`            | Undo the last removal; list and restore removals.        |
| `!syncpage settings [group <group>]`                    | Settings card.                                           |
| `!syncpage set [group <group>] <setting> <value>`       | Change a setting. Lists take `+name` and `-name`.        |
| `!syncpage handouts`                                    | Rebuild the handouts.                                    |

`--ids id1,id2` acts on those objects instead of the selected ones; `--page <page>` acts on that page instead of the one you are viewing.

## For Other Mods

```js
SyncPage.getGroup(pageId); // { id, name, source, pages, paused } or null
SyncPage.getLinked(obj); // { pageId: objectId, … } or null
SyncPage.notify(obj, prev); // mirror a change your Mod made (API changes raise no events)
SyncPage.isHidden(obj, pageId); // true when that page's copy is hidden
SyncPage.onSync((e) => {}); // e.kind is 'create', 'change' or 'destroy'
SyncPage.repair(groupIdOrName, { dryRun: true });
```

## Upgrading From 0.1

- A page whose name ends in `_synced` joins a group with the page of the same name without it, which becomes the source. Rename the pages afterwards if you like.
- 0.1's links are kept where both objects still exist; everything else is paired by position and picture.
- 0.1's Show/Hide flags in GM Notes become hidden copies, and the flag text (and the stray "undefined" 0.1 wrote) is removed from GM Notes.
- A custom command from 0.1's config still works. **True Copy** is gone: use Roll20's Duplicate Page.
- 0.1's `state.SYNCPAGE` is left in place, so going back to 0.1.9 still works.

## Credits

Original Mod by [Robin Kuiper](https://app.roll20.net/users/1226016/robin) ([GitHub](https://github.com/RobinKuiper/Roll20APIScripts), [Patreon](https://www.patreon.com/robinkuiper)).
Version 1.0 rewritten and maintained by [MidNiteShadow7](https://app.roll20.net/users/16506286/midniteshadow7) ([GitHub](https://github.com/steverobertsuk)).
