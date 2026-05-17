# Wiki

A unified interface for browsing and navigating campaign information inside Roll20.

The Wiki consolidates handouts and map pins into a single, interactive panel with navigation controls, filtering, and history tracking. It is designed to reduce context switching and improve information accessibility during play.

---

## Overview

The Wiki creates two automatically managed handouts:

- **Wiki - GM** — full interface, includes GM Notes and all content
- **Wiki - Player** — player-facing interface with restricted visibility

Both update dynamically as users interact with the system.

---

## Getting Started

Type:

`!wiki`

- GMs receive a link to **Wiki - GM**
- Players receive a link to **Wiki - Player**

The interface contains:

- **Navigation Panel** (left): selectable items and filters
- **Content Panel** (right): displays selected content

---

## Wiki Home

- `!wiki` always returns to **Wiki Home**
- The Home (⌂) button clears navigation history

**Wiki Home** is a normal handout:
- Use it as a campaign dashboard
- Links inside it open within the Wiki interface

### Background Image

Add an `https://` image URL as a **tag** on Wiki Home:
- The first valid URL is used
- The image tiles across the interface

---

## Handout Mode

Handout Mode displays journal entries with structured navigation.

### Navigation Behavior

- All headers in a handout appear in the navigation panel
- Clicking a header jumps to that section
- The active section is highlighted

### Header Controls

- **All** — full handout view
- **H1–H4** — filter by header level
- **{ toggle** — include lower-level headers

### GM Notes Support

- GM-only headers appear in grey
- Selecting them loads GM Notes content
- Notes and GM Notes are separated in the content panel

### Avatars

- Displayed at top when viewing full handout (All mode)

### Internal Links

- Handout links are rewritten to stay inside the Wiki

---

## Keywords (H5–H6)

Keywords act as filters.

Define them using headers:


H2 Abandoned Mine
H5 dungeon
H6 goblins


Behavior:
- Clicking a keyword filters sections
- Multiple keywords can be active
- Use **Clear All** to reset

---

## Pin Mode

Pin Mode displays all pins on the current page.

### Features

- Pins are listed alphabetically
- Selecting a pin loads its content
- Last selected pin is remembered

### Content Sources

- Direct pin notes
- Linked handout sections

### Player Visibility

- Blockquotes define player-visible content
- Content after blockquote is GM-only
- Pins without blockquotes show nothing to players

### Audit Tool


!wiki --audit-pins


- Detects improperly configured pins
- Provides Fix / Fix All options

### Ping Controls

Each pin includes two ping buttons:

- **Gold @** — ping visible to all players
- **Grey @** — GM-only ping

---

## Content Controls

Located above the content panel:

- **Back / Forward** — navigation history
- **Clear History** — reset navigation stack
- **Previous / Next** — step through filtered list
- **Edit** (GM) — open source handout
- **Send to Chat** (GM) — output content unfiltered
- **Pintool** (GM) — opens Pintool if installed (Pin Mode only)

History is tracked separately for GM and players.

---

## Player Access

Players use:

`!wiki`

They can access:

- Shared handouts
- Handouts tagged with `wiki+`

---

## Tags

- `wiki+` — force visibility to players
- `wiki-` — hide from Wiki interface
- `Image URL` — Add a background image to the wiki display

---

## Commands

- `!wiki` — open Wiki
- `!wiki --help` — open help
- `!wiki --audit-pins` — audit current page pins

---

## Best Practices

- Use **H1–H4** for structure
- Use **H5–H6** for keywords
- Keep keywords consistent
- Use blockquotes to separate player/GM content
- Assign avatars to important handouts
- Build a dashboard in Wiki Home
- Use `wiki+` for selective sharing
- Use `wiki-` to hide system handouts

---

## Optional Integration

### Pintool

If Pintool is installed:
- A Pintool button appears in Pin Mode
- Provides enhanced pin management