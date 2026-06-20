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
  - `link` → handout ID (or empty for self-contained pin scripts)
  - `gmNotes` → pin-specific configuration (scope, filter, trigger rules). Inherits from linked handout's GM notes by default unless desynced.
  - Pin `notes` can contain the script itself for self-contained one-off scripts (no handout needed)

### Pin Placement

- **Pin on master page** → script evaluates for ALL viewers (normal case)
- **Pin on a player page** → script evaluates for ONLY that player (per-player override/special effect)
  - Use case: hallucinations, player-specific illusions, per-player narrative moments
  - Consistent with Gaslight's master/player-page distinction

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

Two primary namespaces resolved by Gaslight:

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
- `gm.*` — targets the master page (opt-in)
  - If the script references `gm.*`, the script also evaluates on master page
  - If only `viewer.*` is referenced, master page is untouched
  - Use case: GM-side indicators (e.g. transparent overlay to show stealth status)

### Integration with Meta-Toolbox

**Required dependencies:**
- ZeroFrame — ensures processing order
- Fetch — attribute/property resolution; extended by Gaslight via compProps
- Muler — context variable injection (viewer identity)

**Optional:**
- APILogic — if/elseif/else conditionals
- MathOps — inline math

**Fetch extension:**
Gaslight registers computed properties on `Fetch.CustomPropsByType.graphic.compProps` when script handouts are created or modified. Properties use the `gl_` prefix as a namespace. Resolution depends on evaluation context (scope):

- `scope: token` → reads from token gmnotes field `gl_<fieldname>: <value>`
- `scope: character` → reads from character attribute named `gl_<fieldname>`

Convention: the `gl_` prefix is used consistently everywhere — in gmnotes, character attributes, AND script references. No stripping.

```javascript
// Registered dynamically per gl_ field found in active scripts
Fetch.CustomPropsByType.graphic.compProps['gl_stealth_result'] = {
    nicks: [],
    val: (o) => {
        if (evaluationContext.scope === 'token') {
            return readGmNotesField(o.gmnotes, 'gl_stealth_result');
        } else {
            return getAttrByName(o.represents, 'gl_stealth_result');
        }
    }
};
```

Script reference: `@(target.gl_stealth_result)`

CompProps are registered at handout creation/modification time — Gaslight watches `change:handout` and `add:handout`, scans the content for `gl_*` references, and registers any new compProps. This ensures they're ready before any evaluation fires.

**Muler injection:**
Before each evaluation pass, Gaslight sends a Muler set command to establish viewer context variables (viewer.id, viewer.name, viewer.page, etc.).

### Triggers

**Auto-detection (default):**
Gaslight parses the script and identifies references inside conditional blocks (`{& if}` ... `{& end}`). Only condition inputs are watched — action outputs (inside `!` command lines) are NOT triggers. This prevents infinite loops.

**Manual override (pin gmNotes):**
```
trigger: auto                        ← default, derive from conditions
trigger: manual only                 ← only fires via !gaslight eval
trigger: on change gl_stealth_result ← explicit field watch (additive)
trigger: on roll "Stealth"           ← chat roll capture
trigger: ignore passive_perception   ← exclude from auto-detection
```

Multiple trigger lines are additive. `manual only` disables all auto-triggers.

**Manual evaluation:**
- `!gaslight eval` (with pins selected) — evaluate selected pins
- `!gaslight eval <handout_name>` — evaluate all pins linked to that handout
- `!gaslight eval --all` — re-evaluate all active pins

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

## Resolved Questions

1. **Field detection for auto-triggers:** Regex parse `@(target.gl_*)` and `@(viewer.*)` patterns inside `{& if}` blocks. Basic bracket matching to distinguish conditions from actions.

2. **Multi-line scripts:** Yes. Multiple commands per evaluation, executed sequentially. APILogic likely handles this natively.

3. **Error handling:** Try/catch around our resolution/sendChat phase. Whisper GM on errors (missing attributes, bad pin config, missing handout). Downstream script errors are outside our control.

4. **Dry run:** `!gaslight eval --dry` (pins selected). Shows resolved commands and affected tokens without applying.

5. **Performance:** Single `on('change:attribute')` handler with a trigger map for O(1) lookup:
   ```
   triggerMap = {
       'gl_stealth_result': [{ pinId, handoutId, scope }],
       'passive_perception': [{ pinId, handoutId, scope }]
   };
   ```
   Built at handout parse time. Rebuilt on handout change. Debounce per-script (100ms).

6. **Script composition:** Deferred to v3. Scripts are self-contained for now.

7. **Standard token properties:** Fetch handles natively. We only register `gl_*` compProps.

## Roll Capture

### Concept

Roll capture is a separate system from script evaluation. It monitors chat for roll results, extracts values, and stores them in `gl_*` fields (gmnotes or character attributes). This storage then triggers script re-evaluation via the normal trigger map.

Roll capture rules are defined in handouts (tagged `[GLS]` for discoverability). The system runs silently in the background — no special trigger syntax needed in script pins.

### Capture Rule Handout

A capture rule handout defines:

