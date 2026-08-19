# Track Duration

A Roll20 API script that keeps timed effects attached to tokens in the turn order, counting them down automatically as combat advances.

---

## Overview

When a character is affected by a spell, ability, or condition with a round-based duration, Track Duration lets you attach that effect to their token with a color marker, a name, and a round count. The count is appended directly to the token's name, visible on the board to everyone,and ticks down automatically each time that token's turn ends.

When the count hits zero, the effect is removed and an expiry notice is whispered to the GM and the character's controller.


---

## Quick Start

1. Set up your turn order as normal before or during combat. The tracker must have tokens in the turn order for the script to work.
2. Type `!duration` in chat to open the effects report card.
3. When a character gains a timed effect, ensure their token is at the top of the turn order, then click **+ Add Effect to Active Character**.
4. Choose a color marker, enter the number of rounds, and name the effect.
5. Advance the turn order normally using Roll20's forward button — durations count down automatically.

---

## The Report Card

Typing `!duration` broadcasts a styled card showing all tokens with active effects. Each entry displays:

- The token's thumbnail image and character name
- Each active effect with its color marker, name, and remaining round count
- An **edit** button next to each effect

The card header includes three icon buttons:

| Button | Action |
|--------|--------|
| ∅ | Clear all effects (with confirmation prompt) |
| ? | Show the help card |
| ↻ | Refresh the report card |

---

## Adding Effects

Click **+ Add Effect to Active Character** at the bottom of the report card, or type:

```
!duration --add <marker> <rounds> <name>
```

You will be prompted for:
- **Color marker** — chosen from a dropdown of shape/colour emoji
- **Duration** — number of rounds (defaults to 10)
- **Effect name** — any text, including spaces (e.g. *Mage Armor*, *Concentration*)

The effect is added to whichever token is currently **at the top of the turn order**. Multiple effects can be stacked on a single token.

---

## Editing and Removing Effects

Click the **edit** button next to any effect in the report card. A prompt appears pre-filled with the current round count.

- Enter a new number to adjust the duration.
- Enter **0 or below** to remove the effect entirely.

---

## How Ticking Works

Track Duration responds to Roll20's turn order buttons:

- **Forward button** — when a token's turn ends and it moves to the bottom of the order, all its effects decrement by 1.
- **Backward button** — when the turn order is rewound and a token moves back to the top, all its effects increment by 1 (up to their original maximum).

This ensures that advancing and then immediately rewinding a turn is a net-zero operation — you cannot accidentally drain a duration by bouncing the turn order.

Ticking is **not** triggered by manual reordering of the turn order list.

---

## Expiry

When an effect reaches zero:

- It is removed from the token's name automatically.
- An expiry notice is whispered to the GM and to any player who controls that character.

---

## Map Changes and the Restore Panel

When the turn order is cleared — either by the GM manually or by using the ∅ button — Track Duration:

1. Strips all effect markers from tracked token names.
2. Broadcasts a **restore panel** to all players, listing every effect that was active at the time of clearing, along with a **Restore** button per entry.

To recover effects after moving to a new map:

1. Set up the new turn order (the character's new token must be on the turn order).
2. Click **Restore** next to the character's entry in the restore panel.

Track Duration will find the highest-initiative token for that character on the current turn order and re-attach all their effects.

---

## Commands Reference

The script is controlled through a Chat Menu, but here is a lost of the commands sent, in case anyone needs them for macro-building purposes.

| Command | Description |
|---------|-------------|
| `!duration` | Show the active effects report card |
| `!duration --add <marker> <rounds> <name>` | Add an effect to the top token |
| `!duration --edit <tokenId> <value> <name>` | Set an effect to a new value (used by the edit button) |
| `!duration --clear yes` | Clear all effects and broadcast the restore panel |
| `!duration --help` | Show the in-chat help card |

---

## Notes and Limitations

- Only tokens present in the **turn order** are tracked. Tokens on the board but not in the turn order are unaffected.
- The script is designed for use with Roll20's standard forward/backward turn order buttons. It does not respond to manual drag-and-drop reordering.
- The restore workflow expects the character to be on the **new map's turn order** before Restore is clicked.

---

## Author

Keith Curtis — [Patreon](https://www.patreon.com/c/KeithCurtis)
