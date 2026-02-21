# Fade

Fade smoothly transitions graphics between 0% and 100% opacity over a specified time.

---

## Commands

!fade --in|<seconds>
!fade --out|<seconds>
!fade --in --all
!fade --out --all

**<seconds>** is optional (default: 1).  
**--all** affects all graphics on the current page.

### Examples
!fade --out|5 → Fade selected graphics to 0% over 5 seconds
!fade --in|3 → Fade selected graphics to 100% over 3 seconds
!fade --in --all → Fade in all graphics on the page over 1 second

---

## Features
- All graphics fade simultaneously
- Works on all layers
- Ignores graphics already at target opacity
- Silent operation (no chat spam)

---

## Usage Notes
- If no graphics are selected, `--all` is required.
- Page detection uses the player's last viewed page or the GM's active page.