1. **Identification** — how to recognize a specific kind of roll in chat (roll template name, content pattern, regex)
2. **Value extraction** — which inline roll result to capture (by index, by field name, advantage/disadvantage handling)
3. **Variable name** (optional) — which `gl_*` field to store it in. If omitted, derived from the roll name (e.g. "Stealth" → `gl_stealth`)
4. **Character identification** (optional) — how to determine which character the roll belongs to. May be auto-detected from `msg.content` character references.

### Format (TBD)

```
---GLS-CAPTURE---
match: rolltemplate "atk" where {{name}} contains "Stealth"
extract: inline_roll[0].total
advantage: highest
variable: gl_stealth_result
```

Or a simpler generic form:
```
---GLS-CAPTURE---
match: rolltemplate "simple" 
name_field: {{rname}}
extract: inline_roll[0].total
variable_prefix: gl_
```

This generic form captures ANY "simple" template roll and maps it to `gl_<rname>`.

### Value Extraction Challenges

- **Advantage/Disadvantage** (D&D 5E): Two d20s rolled, result depends on token state. Options:
  - Always take `inline_roll[0].total` (the final computed result after sheet logic)
  - Configurable: `extract: highest`, `extract: lowest`, `extract: first`, `extract: inline_roll[N].total`
  - Sheet-specific: different sheets encode advantage differently

- **Multiple rolls in one message**: Capture rule specifies which roll by index or by position in template

### Token Association

When a capture rule matches a roll:

1. **Selected token** (default) — `msg.selected[0]` identifies the token. Store on that token.
2. **Character-level context check** — if ALL active scripts using this `gl_*` field are `scope: character`, store on the character attribute (no token ambiguity issue).
3. **Ambiguity** — if at least one script uses `scope: token` AND no token is selected (or multiple are selected without enough rolls):
   - Whisper the GM: "Stealth roll of 14 captured. Select a token to assign it to, or roll X more times for Y tokens."
   - Provide clickable buttons per eligible token
   - Queue the result until assigned
4. **Character fallback** — if the roll message identifies a character (via template content like `{{charname=Goblin}}`), and no token-level scripts exist for this field, store directly on the character attribute.

### Auto-Detection vs Custom Handouts

- **Custom handouts** (v1): GM writes capture rules as `[GLS]` handouts. Full control over pattern matching.
- **Auto-generation** (v2): Gaslight analyzes the character sheet template(s) in use and auto-generates capture rules in memory. No handout needed for common rolls.

### Capture Flow

1. `on('chat:message')` — check all capture rules against message
2. If match: extract value, determine character, determine token (if needed)
3. Store: write to `gl_*` in gmnotes (scope: token) or character attribute (scope: character)
4. After write: manually call trigger evaluation for the affected field (since API `set()` won't fire `change:graphic` events for gmnotes)

### D&D 5E Roll Message Structure (Observed)

**NPCs** (template: `npc`):
```
content: {{name=Blackguard}} {{rname=^{stealth}}} {{mod=1}} {{r1=$[[0]]}} {{query=1}} {{normal=1}} {{r2=$[[1]]}} {{type=Skill}}
inlinerolls: [0]=total, [1]=total (always 2 rolls)
```

**PCs** (template: `simple`):
```
content: {{rname=^{stealth-u}}} {{mod=12}} {{r1=$[[0]]}} {{query=1}} {{normal=1}} {{r2=$[[1]]}} {{global=}} {{charname=Leilah "Obscura"}}
inlinerolls: [0]=total, [1]=total (always 2 rolls)
```

**Advantage flags** (mutually exclusive):
- `{{normal=1}}` → use r1 (index 0)
- `{{advantage=1}}` → use max(r1, r2)
- `{{disadvantage=1}}` → use min(r1, r2)
- `{{always=1}}` → ambiguous; default to max(r1, r2)

**Character identification:**
- NPC: `{{name=X}}` (when "add name to template" is on)
- PC: `{{charname=X}}` or bare `charname=X` at end of content

**Skill name:**
- NPC: `{{rname=^{stealth}}}` (translation key format)
- PC: `{{rname=^{stealth-u}}}` (with `-u` suffix)

### Proposed Capture Rule Format

```
---GLS-CAPTURE---
template: npc, simple
name_field: rname
char_field: name, charname
value: r1=0, r2=1
advantage: {{advantage=1}} → max(r1,r2)
disadvantage: {{disadvantage=1}} → min(r1,r2)
normal: {{normal=1}} → r1
always: {{always=1}} → max(r1,r2)
variable: gl_${rname}
```

Fields:
- `template` — which roll templates to match (comma-separated)
- `name_field` — which template field contains the skill/ability name
- `char_field` — which template field(s) contain the character name (for identification)
- `value` — maps symbolic names to inline roll indices
- `advantage/disadvantage/normal/always` — condition → extraction rule
- `variable` — gl_ field name pattern (`${rname}` substitutes the matched skill name)

### Roll Capture Open Questions (Continued)

1. Should capture rules be active only on gaslit pages, or always active (so rolls captured before split are ready)?
2. How to handle roll results that arrive before any script references the field (pre-capture)?
3. Should there be a `!gaslight captures` command to list active capture rules and recent captured values?
4. Can we support ScriptCards output as a capture source?

## Future Ideas

- Visual script editor (handout with structured format)
- Script debugging/logging mode
- Conditional FX (play effects based on script results)
- Script templates (pre-built stealth, darkvision, illusion scripts)
- Event history (log of what changed and why)
