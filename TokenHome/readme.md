# Token Home Script Help

The **Token Home** script allows tokens to store and recall multiple
named locations on the current page.
Each location records an X/Y position and the token’s layer.

Tokens can be sent back to saved locations, queried, or summoned to a selected
anchor point based on proximity.

- Store multiple locations per token (L1, L2, L3, …)
- Recall tokens to stored locations
- Preserve token layer when moving
- Summon tokens to a selected map object based on distance
- Compatible with tokens placed outside page bounds

**Base Command:** `!home`
**In-game Help Handout:** `!home --help`

---

## Primary Commands

- `--set` — Store the selected token’s current position as a location.
- `--L#` — Recall the selected token to a stored location.
- `--summon` — Pull tokens to a selected anchor based on proximity.
- `--clear` — Remove stored location data from selected tokens.
- `--help` — Open this help handout.

---

## Location Storage

Locations are identified by numbered slots:
`L1`, `L2`, `L3`, and higher.
There is no fixed upper limit.

- **L1** — Typically used as the token’s default location
- **L2** — Commonly used for Residence
- **L3** — Commonly used for Work
- **L4** — Commonly used for Encounter

Each stored location records:

- X position (pixels)
- Y position (pixels)
- Token layer

---

## Set Command

**Format:**
```
!home --set --L#
```

Stores the selected token’s current position and layer into location `L N`.

### Rules

- Exactly one token must be selected
- Existing data for that location is overwritten
- Page ID is not stored

### Examples

- `!home --set --l1` — Set default location
- `!home --set --l2` — Set residence
- `!home --set --l5` — Set custom location

---

## Recall Command

**Format:**
```
!home --L#
```

Moves the selected token to the stored location `L N`.

### Rules

- Exactly one token must be selected
- If the location does not exist, the command aborts
- The token’s layer is restored

### Examples

- `!home --l1`
- `!home --l3`

---

## Summon Command

The **summon** command pulls tokens toward a selected anchor object
based on proximity to their stored locations.

**Format:**
```
!home --summon [--L#] [--r pixels]
```

### Anchor Selection

Exactly one object of any of the following types must be selected:

- Token
- Text object
- Map pin
- Door
- Window

The selected object’s X/Y position is used as the summon target.

### Optional Arguments

- `--L#`  
  Restrict the summon to a specific stored location.

- `--r|pixels`  
  Maximum distance from the anchor.  
  Default: `300`.  
  Alternatively, the radius may be expressed in grid squares:  
  Default: `5g`.

### Behavior

- If `--L#` is supplied, only that location is tested
- If omitted, all stored locations are considered
- The closest matching location is used per token
- Distance is measured from the stored location, not current token position
- Tokens outside the radius are ignored

### Examples

- `!home --summon`
- `!home --summon --radius|210`
- `!home --summon --l2`
- `!home --summon --l4 --radius|140`

---

## Clear Command

**Format:**
```
!home --clear [--L#]
```

- If `--L#` is supplied, only that location is removed
- If omitted, all stored locations are removed

---

## General Rules

- All commands are GM-only
- Commands operate only on the current page
- Tokens may be placed outside page bounds
- Invalid arguments abort the command
