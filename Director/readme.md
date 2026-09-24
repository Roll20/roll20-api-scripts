# Director

**Director** is a script for supporting "theater of the mind"-style play in Roll20. It provides an interface for managing scenes, images, audio, and game assets — all organized within a persistent handout.

**Video Tutorials:** [Director intro](https://youtu.be/TMYzFNTkiNU?si=yexMBPtz0sXNdx_o) | [Set as Grid feature](https://www.youtube.com/watch?v=ne8Zu7a8eJwo) | [Search feature](https://www.youtube.com/watch?v=nh7Z2CxXq5w) | [Star Item feature](https://www.youtube.com/watch?v=sdbyeH8p9AQ)

---

## Interface Overview

The interface appears in a Roll20 handout and consists of five main sections:

- **Header** — search, edit mode, help toggle, and scene controls (Set as Grid/Scene, Wipe the Scene, Stop Audio)
- **Acts & Scenes** — scene navigation and management
- **Images** — a scene's list of images: click any one to make it the backdrop; the rest become highlights
- **Items** — Actors, Characters, Variants, Handouts, Tracks, Macros, and Rollable Tables
- **Settings** — light/dark mode, captions, margins, backup/restore, report generation, and repair

---

## Acts & Scenes

### Act Controls

Acts group together related scenes. Use the `+ Add Act` button to create one.

In **Edit Mode**, you can:
- Rename or delete acts
- Move acts up or down

### Scene Controls

Each scene represents a distinct moment or location. Click a scene name to set it active — this controls what images and items are shown.

In **Edit Mode**, you can:
- Rename or delete scenes
- Move scenes up or down (scenes moved beyond an act will join the next expanded act)

### Search

Click the magnifying-glass icon in the Acts & Scenes column header to search for a scene or image by name. A partial or similar term is enough. Results are grouped into Scenes and Images and appear directly in chat:

- Scene results include a **set** button that jumps straight to that scene.
- Image results show a thumbnail alongside **set** (cuts to that scene with the image as backdrop, wiping whatever's currently up) and **Reveal** (crossfades to that backdrop without wiping or pushing anything else live — handy for staging a backdrop in advance, or swapping one in on a scene that's already live).

You can click the search header in the chat results to run another search.

---

## Images

### Backdrop vs. Highlight

- **Backdrop**: the main background image for a scene, shown on the Map Layer
- **Highlights**: every other image in the scene, shown on the Object Layer just off the left edge of the page

When a scene is set:
- The backdrop is placed on the map
- Highlights appear off the left page edge, ready to be lightbox-previewed (`Shift+Z`) or dragged onto the map as needed

Clicking an image to make it the backdrop crossfades smoothly if that scene is the one currently live on the tabletop. Clicking one while browsing a different scene just changes what that scene will use next time it's set, without touching what's currently on screen.

### Adding Images

1. Drag a graphic to the tabletop (hold `Alt`/`Option` to preserve aspect ratio)
2. Select the graphic and click `+ Add Image` in the interface

### Image Controls

- **Title overlay**: click to rename
- **Click the thumbnail**: sets this image as the scene's backdrop
- **Bottom-right icon**: assign the currently playing track to this image — it auto-plays whenever the image becomes the backdrop
- In **Edit Mode**: move, recapture, and delete controls appear in the top-right corner

### Mute Button

Toggles automatic track playback. When red, backdrops will no longer auto-start audio.

---

## Items (Actors, Characters, Variants, Handouts, Tracks, Macros, Rollable Tables)

Items define what gets placed or triggered when a scene is set. Items are scoped per scene.

### Adding Items

Click a badge to add a new item:
- `A` = Actor *(requires Roll20's v1.5+ API sandbox; preferred over Variant where available)*
- `C` = Character
- `V` = Variant
- `H` = Handout
- `T` = Track
- `M` = Macro
- `R` = Rollable Table

### Item Behavior

| Badge | Type       | Behavior                                                                 |
|-------|------------|--------------------------------------------------------------------------|
| `A`   | Actor      | Appears on scene set, copied live from its reference token; opens the reference token's character sheet if it's linked to one |
| `C`   | Character  | Opens the sheet if assigned; otherwise prompts for assignment            |
| `V`   | Variant    | Places token on scene set (does not open a sheet)                        |
| `H`   | Handout    | Opens the handout                                                        |
| `T`   | Track      | Toggles playback; assigns current track if none assigned                 |
| `M`   | Macro      | Runs macro if assigned; otherwise prompts to choose an existing macro    |
| `R`   | Table      | Rolls the assigned table; result whispered to the GM                     |

> _Actors reference a token directly instead of storing a snapshot: place one or more tokens on a permanent Token Page, select them, and click the `A` badge. Each placement makes a live copy of the reference token, so edits to it (image, bars, auras, etc.) are picked up automatically, and it takes far less storage than a Variant. If the reference token is deleted or moved, that Actor is skipped at placement until it's restored — Director won't let a token on a Director stage/scene page be used as a reference, since those get wiped whenever a scene is set._
>
> _Variants are token snapshots that share a character sheet. They're kept for existing installations and for cases where a default token can't be reliably spawned, but Actor is preferred for new items where possible. A Character or Variant can be converted to an Actor in Edit Mode (select the reference token first, then click the convert control) — Director also finds and converts other matching duplicates of the same character across the campaign in one step._

### Star System

Star an Actor, Character, or Variant to link it to a specific backdrop image — useful when a scene has several shops or NPCs, and you want each one's token highlighted only when their location is the backdrop. When that image is live, starred tokens are highlighted in gold. Disabled in Grid Mode. The Star Filter button in the header shows only starred items; use the item filter to temporarily show all items of a type instead.

### Supernotes Integration

If the Supernotes script is installed, an info button appears next to each Actor, Character, or Variant in the Items list. Clicking it whispers that item's token notes to chat in Supernotes' card layout. The button only appears when there's a live token to reference.

### Edit Mode Controls

While in **Edit Mode**, each item displays:
- Move up / move down
- Rename (display name only)
- Redefine (reassign what the item points to)
- Convert to Actor (Character and Variant items only)
- Delete

---

## Settings

This collapsible menu holds commands that perform utility functions or affect global behavior.

### Mode

Switches the Director interface (and its chat output) between Light and Dark mode. Independent of the game's own dark/light mode setting.

### Captions

Optional text overlays displayed on theater pages (Scene Mode only), toggled On/Off and configured with Set. Off and campaign-wide by default.

To define a caption, create and style a text object on the page — Director uses it as a template whenever a scene is set. Templates can include:
- `[Act]` — replaced by the current act name
- `[Scene]` — replaced by the current scene name
- `[Image]` — replaced by the backdrop image name (if any)

Example: `"Scene: [Scene], Location: [Image]"` → `"Scene: Castle Ward, Location: Yawning Portal"`

Manual tweaks (move, recolor, resize) persist until the caption is refreshed by redefining it or changing scenes. Captions aren't supported in Grid Mode.

### Margins

Use Margins Off if you use the Director interface docked in the VTT, and turn them On if you use it popped out into its own window. Off is the default.

### Backup

- **make**: creates a sequentially numbered "Director Backup ###" handout. Useful for restoring a corrupted database or transferring act/scene/image definitions between campaigns. Item buttons aren't transferred but can be restored within the same campaign the backup was made from.
- **restore**: replaces the current Director database with the contents of a selected backup handout. This cannot be undone.

### Make Report

Sends a clickable list of all Acts, Scenes, and Images to chat.

### Repair

Checks the database and attempts to fix any issues found. Also refreshes the handout if images were added or deleted outside the normal flow.

---

## Header Buttons

### Search

Opens a prompt to search scenes and images by name (see Search under Acts & Scenes above).

### Set Scene as:

**Scene** places the following on the tabletop:

- Backdrop image (Map Layer)
- Highlight images (Object Layer, left-aligned off page edge)
- Actor, Character, and Variant tokens (Object Layer, right-aligned off page edge)
- Any tokens starred for the current backdrop image are highlighted
- Starts the assigned track (if set)

**Grid** places the following on the tabletop:

- Up to nine images, arranged in a grid (Map Layer)
- Surrounds each image with dynamic lighting barriers and turns on dynamic lighting with Daylight Mode
- Top strip of the page is reserved (for holding player tokens)
- Actor, Character, and Variant tokens (Object Layer, right-aligned off page edge)
- Star system is suppressed, since there's no single backdrop

> _Only works if the current page name contains:_ `scene`, `stage`, `theater`, or `theatre`

### Wipe the Scene

Removes all placed images and stops all audio.

> _Only works on valid stage pages._

### Stop Audio

Stops any audio currently playing without otherwise touching the scene.

### Edit Mode

Toggles editing. When enabled:
- Rename, delete, and move controls appear for acts, scenes, and images
- Items display grouped by type with the full set of edit controls (rename, redefine, convert to Actor, delete, reorder)

### JB+

If [Jukebox Plus](https://app.roll20.net/forum/post/12417862/script-jukebox-plus-enhanced-audio-control-for-roll20) is installed, this button appears and provides a chat link to launch its controls.

### Help

Displays this help interface. While in help mode, this changes to "Exit Help".

### Make Help Handout

Appears only in Help mode. Creates a handout containing the help documentation, useful for referencing instructions while working in the main interface.

---

## Helpful Macros

These commands can be used in the chat or bound to macro/action buttons:

```
!director --set-scene
!director --wipe-scene
!director --new-act|Act I
!director --new-scene|Act I|Opening Scene
!director --capture-image
```

An entire scene setup can also be triggered from a single macro — handy for a GM who wants a preset list of scenes keyed to macro buttons. Both commands below take the Act, Scene, and Backdrop/Image name directly (spelled however you like — matching is case-insensitive):

```
!director --set|Act I|Opening Scene|Tavern Interior
!director --reveal|Act I|Opening Scene|Tavern Interior
```

- **`--set|Act|Scene|Backdrop`** — cuts straight to a brand-new scene: wipes whatever's currently up, then sets and pushes the given act/scene/backdrop live.
- **`--reveal|Act|Scene|Backdrop`** — just navigates and sets the backdrop, with no wipe and nothing pushed live. Matches the **Reveal** button on a search result: it crossfades to a new backdrop within a scene that's already live, or pre-stages which scene/backdrop will show next if that scene isn't live yet.

If the Act, Scene, or Backdrop name can't be found, neither command changes anything — chat reports which name(s) couldn't be matched so you can check spelling.