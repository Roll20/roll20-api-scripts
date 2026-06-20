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

Lines after `when:` or `default:` are treated as captures until the next `when:`, `default:`, or known keyword (`template:`, `name_field:`, `char_field:`, `variable:`). No indentation sensitivity.

### Extraction Logic

1. Check `msg.rolltemplate` against rule's `template` list
2. Parse `msg.content` for `{{field=$[[N]]}}` pairs → builds field-to-index map
3. Parse `msg.content` for `{{field=value}}` pairs → builds flag map
4. Check `when:` conditions against flag map → select matching capture block
5. Resolve formula: field names map to `inlinerolls[N].results.total` via the index map. Missing fields are dropped from functions.
6. Determine variable name: substitute `${rname}`, `${capture}` with cleaned values
7. Emit via `onCapture` callback

### Token Association

1. Character lookup — if `char_field` matches a character name, find tokens representing that character on the current page
2. If multiple tokens represent same character → prompt GM or let consumer decide
3. Queue unresolved captures — whisper GM with clickable assignment buttons

### Name Cleaning

`${rname}` from `{{rname=^{stealth}}}` needs cleaning:
- Strip `^{` and `}` (translation key wrappers)
- Strip `-u` suffix (uppercase variant marker)
- Lowercase
- Result: `stealth`

So `gl_${rname}_${capture}` → `gl_stealth_attack`

### API

```javascript
RollCapture.getCapturedValue(tokenId, fieldName)  // read latest captured value
RollCapture.getLastCapture()                       // most recent capture result
RollCapture.registerRule(ruleObj)                   // programmatic rule registration
RollCapture.onCapture(pattern, callback)           // register consumer callback
```

### Events / Integration

After capturing a value:
- Expose a callback/hook that other scripts register for: `RollCapture.onCapture('gl_*', callback)`
- Gaslight registers: `RollCapture.onCapture('gl_*', evaluateTriggeredPins)`
- Consumer decides storage (gmnotes, attributes, or both)

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
when: {{advantage=1}}
result: max(r1, r2)
when: {{disadvantage=1}}
result: min(r1, r2)
when: {{always=1}}
result: choose(r1, r2)
default:
result: r1
variable: gl_${rname}_${capture}
```

### D&D 5E Attack + Damage
```
---ROLLCAPTURE---
template: atkdmg
name_field: rname
char_field: charname
when: {{always=1}}
attack: choose(r1, r2)
damage: sum(dmg1, dmg2, crit1, crit2, globaldamage, globaldamagecrit)
when: {{advantage=1}}
attack: max(r1, r2)
damage: sum(dmg1, dmg2, crit1, crit2, globaldamage, globaldamagecrit)
when: {{disadvantage=1}}
attack: min(r1, r2)
damage: sum(dmg1, dmg2, crit1, crit2, globaldamage, globaldamagecrit)
default:
attack: r1
damage: sum(dmg1, dmg2, crit1, crit2, globaldamage, globaldamagecrit)
variable: gl_${rname}_${capture}
```

### Savage Worlds
```
---ROLLCAPTURE---
template: roll
name_field: trait
char_field: name
default:
result: max(skill_roll, wild_die)
variable: gl_${trait}_${capture}
```

### Shadow of the Demon Lord
```
---ROLLCAPTURE---
template: sotdl
name_field: roll-label
char_field: name, title
default:
result: roll
variable: gl_${roll-label}_${capture}
```

### Warhammer Fantasy Roleplay 4E
```
---ROLLCAPTURE---
template: wfrp
name_field: roll_name
char_field: name
default:
result: roll
variable: gl_${roll_name}_${capture}
```

### Call of Cthulhu 7E
```
---ROLLCAPTURE---
template: coc-dice-roll
name_field: name
char_field: name
default:
result: roll
variable: gl_${name}_${capture}
```
