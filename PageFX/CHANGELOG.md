# Changelog

## 2.0.0 (2026-11-07)

A full rewrite by MidNiteShadow7 of Ada Lindberg's PageFX 1.3, which had not changed since 2017. Version 1 tokens keep working, and `!pageFX on` and `!pageFX off` still work.

### Fixed

- **Effects only ran on the page with the player ribbon.** Players moved to their own page (split party) saw nothing, because effects were spawned without a page and only ribbon-page tokens were started. Effects now run on every page with players on it, each drawn on its own page.
- The area and page edges were worked out from the ribbon page, not the effect's own page.
- Aura radii assumed 70 px cells (`radius × 70 / scale`), so areas were wrong on pages with a different snapping increment.
- A NullFX area grew or shrank with the size of the PageFX token being checked, not its own.
- Saved custom FX were spawned twice each time.
- A `random` direction never worked for saved beam-like custom FX.
- Bar values were used as text in the interval maths.
- Moving or selecting a PageFX token restarted its timer.
- Effects did not start when the sandbox started, only when the ribbon next moved.
- A debug message was logged on every beam spawn.
- Errors, such as a saved FX that could not be found, only reached the API console; the GM is now told.
- Effects had no limit, which made games lag with fast effects. Each page now gets at most 30 spawns a second (a setting).

### Added

- **Chat menus**: a main menu of the effects on your page, a card per effect with buttons for every setting, a presets card, settings and status.
- Effects made from any token: `create`, `preset`, `fx`, `interval`, `direction`, `area`, `name`, `delete`, and no-effect areas with `null create`.
- **Layers**: one effect can spawn several things, each with its own timing.
- Built-in FX in any type and colour, saved custom FX, and custom FX definitions pasted as JSON. Missing values in a definition are filled in, and PageFX saves its definitions as its own custom FX so Jumpgate draws them in colour.
- **Per-effect on/off, pause and intensity**, plus pause all, resume all and global intensity.
- **23 presets** in four packs: weather, fire and heat, water, and magic. Other Mods can add more.
- **Triggers**: start, stop, switch, fire or burst an effect each round or on a round, on a token's turn, or when a token enters or leaves an area, for player tokens, any token or named tokens, once or every time.
- **GM Page Preview** setting: also run effects on the page a GM is looking at.
- **PageFX - Help** and **PageFX - Command Deck** handouts, in 24 languages, and a Language option on the Mod's settings page.
- Commands from other Mods are accepted, and a public API: `start`, `stop`, `pause`, `resume`, `setIntensity`, `fire`, `create`, `remove`, `getEffect`, `listEffects`, `isRunning`, `registerPreset`, `listPresets` and `checkToken`, alongside version 1's functions.
- `status`, `rescan` (take over copied tokens and forget deleted ones) and `journal rebuild`.

### Changed

- The main command is `!pagefx` (`!page-fx` too). `!pageFX on` and `!pageFX off` now resume and pause every effect.
- Settings live in `state.PageFX`, keyed by the effect token's ID. Version 1 tokens are taken over on the first start; their GM Notes, bars and interdiction marker drive them until they are changed from chat.
- Random points are spread evenly over the area, where version 1 bunched them towards the middle.

## 1.3 (2017-05-16)

By Ada Lindberg.

- A PageFX token's Bar 1 value and max set a range, and each wait between spawns is picked at random from it.

## 1.2 (2016-06-24)

By Ada Lindberg.

- Beam-like effects can fire in a random direction (`random` in Bar 2).
- Saved custom FX can be beam-like.

## 1.1 (2016-05-03)

By Ada Lindberg.

- Saved custom FX and custom FX definitions in a token's GM Notes.
- **NullFX** areas: tokens named NullFX, where no effect spawns.

## 1.0 (2016-04-17)

By Ada Lindberg. The first release.

- A token named PageFX spawns the built-in effect in its GM Notes at random points within its Aura 1, every Bar 1 milliseconds, on the page with the player ribbon. Beam-like effects take their end point from Bar 2. The interdiction marker turns an effect off, and `!pageFX on` and `!pageFX off` start and stop them all.
