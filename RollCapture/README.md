# RollCapture

Generic roll result extraction for Roll20. Listens to roll template messages, extracts values per configurable rules, and fires character abilities with captured values.

## Features

- Configurable capture rules via handouts tagged `[RollCapture]` or `[RC]`
- Conditional extraction (`when:`/`default:` blocks)
- Formulas: direct value, `max()`, `min()`, `sum()`, `choose()` (GM prompt)
- Character ability firing: `rc_any`, `rc_<rollname>`, `rc_default`
- `onCapture` API for programmatic consumers (e.g. Gaslight)
- `!rollcapture-ready` event for load-order-safe registration

## Quick Start

1. Install RollCapture
2. Run `!rollcapture dissect` then make a roll — shows all template fields and values (helps you write rules)
3. Run `!rollcapture rule D&D 5E Skills` to create a rule handout
4. Edit the handout with your capture rules
5. Run `!rollcapture reload`
6. Roll a skill check — captured values fire matching abilities

## Rule Format

Create a handout with `[RC]` or `[RollCapture]` in the name. Lines starting with `#` are comments.

```
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
```

### Fields

- `template:` — roll template name(s) to match (comma-separated)
- `name_field:` — template field containing the roll name
- `char_field:` — template field(s) for character identification
- `when: <pattern>` — condition block: if pattern found in content, use captures below
- `default:` — captures when no `when` condition matches
- Capture lines: `name: formula` — extract a value

### Field Resolution

Template fields like `{{r1=$[[2]]}}` map field name `r1` to `inlinerolls[2].results.total`. Formulas reference these field names directly.

### Formulas

- `fieldname` — direct value
- `max(a, b, ...)` — highest among present fields
- `min(a, b, ...)` — lowest among present fields
- `sum(a, b, ...)` — total of present fields
- `choose(a, b, ...)` — whisper GM with buttons to pick (auto-resolves if all equal)

Missing fields are dropped from functions, not set to 0.

## Character Abilities

After a capture, RollCapture checks the rolling character for abilities:

1. **`rc_any`** — fires on every capture
2. **`rc_<rollname>`** — fires for that specific roll (e.g. `rc_stealth`)
3. **`rc_default`** — fires only when no specific `rc_<rollname>` exists

Use `${rollname}` and `${capturename}` (e.g. `${result}`) in ability actions for value substitution.

## Commands

| Command | Description |
|---------|-------------|
| `!rollcapture` | Show help |
| `!rollcapture status` | Show status |
| `!rollcapture rules` | List loaded rules with links |
| `!rollcapture rule <name>` | Open or create a rule handout |
| `!rollcapture dissect` | Dissect the next roll (shows all fields and values) |
| `!rollcapture reload` | Reload rules from handouts |

## API (for other scripts)

```javascript
// Register for capture events (dedupes by sourceId)
RollCapture.onCapture('MyScript', function(event) {
    // event = { charName, rollName, captures, playerId, msg }
    log(event.rollName + ': ' + JSON.stringify(event.captures));
});
```

RollCapture emits `!rollcapture-ready` on init for load-order-safe registration.

## License

MIT
