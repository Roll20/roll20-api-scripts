# PinTool

PinTool is a GM-only Roll20 API script for creating, inspecting, converting, and managing **map pins** at scale. It can convert older token-based note workflows into Roll20’s newer map pin system, allowing structured handouts and pins to stay in sync.

---

## Core Capabilities

- Bulk modification of map pin properties.
- Precise targeting of selected pins, all pins on a page, or explicit pin IDs.
- Conversion of legacy token notes into structured handouts.
- Automatic placement of map pins from handout headers (player and GM).
- Optional chat display of images referenced in notes.
- **Pin Library (`--library`)** lets GMs Keep a library of pin styles for quick application.  

**Base Command:** `!pintool` opens a control panel for commonly used editing controls. Add primary commands afterward to access specific functions.  

`!pintool --help` creates a handout with full documentation.

---

## Primary Commands

- `--set` — Update one or more properties across many pins at once.  
- `--convert` — Extract data from tokens representing the same character and build or update a handout.  
- `--place` — Create or replace pins based on handout headers, linking directly to those sections.  
- `--purge` — Remove related tokens or pins in bulk.  
- `--library` — Open the Pin Library to copy preset pin styles to selected pins.  
- `--transform` — Apply transformations to pins, e.g., auto-generating icon text from titles.  
- `--help` — Display the full PinTool help panel.  

---

## Highlights

- Pins created via `--place` link directly to specific headers in Notes or GM Notes.  
- Existing pins are replaced in-place, preserving their positions.  
- Conversion supports header levels, blockquotes, code blocks, and inline image links.  
- Visibility, scale, links, and sync state can all be controlled programmatically.  
- Pin customization modes allow you to quickly switch the pin image  between icons, text icons, or images.  

Designed for GMs who want more automated control over pin placement, appearance, and management.  