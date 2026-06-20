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
when: {{advantage=1}}
attack: max(r1, r2)
damage: sum(dmg1, dmg2, globaldamage)
when: {{disadvantage=1}}
attack: min(r1, r2)
damage: sum(dmg1, dmg2, globaldamage)
when: {{always=1}}
attack: choose(r1, r2)
damage: sum(dmg1, dmg2, globaldamage)
default:
attack: r1
damage: sum(dmg1, dmg2, globaldamage)
variable: gl_${rname}_${capture}
```

Fields:
- `template` — roll template name(s) to match (comma-separated)
- `name_field` — template field containing the roll name (e.g. skill/weapon name)
- `char_field` — template field(s) for character identification (comma-separated, tried in order)
- `when: <pattern>` — condition block: if pattern found in content, use the captures that follow
- `default:` — captures to use when no `when` condition matches
- `<capture_name>: <formula>` — after a `when:` or `default:`, any non-keyword line is a capture
- `variable` — gl_ field name pattern. `${rname}` = roll name, `${capture}` = capture name

Consumers (e.g. Gaslight) decide where to store captured values (token gmnotes, character attribute, or both) based on their own configuration.

### Field Name Resolution

Template content uses `{{field=$[[N]]}}` patterns. Formulas reference field names (e.g. `r1`, `dmg1`), which resolve to inline roll indices by parsing the content:
- `{{r1=$[[2]]}}` → `r1` = `inlinerolls[2].results.total`
- `{{dmg1=$[[6]]}}` → `dmg1` = `inlinerolls[6].results.total`
- Raw `rN` without a matching template field falls back to `inlinerolls[N].results.total`

### Formula Language

- `r1` — value of a single field
- `max(r1, r2, ...)` — highest value among fields
- `min(r1, r2, ...)` — lowest value among fields
- `sum(r1, r2, ...)` — total of all fields
- `choose(r1, r2, ...)` — whisper GM with buttons to pick

**Missing fields:** If a field referenced in a formula doesn't exist in the content, it is dropped from the function (not set to 0). This prevents interference with min/max/choose.

### Capture Semantics

- `attack: r1` — store the resolved value
- `attack:` (empty formula) — clear/unset the captured variable
- Capture name not listed in a block — don't touch, leave previous value

### Multi-Variable Capture

One rule can capture multiple variables from a single roll. Each `when:`/`default:` block can define any number of captures. The `variable` pattern uses `${capture}` to differentiate:
- `variable: gl_${rname}_${capture}` with captures `attack` and `damage` and rname `Scimitar`
- Produces: `gl_scimitar_attack` and `gl_scimitar_damage`

### Block Parsing (No Indentation Required)

Lines after `when:` or `default:` are treated as captures until the next `when:`, `default:`, or known keyword (`template:`, `name_field:`, `char_field:`, `variable:`, `storage:`). No indentation sensitivity.

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
when: {{advantage=1}} => max(r1, r2)
when: {{disadvantage=1}} => min(r1, r2)
when: {{always=1}} => choose(r1, r2)
default: r1
variable: gl_${rname}
```

### Savage Worlds
```
---ROLLCAPTURE---
template: roll
name_field: trait
char_field: name
value: skill=0, wild=1
when: {{wildcard=1}} => max(skill, wild)
default: skill
variable: gl_${trait}
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
```
