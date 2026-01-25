New Script:
# FixTurnOrder

You call out “Roll initiative!” and then realize the Turn Tracker is a museum exhibit. Half the entries are from a fight three rooms ago, some forgotten goblin is still somehow in the order, and now you’re squinting at the list trying to remember what’s real. Now it’s a debate: which entries are new, which are old, and fistfights are breaking out between the fumblers who want to re-roll, and the critters who want you to just fix it. The table waits while you perform turn-order archaeology, and the tension drains out of the scene.

**FixTurnOrder** is a GM-only Roll20 API script that helps clean up the Turn Order when it contains leftover token entries from other pages because you forgot to clear the tracker.

## What It Does

When run, the script checks the Turn Order and compares each token entry to the current player page. Any turns belonging to tokens that are not on the active page are listed in a clear chat report, grouped by the page they came from.

From that report, the GM can:

- Delete all off-page turns from a specific page at once  
- Delete individual off-page turns one by one  

Nothing happens automatically. The script only runs when invoked, and no Turn Order entries are removed unless the GM clicks a button.

## What It Does *Not* Do

- It does not monitor the game continuously  
- It does not remove turns for tokens on the current player page  
- It does not affect custom Turn Order items that are not tied to tokens (such as lair actions, round counters, or reminders)

## Usage

**Base Command:** `!fixturnorder`

Running the command opens an interactive chat report with buttons to review and clean up off-page turns.

This script is to help GMs who want a simple, safe way to clean up forgotten Turn Order entries without disrupting the current encounter or custom tracker items.