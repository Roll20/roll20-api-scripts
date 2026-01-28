# PinTool

PinTool is a GM-only Roll20 API script for creating, inspecting, converting, and managing **map pins** at scale. It can convert older token-based note workflows with Roll20’s newer map pin system, allowing structured handouts and pins to stay in sync.

---

## Core Capabilities

- Bulk modification of map pin properties
- Precise targeting of selected pins, all pins on a page, or explicit pin IDs
- Conversion of legacy note tokens into structured handouts
- Automatic placement of map pins from handout headers (player and GM)
- Optional chat display of images referenced in notes

**Base Command:** `!pintool` opens a control panel for commonly used editing controls. Add priaru commands afterward to access specific functions.

`!pintool --help` creates a handout with full documentation


---

## Primary Commands

- `--set` updates one or more properties across many pins at once.
- `--convert` extracts data from tokens representing the same character and builds or updates a handout.
- `--place` scans a handout for headers and creates or replaces pins linked directly to those sections.
- `--purge` removes related tokens or pins in bulk.
- `--help` creates full documentation handout.

---

## Highlights

- Pins created via `--place` link directly to specific headers in Notes or GM Notes.
- Existing pins are replaced in-place, preserving their positions.
- Conversion supports header levels, blockquotes, code blocks, and inline image links.
- Visibility, scale, links, and sync state can all be controlled programmatically.

Designed for GMs who want more automated control over pin placement and management.
