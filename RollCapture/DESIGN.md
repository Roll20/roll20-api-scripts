# RollCapture — Design Document

## Concept

RollCapture monitors chat for roll results, extracts numeric values based on configurable rules, and stores them on tokens (gmnotes) or character attributes. It operates silently in the background — other scripts (like Gaslight) react to the stored values via change events.

## Use Cases

- Store stealth rolls per-token for perception-based visibility scripts
- Track damage dealt for combat logging
- Record saving throw results for automated status effects
- Feed roll results into conditional automation systems

## Architecture

### Capture Rules

Rules are defined in handouts tagged `[RC]` (Roll Capture). Each handout defines one capture rule set.

### Rule Format

```
---ROLLCAPTURE---
template: npc, simple
name_field: rname
char_field: name, charname
value: r1=0, r2=1
normal: {{normal=1}} → r1
advantage: {{advantage=1}} → max(r1,r2)
disadvantage: {{disadvantage=1}} → min(r1,r2)
always: {{always=1}} → max(r1,r2)
variable: gl_${rname}
storage: gmnotes
```

Fields:
- `template` — roll template name(s) to match (comma-separated)
- `name_field` — template field containing the roll name (e.g. skill name)
- `char_field` — template field(s) for character identification (comma-separated, tried in order)
- `value` — maps symbolic names to inline roll indices (e.g. `r1=0` means "r1 is inlinerolls[0].results.total")
- `normal/advantage/disadvantage/always` — condition pattern → extraction formula
- `variable` — gl_ field name pattern. `${rname}` substitutes the matched roll name, cleaned (lowercase, stripped)
- `storage` — `gmnotes` (per-token) or `attribute` (per-character). Default: `gmnotes`

### Extraction Logic

1. Check `msg.rolltemplate` against rule's `template` list
2. Parse `msg.content` for `{{field=value}}` pairs
3. Check which advantage flag is present → select extraction formula
4. Resolve formula: `r1` → `msg.inlinerolls[0].results.total`, `max(r1,r2)` → `Math.max(inlinerolls[0], inlinerolls[1])`
5. Determine variable name: substitute `${rname}` with cleaned roll name
6. Store value

### Token Association

1. `msg.selected[0]` — if a token is selected, store on it
2. Character lookup — if `char_field` matches a character name, find tokens representing that character
3. Scope-aware ambiguity:
   - If only `storage: attribute` rules use this field → store on character (no token needed)
   - If `storage: gmnotes` rules exist AND multiple tokens represent same character → prompt GM
4. Queue unresolved captures — whisper GM with clickable assignment buttons

### Name Cleaning

`${rname}` from `{{rname=^{stealth}}}` needs cleaning:
- Strip `^{` and `}` (translation key wrappers)
- Strip `-u` suffix (uppercase variant marker)
- Lowercase
- Result: `stealth`

So `gl_${rname}` → `gl_stealth`

### API

```javascript
RollCapture.getCapturedValue(tokenId, fieldName)  // read latest captured value
RollCapture.getLastCapture()                       // most recent capture result
RollCapture.registerRule(ruleObj)                   // programmatic rule registration
```

### Events / Integration

After storing a value:
- If `storage: gmnotes` → manually fire `change:graphic:gmnotes` won't work (API set doesn't trigger)
- Instead: expose a callback/hook that other scripts register for: `RollCapture.onCapture(fieldName, callback)`
- Gaslight registers: `RollCapture.onCapture('gl_*', evaluateTriggeredPins)`

### Dependencies

None required. Optional integration with:
- Gaslight (consumes captured values)
- Fetch (gl_ compProps for reading stored values)

### D&D 5E Default Rule

Ships with a pre-built `[RC] D&D 5E Skills` handout:
```
---ROLLCAPTURE---
template: npc, simple
name_field: rname
char_field: name, charname
value: r1=0, r2=1
normal: {{normal=1}} → r1
advantage: {{advantage=1}} → max(r1,r2)
disadvantage: {{disadvantage=1}} → min(r1,r2)
always: {{always=1}} → max(r1,r2)
variable: gl_${rname}
storage: gmnotes
```

### Open Questions

1. Should rules be hot-reloaded when handouts change, or require a `!rollcapture reload`?
2. How to handle sheets that don't use Roll20's standard `{{field=value}}` format?
3. Should there be a capture history (last N rolls per token)?
4. Command interface: `!rollcapture status`, `!rollcapture rules`, `!rollcapture clear`?
5. Should the script auto-detect which character sheet is in use and suggest rules?

## Example Capture Rules

### D&D 5E Skills
```
---ROLLCAPTURE---
template: npc, simple
name_field: rname
char_field: name, charname
value: r1=0, r2=1
normal: {{normal=1}} → r1
advantage: {{advantage=1}} → max(r1,r2)
disadvantage: {{disadvantage=1}} → min(r1,r2)
always: {{always=1}} → max(r1,r2)
variable: gl_${rname}
storage: gmnotes
```

### Savage Worlds
```
---ROLLCAPTURE---
template: roll
name_field: trait
char_field: name
value: skill=0, wild=1
default: max(skill, wild)
variable: gl_${trait}
storage: gmnotes
```

### Shadow of the Demon Lord
```
---ROLLCAPTURE---
template: sotdl
name_field: roll-label
char_field: name, title
value: roll=0
default: roll
variable: gl_${roll-label}
storage: gmnotes
```

### Warhammer Fantasy Roleplay 4E
```
---ROLLCAPTURE---
template: wfrp
name_field: roll_name
char_field: name
value: roll=0
default: roll
variable: gl_${roll_name}
storage: gmnotes
```

### Call of Cthulhu 7E
```
---ROLLCAPTURE---
template: coc-dice-roll
name_field: name
char_field: name
value: roll=0
default: roll
variable: gl_${name}
storage: gmnotes
```
