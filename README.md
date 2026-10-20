# Darkness

Darkness models the Darkness and Fog Cloud spells, and similar magical darkness or obscuring clouds, on the Roll20 tabletop.

A field is an opaque image on the foreground layer. Tokens move freely in and out of it, and the script adjusts their vision and light as they do. No dynamic lighting walls are used, so nothing blocks movement.

## What a Field Does

- **Vision** — Tokens inside a field cannot see. Their field of vision and night vision are set to 0 degrees, so darkvision does not help.
- **Light** — Inside darkness, light sources on any layer are put out. Fog does not affect light. Where darkness and fog overlap, darkness wins, and the darkness image is drawn on top.
- **Visibility** — Nameplates, bars and auras of tokens inside a field are hidden from players. The GM still sees them.
- **Restoring** — Every setting the script changes is saved when a token enters and restored when it leaves, when the field is turned off, or when it is deleted.

Overlapping fields, moved fields and resized fields are all handled. If a field is resized by hand, its radius follows the new size, rounded to the page's distance per square.

## Getting Started

1. **Install the script** in your campaign.
2. **Type `!darkness`** in chat to open the menu for the page you are viewing.
3. **Click Place Darkness Token.** It is placed:
   - beside the selected token (to its right, or to its left if the token is on the right half of the page),
   - at the center of a selected group, or
   - in the middle of the page if nothing is selected, with your view pulled there.
4. **Turn the effect on** with Darkness, Fog Cloud, Custom or Emanation.
5. **Click the ? button** on any menu for help.

The first placement creates a GM-only character named **Darkness Effect**. Its default token is the targeting token, its token actions repeat the menu's controls, and its GM Notes hold the immunity lists.

## The Menu

The menu lists every effect on the page, each in its own panel with a colored header stripe, labeled with a letter (Effect A, Darkness A, Fog B). The same label appears as a GM-only nameplate on the board. Every button names its effect, so nothing needs to be selected.

| Group | Buttons |
|---|---|
| Type | **Darkness** (15 ft), **Fog Cloud** (20 ft), **Custom** (choose effect and radius), **Emanation** |
| Immunity | **+ Immune**, **− Remove** |
| Effect | **Locate**, **Unlink** (emanations only), **Off**, **Delete** |
| All effects on the page | **All Off**, **Delete All** (asks first), **Refresh**, **+ Place Another** |

On an active field, switching between Darkness and Fog Cloud keeps its radius. Locate pings the effect for the GM only. Off returns the effect to its targeting state; Delete removes it.

The menu is sent again after every change. A button from an older menu whose effect no longer exists gets a short reply with a link to the current menu.

## Emanation

Emanation centers the field on a creature you click. The radius is measured from the edge of the creature's space, so a 15 ft emanation from a Medium creature is 35 ft across. The field follows the creature when it moves, snaps back if dragged by hand, and is deleted when the creature is deleted. Unlink ends the link and leaves the field in place.

## Immunity

The Darkness Effect character's GM Notes hold two lists of character IDs:

```
Darkness immune: -Nabc123..., -Ndef456...
Fog immune: -Nghi789...
```

Use **+ Immune** and **− Remove** to edit them by clicking a creature. Immune creatures keep their sight in that type of field. Their lights and nameplates are still affected. A token must represent a character to be made immune.

The menu lists immune creatures that have a token on the current page, by name. Click a name to go to that token; hover over it to see the character ID.

To empty both lists, click **Remove All Immunities** in the Immunity section of the help card (the ? button). It asks first, and applies to the whole campaign.

## Commands

| Command | Action |
|---|---|
| `!darkness` | Open the menu for the current page |
| `!darkness --help` | Show help |
| `!darkness --refresh` | Reload immunities and recheck every field |
| `!darkness --setup` | Create or repair the Darkness Effect character |

The menu buttons use further commands (`--set`, `--off`, `--link`, `--immune` and others) that also work as macros on a selected effect token.

## Notes

- Effects work on the page they are placed on. The menu shows the page you are viewing.
- Changes made by TokenMod, ScriptCards and SmartAoE are detected. If another script moves a token without notice, Refresh corrects it. The script also rechecks every field when the API sandbox starts.
- A setting changed by hand on a token inside a field is set back while the token is inside. When it leaves, it gets the values it had before entering.
- The Darkness Effect character updates itself when the script's token actions change in a new version. Its GM Notes are never changed except by the immunity buttons.

## Installation

1. Install Darkness from the Roll20 One-Click library, or copy `Darkness.js` into your campaign's API Scripts.
2. Type `!darkness` to begin.