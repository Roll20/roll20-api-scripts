# Gaslight Scripting — Design Document

## Concept

A reactive automation layer within Gaslight that evaluates conditions per-player and applies per-player actions (show/hide/set properties). Scripts are stored in handouts, activated per-page via pins, and triggered automatically when referenced values change.

## Motivating Example

A stealthing creature should be invisible to players whose passive perception is below the creature's stealth roll, and visible to those who meet or exceed it:

```
if target.stealth_result > viewer.passive_perception:
  set target.baseOpacity = 0
else:
  set target.baseOpacity = 1
```

## Architecture

### Storage

- **Handout** (notes or gmnotes) = the reusable script logic
- **Pin** on a page = "this script is active here"
  - `link` → handout ID
  - `gmNotes` → pin-specific configuration (scope, filter, trigger rules)

### Scope (configured per-pin)

The pin's gmNotes declares how the script iterates:

- `scope: token` — runs for each individual token on the page. Per-token data stored in token gmnotes.
- `scope: character` — runs once per character, applies to all tokens of that character. Data stored as character sheet attributes.

### Targets (configured per-pin)

Filter which tokens/characters the script evaluates against:

- `filter: npc` — only tokens not controlled by any player
- `filter: has <field>` — only tokens/characters with a specific field set
- `filter: tag <tagname>` — only characters with a specific tag
- `filter: all` — every token on the page
- Custom filter expressions (v2)

### Variables

Two namespaces resolved by Gaslight:

- `target.*` — the token/character being evaluated
  - Resolved from gmnotes (scope: token) or character attribute (scope: character)
  - Also includes standard token properties and character attributes
- `viewer.*` — the player whose page we're evaluating
  - Represents the viewing PLAYER, not a single token
  - A player may control multiple tokens on their page
  - `viewer.*` attribute references iterate over each controlled token by default ("each" semantics)
  - If ANY viewer token's evaluation passes, the action applies (most permissive wins)
  - Aggregation functions available: `max(viewer.passive_perception)`, `min(...)`, `any(...)`, `all(...)`
  - `all(...)` requires every viewer token to pass
  - Player-level properties (viewer.id, viewer.name, viewer.page) are singular, not iterated
  - Party-tagged tokens may be used as a narrowing hint but do NOT guarantee a single token

### Integration with Meta-Toolbox

**Required dependencies:**
- ZeroFrame — ensures processing order
- Fetch — attribute/property resolution; extended by Gaslight via compProps
- Muler — context variable injection (viewer identity)

**Optional:**
- APILogic — if/elseif/else conditionals
- MathOps — inline math

**Fetch extension:**
Gaslight registers computed properties on `Fetch.CustomPropsByType.graphic.compProps` at startup. These read from a module-level context variable set during evaluation:

```javascript
// Pseudocode
let evaluationContext = { target: null, viewer: null, scope: 'token' };

Fetch.CustomPropsByType.graphic.compProps.stealth_result = {
    nicks: ['stealth_roll'],
    val: (o) => {
        if (evaluationContext.scope === 'token') return readGmNotesField(o.gmnotes, 'stealth_result');
        else return getAttrByName(o.represents, 'stealth_result');
    }
};
```

**Muler injection:**
Before each evaluation pass, Gaslight sends a Muler set command to establish viewer context variables.

### Triggers

Scripts auto-trigger based on:

1. **Attribute change** — parsed from script references. If the script mentions `target.stealth_result`, Gaslight watches for changes to that field.
2. **Token property change** — if the script references `target.baseOpacity`, watch `change:graphic:baseOpacity`.
3. **Chat roll capture** — configured in pin gmNotes. Matches roll results from chat by pattern/template name, stores the result, which triggers #1.
4. **Manual** — `!gaslight eval <script_name>` forces re-evaluation.

### Chat Roll Capture

**Trigger rule** (in pin gmNotes):
```
trigger: roll "Stealth" → stealth_result
```

**Resolution order:**
1. Selected token at time of roll → store result on that token
2. Ambiguous (none/multiple selected, not enough rolls) → queue and prompt GM with clickable buttons
3. Future: apply to all tokens of that character (configurable)

**Storage:**
- `scope: token` → writes to token gmnotes: `stealth_result: <value>`
- `scope: character` → writes to character attribute: `stealth_result = <value>`

### Evaluation Flow

For each trigger event:
1. Identify which scripts are affected (which pins reference the changed field)
2. For each affected script, for each player page:
   a. Set module-level `evaluationContext` (target token, viewer player)
   b. Inject viewer context via Muler
   c. `sendChat` the script content through ZeroFrame/Fetch/APILogic pipeline
   d. Target script (e.g. token-mod) executes the resulting command

### Pin gmNotes Format

```
---GASLIGHT-SCRIPT---
scope: token
filter: has stealth_result
trigger: roll "Stealth" → stealth_result
```

### Handout Format

The handout notes/gmnotes contain commands using standard Meta-Toolbox syntax:

```
{& if @(target.stealth_result) > @(viewer.passive_perception)}
!token-mod --ids @(target.token_id) --set baseOpacity|0
{& else}
!token-mod --ids @(target.token_id) --set baseOpacity|1
{& end}
```

## Open Questions

1. How do we detect which fields a script references for auto-trigger registration? Regex parse of `@(target.*)` and `@(viewer.*)` patterns?
2. Should scripts support multi-line (multiple commands per evaluation)? If so, do they execute sequentially or as one batch?
3. How to handle script errors gracefully (bad syntax, missing attributes)?
4. Should there be a "dry run" mode for testing scripts without applying changes?
5. Performance: how many change:attribute listeners is too many? Should we debounce?
6. Can a script reference other scripts (composition/chaining)?
7. Should we support `@(target.*)` for token properties that Fetch already handles (left, top, bar1_value)? Or only for gaslight-managed fields?

## Future Ideas

- Visual script editor (handout with structured format)
- Script debugging/logging mode
- Conditional FX (play effects based on script results)
- Script templates (pre-built stealth, darkvision, illusion scripts)
- Event history (log of what changed and why)
