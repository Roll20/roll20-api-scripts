# ResourceTracker — User’s Guide (v0.5.6)

This guide shows GMs and players how to **track expendable resources** (arrows, javelins, charges) in Roll20 using ResourceTracker. You’ll learn setup, day‑to‑day use, ScriptCards integration, and how to keep token bars in sync.

> On startup the script whispers its status to the GM and how to open help: `!res help`.

---

## 1) Requirements

- **Roll20 Pro** (API access).
- The **ResourceTracker v0.5.6** script pasted into your game’s API scripts and saved.
- If the script is available in Roll20's "One-Click" option on the API Script page.

---

## 2) First‑Time Setup (GM)

1. **Enable the script** (first run is disabled):
   ```text
   !res enable
   ```

2. **Create a resource** for the selected character (e.g., Arrows with max 20):
   ```text
   !res create Arrows 20
   ```
   - Optional: set current different from max: `!res create Arrows 20 12`
   - Optional: add a rest tag: `!res create Arrows 20 rest=none|short|long`

3. **(Optional) Link a token bar** (e.g., bar2) so it mirrors the resource:
   ```text
   !res linkbar Arrows bar2
   ```
   - This auto‑creates/uses a character attribute `RT_Arrows` and links bar2 to it.
   - If a character has multiple tokens (duplicates across pages):  
     `!res linkbar Arrows bar2 all`

4. **(Optional) Configure what players see** (GM always sees everything):
   ```text
   !res config notify all      # default: players see all updates
   !res config notify recover  # players see only recover messages (with rolls)
   !res config notify none     # players see nothing (GM-only)
   ```

5. **(Optional) Player permission scope** (global):
   ```text
   !res config playermode partial   # default: use/list/menu/recover allowed
   # none  -> players cannot use the API
   # partial -> players: use, list, menu, recover
   # full  -> players: above + create/add/set/delete/thresh/resttag/reset/linkbar
   ```

6. **(Optional) Auto‑spend after attacks** (default ON). Map an attack name → resource:
   - Per‑character mapping (preferred):
     ```text
     !res automap add "Longbow" "Arrows" char="Sluggis"
     ```
   - Global fallback for everyone:
     ```text
     !res alias add "Longbow" "Arrows" cost=1
     ```

---

## 3) Everyday Use

### GM or Player (depending on permission mode)

- **Spend / Use**
  ```text
  !res use Arrows 1
  ```

- **Add**
  ```text
  !res add Arrows 5
  ```

- **Set current exactly**
  ```text
  !res set Arrows 12
  ```

- **List resources (for the selected character)**
  ```text
  !res list
  ```

- **Quick menu (buttons in chat)**
  ```text
  !res menu
  ```

- **Low‑resource threshold (optional)**
  ```text
  !res thresh Arrows 5
  ```

- **Rest tag (controls which resources reset on short/long rest)**
  ```text
  !res resttag Arrows none|short|long
  ```

- **Reset one or all to max**
  ```text
  !res reset Arrows
  !res reset all
  ```

- **Delete a resource**
  ```text
  !res delete Arrows
  ```

> Tip: You can target a specific character without selecting a token by adding a character argument:
> - By name: `char="Sluggis"`
> - By id (safe in macros): `charid=@{selected|character_id}`

---

## 4) Recovery with Breakage (and Visible Rolls)

Recover arrows/javelins after a fight, with a percent chance each one broke. The individual d100 **rolls are shown** to players if `notify=all` or `notify=recover`.

```text
!res recover Arrows 10 break=2
```
- Rolls 10× d100. Results ≤ 2 are broken (✗), others survive (✓).
- Applies up to your max. Overflow (extra survivors past max) is reported.
- Example output:
  - `Rolls: 14✓, 78✓, 2✗, 55✓, 1✗, 60✓, 33✓, 5✗, 94✓, 71✓`

**Set default breakage** (used when `break=` not provided):
```text
!res config recover 2
```

---

## 5) ScriptCards Integration

ResourceTracker is tolerant of ScriptCards’ argument prefixes (leading `_` and `--`). Use the `@` API call style:

**Spend 1 Arrow (by character id):**
```text
--@res|use _Arrows _1 _charid|@{selected|character_id}
```

**Recover 5 Arrows with 2% breakage:**
```text
--@res|recover _Arrows _5 _break|2 _charid|@{selected|character_id}
```

**Create and reset during setup:**
```text
--@res|create _Arrows _20 _charid|@{selected|character_id}
--@res|reset _Arrows _charid|@{selected|character_id}
```

**Notes**
- Name‑based targeting also works: `_char|"Sluggis"`
- Quoted names are accepted: `"Magic Arrows"`

---

