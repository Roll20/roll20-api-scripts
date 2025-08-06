# [Orbotik's Daggerheart Fear AutoTracker](https://github.com/orbotik/roll20-scripts)
`v1.0.8` `CC BY-SA 4.0`    

This fear tracker listens for duality rolls from Demiplane-linked character sheets and bumps up a game fear counter everytime someone rolls with fear. It sends notices to all players showing the new fear value either as player-enabled whispers or chat announcements (or none), and can even update text objects on the maps with fear values!

![orbotik's daggerheart fear tracker](https://raw.githubusercontent.com/orbotik/roll20-scripts/refs/heads/master/.repo/daggerheart-fear-tracker.webp)

Registered text objects have some creative options ("text modes", see `!fear text [...]` below) for showing the current fear amounts:

![tally](https://raw.githubusercontent.com/orbotik/roll20-scripts/refs/heads/master/.repo/daggerheart-fear-tracker-tally.webp)
![circled](https://raw.githubusercontent.com/orbotik/roll20-scripts/refs/heads/master/.repo/daggerheart-fear-tracker-circled.webp)
![bar](https://raw.githubusercontent.com/orbotik/roll20-scripts/refs/heads/master/.repo/daggerheart-fear-tracker-bar.webp)
![dots](https://raw.githubusercontent.com/orbotik/roll20-scripts/refs/heads/master/.repo/daggerheart-fear-tracker-dots.webp)
![skulls](https://raw.githubusercontent.com/orbotik/roll20-scripts/refs/heads/master/.repo/daggerheart-fear-tracker-skulls.webp)
![number](https://raw.githubusercontent.com/orbotik/roll20-scripts/refs/heads/master/.repo/daggerheart-fear-tracker-number.webp)
![stars](https://raw.githubusercontent.com/orbotik/roll20-scripts/refs/heads/master/.repo/daggerheart-fear-tracker-stars.webp)
![candles](https://raw.githubusercontent.com/orbotik/roll20-scripts/refs/heads/master/.repo/daggerheart-fear-tracker-candles.webp)
![candles](https://raw.githubusercontent.com/orbotik/roll20-scripts/refs/heads/master/.repo/daggerheart-fear-tracker-ravens.webp)

Players can turn notifications on or off as they wish, or simply run `!fear` to see the current value. As the GM, you can reset and set the fear at any time.

##### Commands:
| Cmd | Description |
|:-|:-|
| `!fear` | Reports the current fear counter value. |
| `!fear [on/off]` | Turns fear notices on or off (you only). Specifically, when a Demiplane duality roll with fear is detected, you will be sent a whisper by the game of the new fear counter value (if on). The default is `on` for all players. |
| `!fear spend [number]` | **GM-only.** Decreases the fear counter by 1, or optionally a specific number (to a minimum of 0). |
| `!fear gain [number]` | **GM-only.** Increases the fear counter by 1, or optionally a specific number (to a maximum of 12). |
| `!fear set [number]` | **GM-only.** Sets the fear to any number (0-999). |
| `!fear listen [on/off]` | **GM-only.** Turn the listener for Demiplane duality rolls on or off. This is "on" by default. |
| `!fear text {id}` | **GM-only.** Registers a text object to be updated with fear amount as it changes. The `{id}` is optional, and if omitted will set the selected text object. To stop the updating on a specific object, run the command again. |
| `!fear text prefix [text]` | **GM-only.** Specify (quoted) text to appear before the fear counter in text objects. |
| `!fear text suffix [text]` | **GM-only.** Specify (quoted) text to appear after the fear counter in text objects. |
| `!fear text [tally/circled/bar/dots/skulls/number/candles/stars/ravens]` | **GM-only.** Switches how the fear count is displayed in the text objects. |
| `!fear text update` | **GM-only.** Force the registered text objects to update with the current settings and fear value. This also lists the IDs of any registered text objects. |
| `!fear text monospace {id}` | **GM-only.** Sets the currently selected or specified (by ID) text object to use a fixed-width predictable font. |
| `!fear text spacefill [on/off]` | **GM-only.** Ensures the a uniform text length in text objects even when the fear value is low by filling unused character spots with a space. Paired with the monospace command this can help prevent the text objects from "jumping around" horizontally. |
| `!fear announce [on/off]` | **GM-only.** Globally sets announcements to *all* players on or off when the fear amount changes. |
| `!fear whispers [on/off]` | **GM-only.** Globally sets whispers to players on or off when the fear amount changes. |
| `!fear reset` | **GM-only.** Resets the fear counter to `0`. |
| `!fear reset objects` | **GM-only.** Clears all fear-tracking object registrations. |
| `!fear reset known` | **GM-only.** Clears the known player list (players will re-receive the welcome message). |
