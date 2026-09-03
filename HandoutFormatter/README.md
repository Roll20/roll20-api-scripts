# Handout Formatter

Handout Formatter is a Mod Script that takes the plain text you've already written and formatted in a handout's Notes or GM Notes and dresses it up to look like a real prop from your game world — an old letter, a wanted poster, a torn journal page, whatever fits the scene. You can also use it to match your game system's theme instead of looking like plain, unstyled text. Your original writing is never touched — the styling sits on top of it, and can be swapped or removed again at any time.

As an added bonus, if you click "Remove Styling", the script will clean up HMTL garbage from other programs, removing stuff added by things like MS Word. It also fixes a host of styling bugs introduced by the Roll20 text editor, like oversize quotes, or header styles that won't release.



A few things people might use it for:

- A handwritten letter or diary page for a journal-keeping character
- A page from an old book
- A wanted poster, tavern notice, or other in-world prop
- Giving every handout in a game — not just one — the same consistent, system-appropriate look. It ships with a 5e style, and has instructions on how to pick up a PF2 style.
- Cleaning up text pasted from outside sources
- Style hadouts can be transmogrified, or the style itself can be shared as a text file — the in-game help system has a link to at least ten more styles.



## Installation

Install via Roll20's One-Click API script install (search "Handout Formatter"), or copy `HandoutFormatter.js` into your game's API Scripts page manually. The script creates its own control panel handout ("Handout Formatter"), a help handout ("Help: Handout Formatter"), and four built-in style handouts (`Parchment_css`, `5e_css`, `Book_css`, `Computer_css`).

## Quick start

1. Type `!formathandout` in chat, or click the "?" button in the panel, to open the control panel.
2. Click a handout in the list on the left to select it — use Recent, the A-Z strip, or Search if the list is long.
3. Choose Notes or GM Notes with the toggle in the header.
4. Pick a style under "Preview Style" and check the preview at the bottom of the panel — it shows what the selected handout *would* look like with that style, not necessarily what it's using right now. Click the small open icon next to "Preview" to see the handout's real, current appearance in Roll20.
5. Click Apply. Remove Styling, or applying a different style, can always change or undo it later.

## Commands

Everything beyond these two commands is click-driven from inside the control panel — there's no need to memorize or type anything else by hand.

| Command | Effect |
| --- | --- |
| `!formathandout` | Opens the control panel. |
| `!formathandout --help` | Opens the in-game help handout. |

## Styles are just handouts

Every style is a plain CSS handout named `<Name>_css` (for example `Parchment_css`). Open it like any other handout to read or edit its CSS directly, no special editor needed.

**Built in (created automatically):** Parchment, 5e, Book, Computer.

**Additional ready-made styles:** Monument, Notebook, Letter, Newspaper, Wanted, Dossier, Chalkboard, Journal, Scroll, PF2 — CSS for each is in [`style-library.md`](style-library.md) in this folder. Copy a style's CSS into a handout named to match (e.g. `Monument_css`) and it appears in the picker automatically.

To add a style of your own, create a handout named `YourStyleName_css` and write CSS into its Notes field. No restart needed; the style is available as soon as you save it. New to CSS? [Codecademy's free course](https://www.codecademy.com/learn/learn-css) is a good place to start.

**Edit Mode:** the "Edit" button next to "Preview Style" turns every style button into a direct link to that style's `_css` handout, so you can jump straight to editing its CSS instead of hunting for it in the main list.

## Keeping styled content in sync

If a styled handout's Notes/GM Notes gets hand-edited afterward (say, with Roll20's own rich-text toolbar), the stored styling and the source text can drift apart. The panel's "Unsynced" filter finds every handout in that state; "Sync All" re-applies each one's bound style to bring it back in line in one click.

## Works well with: Image Editor

[Image Editor](https://app.roll20.net/forum/post/12716858/script-image-editor-format-images-add-captions-and-flow-text-in-roll20-handouts) is a separate script that controls how images inside a handout are placed, flow with the text, and get captioned. If it's installed, an "Image Editor" button appears in this panel's header to jump straight to it.

## Compatibility

Handout Formatter only reads and writes handouts (Notes, GM Notes, name, and tags) — it does not touch tokens, characters, chat archives, or any other object type, and has no dependencies on other scripts.

## Author

Keith Curtis — [roll20.net profile](https://app.roll20.net/users/162065/keithcurtis) · [Patreon](https://www.patreon.com/c/KeithCurtis)