## 6) Auto‑Spend from Attacks (Sheets or ScriptCards)

After an attack roll appears in chat, the script tries to detect:
1. **Character** (from rolltemplate fields like `{{character_id=...}}` / `{{character_name=...}}` or selected token).
2. **Attack name** (template fields like `{{rname=...}}`, `{{name=...}}`, etc.).
3. A mapping: **per‑character automap** (first) or **global alias** (fallback).

If found, it **spends** the mapped resource (default cost 1 or the alias’ `cost=`). It never auto‑creates resources—only spends if they exist.

**Examples (GM once per character or globally):**
```text
!res automap add "Longbow" "Arrows" char="Sluggis"
!res alias add "Longbow" "Arrows" cost=1
```

---

## 7) Token Bar Linking (Reliable)

Keep a token bar synced with a resource by linking it to an attribute `RT_<Resource>`:

```text
!res linkbar Arrows bar2
# for all tokens representing the same character:
!res linkbar Arrows bar2 all
```

- If a bar was previously linked to something else, this command re‑links it properly.
- The script also keeps the **underlying attribute** up to date even when no token is selected, so values stay correct.

**Troubleshooting bar sync**
- If the bar doesn’t move, re‑issue `linkbar`.
- In the token UI, the bar should show it’s linked to `RT_Arrows` (or your resource name).

---

## 8) Player Visibility & Permissions (GM)

### Player notification modes (what players see)
```text
!res config notify all      # players see all updates
!res config notify recover  # players see only recover messages (with rolls)
!res config notify none     # players see nothing; GM still sees everything
```

### Player command permissions (what players can do)
```text
!res config playermode none|partial|full
```
- `none` — players cannot use the API.
- `partial` — players can `use`, `list`, `menu`, `recover`.
- `full` — players can also `create`, `add`, `set`, `delete`, `thresh`, `resttag`, `reset`, `linkbar`.

> Non‑GMs must **control the character** to act on it.

---

## 9) Common Errors & Fixes

- **“Select a token…”**  
  Add a character argument: `char="Name"` or `charid=@{selected|character_id}`.

- **“Usage: …” messages**  
  You missed a required argument. Copy the example exactly and try again.

- **Bars not updating**  
  Re‑link: `!res linkbar <name> <barN> [all]` and confirm the bar shows `RT_<name>`.

- **Auto‑spend didn’t fire**  
  Ensure the attack name matches your `automap`/`alias`, and the resource exists for that character.

- **Players don’t see updates**  
  Check `!res config notify` and confirm they control the character and are online.

- **Resetting max**  
  Re‑run `!res create <name> <newMax> [current]` to overwrite max (and current if provided).

---

## 10) Quick Reference (cheat sheet)

```text
# Enable/disable
!res enable
!res disable
!res status

# Create / spend / add / set
!res create Arrows 20
!res use Arrows 1
!res add Arrows 5
!res set Arrows 12

# Recover with breakage (shows rolls to players if notify allows)
!res recover Arrows 10 break=2

# List & menu
!res list
!res menu

# Threshold & rest tag
!res thresh Arrows 5
!res resttag Arrows short

# Reset
!res reset Arrows
!res reset all

# Link token bar
!res linkbar Arrows bar2
!res linkbar Arrows bar2 all

# Automap / alias (auto-spend on attacks)
!res automap add "Longbow" "Arrows" char="Sluggis"
!res alias add "Longbow" "Arrows" cost=1

# Visibility & permissions
!res config notify all|recover|none
!res config playermode none|partial|full
```

---

## 11) FAQ

**Q: Can players recover items themselves?**  
A: Yes—if `playermode` allows it. Recover shows the individual d100 rolls when `notify` is `all` or `recover`.

**Q: Do I have to select a token?**  
A: No. Add `char="Name"` or `charid=@{selected|character_id}`. Selecting a represented token also works.

**Q: How do I reset the total number of arrows?**  
A: Run `!res create Arrows <newMax> [current]`. This replaces the stored max (and current if provided).

**Q: Does it work with ScriptCards?**  
A: Yes. The parser accepts underscore/dash-prefixed args and quoted strings. See Section 5 for examples.

**Q: Will bars update even if no token is selected?**  
A: Yes—current/max are written to `RT_<Resource>` and any linked token bars follow.

---

## 12) Support

*Scripts are provided 'as-is', without warranty of any kind, expressed or implied.*

Any issues while using this script, need help using it, or if you have a neat suggestion for a new feature, please shoot me a PM: https://app.roll20.net/users/2447959/joeuser

If you enjoy the tool, feedback is welcome. It helps prioritize QoL improvements for both GMs and players.

Patreon: https://www.patreon.com/c/joeuser
