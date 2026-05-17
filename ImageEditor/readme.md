# Image Editor

## Overview

The **Image Editor** provides a graphical interface inside Roll20 for editing images embedded in handouts. It allows you to modify layout, styling, and attributes without directly editing HTML.

All changes are written back to the edited handout's notes field automatically in real time.

---

## Features

- Visual interface rendered as a handout
- Thumbnail browser for all images in a handout
- Live preview with navigation controls
- Editable image properties:
  - title (tooltip)
  - url (image source)
  - layout (left, right, center, none)
  - width / height
  - margin (CSS shorthand)
  - border-radius
- Preset styling buttons for quick formatting
- Automatic detection of handouts containing images
- Context-aware navigation to image sections

---

## Usage

### Open the Editor

Type the following in chat:

`!imageeditor`

This opens (or refreshes) the **Image Editor** handout.

---

### Select a Handout

- Click **Choose Handout** in the editor
- Select from a list of handouts that contain images
- Images will load into the interface

---

### Interface Layout

**Thumbnails Panel (Left)**  
Displays all images in the selected handout.

**Preview Panel (Center)**  
Shows the selected image with navigation controls.

**Properties Panel (Right)**  
Allows editing of image attributes and styles.

---

### Editing Properties

Click any property value to edit it.

Leaving a value blank removes that property.

#### Supported Properties

- **title** — Tooltip text
- **url** — Image source URL
- **layout** — Float/display behavior
- **width / height** — Size (px or %)
- **margin** — CSS margin shorthand
- **border-radius** — Corner rounding

---

### Presets

Quick styling options:

- Left / Right (30%, 40%, 50%, 60%)
- Center
- Clear (removes all inline styles)

Presets merge with existing styles where applicable.

---

## Commands

`!imageeditor`

Opens or refreshes the editor interface.


`!imageeditor --help`

Creates or updates the help handout and whispers a link to it.

---

## Notes

- The editor cannot modify its own handout.
- Only images in the **notes** field are processed.
- Images in **gmnotes** are ignored.
- All edits directly modify handout HTML.

**Always keep backups of important handouts.**