# LightMeter

LightMeter shows how well lit a token is by adding a moon to the end of its name. The moon updates each time the token moves.

- 🌑 Dark
- 🌗 Dim
- 🌕 Bright

It uses **checkLightLevel** to read the light level, so it only works on pages with dynamic lighting turned on. Only tokens on the Objects layer are updated.

---

## Making a token light sensitive

Either:

- Add ` **` (a space and two asterisks) to the end of the token's name, or
- Select one or more tokens and click **Selected: On** in the `!lightmeter` menu.

A token turned on from the menu shows its moon right away. A token marked by hand shows its moon the next time it moves. **Selected: Off** removes the moon from the name.

---

## Commands (GM only)

- `!lightmeter` — Shows the menu with the current light ranges.
- `!lightmeter --dark N` — Sets the darkness threshold (0–100). Light at or below this shows 🌑.
- `!lightmeter --dim N` — Sets the dim light threshold (0–100). Light above the darkness threshold and at or below this shows 🌗. Anything higher shows 🌕.
- `!lightmeter --reset` — Restores the defaults (dark 20, dim 50).
- `!lightmeter --on` / `--off` — Turns light sensitivity on or off for the selected tokens. Both also accept `--ids id1,id2`.

The darkness threshold must be lower than the dim threshold. Settings are saved with the game.

---

## Requirements

- checkLightLevel
- Path Math (required by checkLightLevel)
