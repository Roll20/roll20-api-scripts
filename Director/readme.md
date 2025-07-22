# Director

**Director** is a script for supporting "theater of the mind"-style play in Roll20. It provides an interface for managing scenes, images, audio, and game assets — all organized within a persistent handout.

[Here is a video](https://youtu.be/TMYzFNTkiNU?si=yexMBPtz0sXNdx_o) that provides a demo of the script.

---

## Interface Overview

The interface appears in a Roll20 handout and consists of four main sections:

- **Acts & Scenes** — scene navigation and management  
- **Images** — backdrops, highlights, and associated tracks  
- **Items** — characters, variants, macros, and token-linked objects  
- **Utility Controls** — edit mode, help toggle, settings, backup tools  

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

---

## Images

### Backdrop vs. Highlight

- **Backdrop**: Main background image placed on the Map Layer  
- **Highlights**: Visuals layered above the backdrop on the Object Layer (for focus or emphasis)  

When a scene is set:
- The backdrop is placed on the map
- All highlights appear just off the left edge of the page

Highlights can be dragged manually, or previewed using `Shift+Z`.

### Adding Images

1. Drag a graphic to the tabletop (hold `Alt`/`Option` to preserve aspect ratio)  
2. Select the graphic and click `+ Add Image` in the interface

### Image Controls

- **Title**: Click to rename  
- **Bottom-right icons**:
  - `expanding arrows icon` = Set as Backdrop  
  - `overlapping rectangles icon` = Set as Highlight  
  - `music note icon` = Assign currently playing track. This track will auto play whenever the image becomes a backdrop image.
- In **Edit Mode**:
  - Move an image up or down. Although the backdrop image always goes to the top
  - Recapture
  - Delete

### Mute Button

Toggles automatic track playback. When red, backdrops will no longer auto-start audio.

---

## Items (Characters, Variants, Tracks, Macros, Tables)

Items define what gets placed or triggered when a scene is set. Items are scoped per scene.

### Adding Items

Click a badge to add a new item:
- `H` = Handout  
- `C` = Character  
- `V` = Variant  
- `T` = Track  
- `M` = Macro  
- `R` = Rollable Table  

### Item Behavior

| Badge | Type       | Behavior                                                                 |
|-------|------------|--------------------------------------------------------------------------|
| `H`   | Handout    | Opens the handout                                                        |
| `C`   | Character  | Opens the sheet if assigned; otherwise prompts for assignment            |
| `V`   | Variant    | Places token on scene set (does not open a sheet)                        |
| `T`   | Track      | Toggles playback; assigns current track if none assigned                 |
| `M`   | Macro      | Runs macro if assigned; otherwise prompts to choose an existing macro    |
| `R`   | Table      | Rolls the assigned table; result whispered to GM                         |

> _Variants are token snapshots that share a character sheet. Use them to represent alternate versions of a character or avoid issues with default token behavior._

### Edit Mode Controls

While in **Edit Mode**, each item displays:
- `pencil icon` — Reassign
- `trash icon` — Delete

You can also click the `magnifying glass icon` icon to filter items by type.

---

## Header Buttons

### Set the Scene

`Set the Scene` places all scene elements on the tabletop:

- Backdrop (Map Layer)
- Highlights (Object Layer, off-page)
- Items (Object Layer, off-page right)
- Starts assigned track (if any)

> _Only works on pages named:_ `scene`, `stage`, `theater`, or `theatre`

### Wipe the Scene

`Wipe the Scene` removes all images and stops all audio.

> _Only works on valid stage pages._

### Edit Mode

Toggles editing. When enabled:
- Rename, delete, and move controls appear for acts, scenes, and images
- Items display grouped by type with assign/delete icons

### JB+

If [Jukebox Plus](https://app.roll20.net/forum/post/12417862/script-jukebox-plus-enhanced-audio-control-for-roll20) is installed, this button appears and provides a chat link to launch its controls.

### Help

Displays this help interface. While in help mode, this changes to "Exit Help".

### Make Help Handout

Creates a handout containing the help documentation. Use it to reference instructions while working in the main interface.

---

## Helpful Macros

These commands can be used in the chat or bound to macro/action buttons:

`!director --set-scene`

`!director --wipe-scene`

`!director --new-act|Act I`

`!director --new-scene|Act I|Opening Scene`

`!director --capture-image`
