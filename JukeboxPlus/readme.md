# Jukebox Plus

Jukebox Plus lets you organize and control music tracks by **albums** or **playlists**.  
Use the toggle buttons in the sidebar to switch between views. Tracks are displayed on the right, and control buttons appear for each one.

---

## Getting Started

Jukebox Plus lets you organize and control music tracks by **albums** or **playlists**.  
Use the toggle buttons in the sidebar to switch between views. Tracks are displayed on the right, and control buttons appear for each one.

---

## Header Buttons

At the top right of the interface:

[`Play All`][`Together`][`In Order`][`Loop`][`Mix`]  
[`Loop All`][`Off`][`On`]  
[`Stop All`] [`Find`] [`Help`]

### Button Descriptions

**Play All**  
&nbsp;&nbsp;&nbsp;&nbsp;**Together** — Plays all visible tracks simultaneously. Limited to the first five visible.  
&nbsp;&nbsp;&nbsp;&nbsp;**In Order** — Plays all visible tracks one after the other.  
&nbsp;&nbsp;&nbsp;&nbsp;**Loop** — Plays all visible tracks one after the other, then starts over.  
&nbsp;&nbsp;&nbsp;&nbsp;**Mix** — Plays all looping tracks continuously, and all other tracks at random intervals. Use to create a custom soundscape. Stopped by [`Stop All`].

**Loop All**  
&nbsp;&nbsp;&nbsp;&nbsp;**Off** — Disables loop mode for all visible tracks  
&nbsp;&nbsp;&nbsp;&nbsp;**On** — Enables loop mode for all visible tracks

**Stop All** — Stops all currently playing tracks. Also use to stop a Mix.  
**Find** — Search all track names and descriptions for the keyword. All matching tracks will be assigned to a temporary album called **Found**. You can then switch to the Found album to quickly view the results. To clear the results, simply delete the Found album using the Utility panel.  
If you input `"d"` as the search term, it will create a temporary playlist of any duplicate tracks, grouped by name.  
**Help** — Displays this help page. Click **Return to Player** to return.

---

## Sidebar: Navigation & Now Playing

**View Mode Toggle**

The left sidebar lists all albums or playlists, depending on the current view mode. Clicking a name switches the view.

[`Albums`] [`Playlists`]

These buttons let you switch between organizing by:  
- **Albums** you define and tag yourself  
- **Playlists** as defined in the Roll20 Jukebox system (not editable here)

At the bottom of the list:  
[`Now Playing`] — Filters the list to show only tracks currently playing.

---

## Track Controls

Each track shows these control buttons:

- [`▶`] **Play** — Start the track  
- [`⟲`] **Loop** — Toggle loop mode for the track  
- [`⦿`] **Isolate** — Stops all others and plays only this one  
- [`■`] **Stop** — Stops this track  
- [`➤`] **Announce** — Sends the track name and description to the chat window

---

## Track Info and Management

**Edit** — Click the track description "edit" link to create a description.

Description special characters:
- `---` inserts a line break
- `*italic*` uses single asterisks for italic text
- `**bold**` uses double asterisks for bold text
- `!d` or `!desc` includes the description when you Announce a track
- `!a` or `!announce` makes the track auto-announce on play

**Tags** —  
Each track has a Playlist tag and may have one or more Album tags.  
- `Playlist` tags are in blue  
- `Album` tags are in red  

Click [+ Add] to add an Album tag.  
Click a tag to jump to that Album or Playlist.  
Click the "x" on an Album tag to remove it: `Album name | x`

**Image Area** —  
Click the image area to enter either:
- a valid image URL
- a CSS color name (e.g. `"red"`)
- a hexadecimal color code (e.g. `#00ff00`)

If you provide an image URL, it will display beside the track name and in the chat on announce.  
If you provide a color code, the square will show that color and use it when Announcing.

---

## Utility Panel

Click [`Settings ▾`] to expand the utility tools. Includes:

### Album Controls
[`Edit Albums:`][`–`][`+`][`✎`]  
- Rename, add, or delete the currently selected album

### Sorting
[`A—Z:`][`albums`][`tracks`]  
- Alphabetize Albums or the tracks within an Album

### Mode
[`Mode:`][`dark`][`light`]  
- Switch between dark and light interface modes

### Refresh
[`↻ Refresh`] — Rebuilds the interface if something breaks

### Mix Rate
[`Mix Rate:`][`60s`][`10s`][`↻`]  
- Set the **maximum** and **minimum** interval (in seconds) between randomly played tracks when using [`Mix`] mode  
- Click `↻` to reset to the default range (10–60 seconds)  
- These settings affect how frequently non-looping tracks are triggered in a mixed soundscape  
- Looping tracks are not affected by this timing

### Backup
[`Backup:`][`make`][`restore`]  
- Create or restore from backup handouts containing your album and playlist data  
- Use this to move data between games via the Roll20 Transmogrifier

**Note:** Tracks are linked by ID, which changes between games. The script tries to match by name during restore, but renames and duplicates may cause mismatches.

---

## Find

Use the `!jb find keyword` command to search all track names and descriptions.  
Matching tracks are added to a temporary album called **Found**.  
Delete the Found album to clear the search results.

---

## Useful Macros

Here are some chat commands you can use in macros:

- `!jb` — Show link to open the interface  
- `!jb play TrackName` — Play the named track  
- `!jb stopall` — Stop all currently playing audio  
- `!jb loopall` — Enable loop mode for visible tracks  
- `!jb unloopall` — Disable loop mode on all tracks  
- `!jb jump album AlbumName` — Switch to the given album  
- `!jb help` — Open this help screen  
- `!jb find keyword` — Search for keyword and assign matches to the "Found" album

You can also discover commands by pressing a control button, clicking in the chat window, and pressing the **Up Arrow** to see what was sent.

---
