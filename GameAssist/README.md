# GameAssist – Modular API Framework for Roll20

**Version 2.0.0 - Beta Testing** | © 2025-2026 Mord Eagle · MIT License<br>
**Lead Dev:** [@Mord-Eagle](https://github.com/Mord-Eagle)

> **AlmanacAssist: Alpha Testing.** Its optional calendar, climate, moon, weather, environment, travel, and rest tools start disabled. Try them in a campaign copy, use disposable characters for rest tests, and [report a bug or request a feature](https://github.com/Mord-Eagle/GameAssist/issues). AlmanacAssist remains at the earlier Alpha stage; **the rest of GameAssist v2.0.0 is in Beta Testing.**

GameAssist v2.0.0 introduces four substantial optional modules and a shared HP foundation. **EffectAssist** coordinates a focused catalog of 2014-sheet effects with source-aware ownership, concentration-linked cleanup, bounded official 2014 Bless proposals, and optional duration review. **HealAssist** provides guided 2014 healing rolls, automatic verified HealthService application, and optional before-and-after review without spending slots or inventory automatically. **AttackAssist** adds authorized 2014 repeating-attack selection, native visible targeting, private GM placement, and one-use familiar attack rolls without applying damage. **AlmanacAssist** brings fictional calendars, climate regions, moons and celestial events, continuity-aware weather, structured environments, and deliberate 2014-sheet rest workflows together under one approachable campaign-world interface. **HealthService** gives supported 2014 characters and linked NPCs one evidence-first HP boundary, including optional private ConcentrationAssist check offers after relevant HP loss. EffectAssist, HealAssist, AttackAssist, and AlmanacAssist begin disabled so an existing campaign changes only when its GM deliberately enables them.

---

## 0 · What is GameAssist (in one paragraph)?

GameAssist is a **modular Roll20 Mod/API framework**: one script that supplies a small shared kernel, dedicated marker, Turn Tracker, and health services, a versioned semantic-event contract, and fifteen bundled gameplay and administration modules—ConfigUI, CritAssist, ConditionAssist, TokenAssist, InitiativeAssist, CombatAssist, WelcomeAssist, ConcentrationAssist, NPCAssist, EffectAssist, HealAssist, AttackAssist, AlmanacAssist, HPAssist, and DebugTools. It provides guided menus, guarded lifecycle controls, direct command and event routing, an explicit queue for work that truly requires serialization, persistent metrics, conservative state self-healing, and best-effort compatibility diagnostics. The goal is campaign automation that remains approachable at the table and understandable when something needs attention.

---

## 1 · TL;DR Cheat Sheet

| Category | Highlights |
| --- | --- |
| Core Lift | Guarded modules, conservative state repair, explicit queue API, versioned semantic events, session metrics, dependency diagnostics, GM health reporting, and toggleable marker and Turn Tracker services with dependent-module safeguards. |
| Quick Install | 📥 Install the complete script → 📜 add the CritAssist tables if used → 🔄 reload → 🩺 run the health checks → 🎲 test the enabled features with disposable tokens. |
| Flagship Player Commands | `!effect`, `!Bless`, `!Guidance`, `!Guide`, `!Haste`, `!Warding-Bond`, `!Holy-Weapon`, `!PwoaT`, `!Heal`, `!Attack`, `!condition <name>`, `!cond-<condition>`, `!concentration`, `!cc`, and `!critfumble-<type>` when the GM permits the relevant player action. |
| Flagship GM Commands | `!GA-GM` / `!GA-DM` opens the suite control center. Each module keeps its own `GM` / `DM` shortcut, and every module Game Master screen returns to the suite control center. |
| Help & Navigation | `!ga-help` lists module help screens; a disabled module still explains its purpose before offering Enable. `!ga-nav` opens the module navigator; `!ga-nav <module>` opens that module's destinations and a direct Enable/Disable control, with an extra organized section step for larger modules. |
| Admin Controls | `!ga-config list|get|set|modules|cleanup|ui|timezone`, `!ga-timezone`, `!ga-enable`, `!ga-disable`, `!ga-status`, `!ga-health`, `!ga-health alerts`, `!ga-metrics`, and `!ga-debug`. |
| Table Time | `!ga-timezone` chooses a named IANA timezone, follows daylight-saving changes, and controls readable times plus date-managed NPC Sessions without rewriting stored event instants. |
| Queue Model | Normal commands/events run directly. Only `GameAssist.enqueue(...)` work and module transitions use the serialized queue. |
| Watchdog Limit | A timeout releases the explicit queue; it **cannot** terminate underlying JavaScript, `sendChat()`, or Roll20 operations. |
| State Safety | Repairs malformed known module containers while preserving valid config; unexpected branches warn until the GM explicitly runs cleanup. |
| Dependency Safety | Reports dependencies as `confirmed`, `missing`, or `unverifiable`; detection is best-effort. |
| Backup Utility | `!ga-config list` writes a versioned **configuration-only** snapshot. It is not a full-state backup and cannot yet be imported. |

> `!ga-debug` requires `!ga-enable DebugTools`. DebugTools is GM-only, disabled by default, and dry-run by default.

> **Required CritAssist Roll-Tables:** `CF-Melee`, `CF-Ranged`, `CF-Thrown`, `CF-Spell`, `CF-Natural`, `Confirm-Crit-Martial`, and `Confirm-Crit-Magic`.

---

## 2 · Table of Contents

> 3. [Overview](#3-overview) 4. [Quick Start](#4-quick-start) 5. [Deep-Dive Architecture](#5-deep-dive-architecture) 6. [Module Guides](#6-module-guides)

> 7. [Installation](#7-installation) 8. [Command Matrix](#8-command-matrix) 9. [Configuration Keys](#9-configuration-keys) 10. [Developer API](#10-developer-api)

> 11. [Roll-Table Cookbook](#11-roll-table-cookbook) 12. [Macro Recipes](#12-macro-recipes) 13. [Performance Benchmarks](#13-performance-benchmarks)

> 14. [Troubleshooting](#14-troubleshooting) 15. [Upgrade Paths](#15-upgrade-paths) 16. [Contributing](#16-contributing)

> 17. [Roadmap](#17-roadmap) 18. [Changelog](#18-changelog) 19. [Glossary](#19-glossary) 20. [Licensing and Attribution](#20-licensing-and-attribution)

---

## 3 · Overview <a id="3-overview"></a>

GameAssist’s kernel and bundled modules expose:

* **Direct Event & Command Routing** – normal Roll20 events and API commands execute directly through guarded handlers. GameAssist captures Roll20’s native `on` function once and does not replace global `on` or `off`.
* **Explicit Task Queue** – future modules may submit selected work through `GameAssist.enqueue(...)` when serialized execution is genuinely useful.
* **Queue Watchdog** – observes the explicit queue and releases it after stalled jobs time out. It cannot kill the timed-out operation itself.
* **State Manager** – stores namespaced module data under `state.GameAssist.<Module>` and repairs missing or malformed known `config` and `runtime` containers.
* **State Auditor** – warns about unknown branches without deleting them automatically. The GM chooses whether to remove them with `!ga-config cleanup`.
* **Metrics Board** – records command, event, queue, error, toggle, and audit activity. View current health with `!ga-status` and persisted session details with `!ga-metrics`.
* **Guarded Component Toggles** – `!ga-enable` and `!ga-disable` control feature modules and core services without depending on a Roll20 `off()` API.
* **Compatibility Audit** – optional, debug-only overlap hints for popular scripts such as TokenMod, ScriptCards, and APILogic.
* **Dependency Diagnostics** – module dependencies are reported as confirmed, missing, or unverifiable instead of being presented as guaranteed discoveries.
* **Table Timezone** – the GM can choose a validated city/region timezone for status panels, logs, handouts, history, and date-managed NPC Sessions. Named timezones follow daylight-saving changes; saved event instants remain absolute.
* **MarkerService** – `GameAssist.MarkerService` resolves built-in and custom markers, supplies artwork metadata when Roll20 exposes it, preserves unrelated and numbered marker state, applies explicit add/remove/toggle operations, and exposes one observation contract. Relative marker counts retain their signed result before the configured minimum and maximum are applied, so subtraction below the minimum clamps downward instead of increasing the count. It can be disabled when another Mod needs exclusive control of marker behavior; GameAssist then turns off MarkerService-dependent modules while leaving unrelated modules available.
* **TurnTrackerService** – `GameAssist.TurnTrackerService` reads, classifies, observes, and safely writes Roll20's native Turn Tracker while preserving custom entries, unknown fields, duplicate token turns, text priorities, and rows owned by other tools. Disabling it leaves the tracker unchanged and turns off InitiativeAssist and CombatAssist.
* **SemanticEvents** – `GameAssist.SemanticEvents` publishes immutable, versioned, in-sandbox domain notifications for optional module integrations. Delivery is direct, ordered, non-persistent, and non-replayed; one observer failure cannot interrupt another.
* **HealthService** – `GameAssist.HealthService` normalizes supported official 2014-PC HP attributes and linked-NPC changes on one GM-selected shared token bar, deduplicates linked sheet/token evidence, and verifies GameAssist-owned writes carrying a producer and operation ID. `!ga-health bars` chooses Bar 1, 2, or 3, audits current-page setup, and can prepare linked NPC tokens without altering unrelated bars. Unexplained Roll20 changes remain unknown instead of being mislabeled as combat damage or healing; ConcentrationAssist may present them as clearly labeled observed HP loss rather than claiming a cause.
* **Suite Navigation** – `!GA-GM` and `!GA-DM` open one private control center for all fifteen feature modules, `!ga-help [module]` opens their help destinations or a short purpose-and-enable screen when one is off, and `!ga-nav` provides direct or layered module navigation without moving module-specific behavior into the core interface. GameAssist command words ignore capitalization and accept either spaces or hyphens, so `!GA STATUS`, `!ga-status`, `!gA gM`, and `!GA-GM` are equivalent forms. A running module's navigator screen includes a direct **Disable** control; an off module offers **Enable** instead of a dead button. Shared control panels use Roll20's familiar default-template presentation.
* **ConditionAssist** – supplies 2014 SRD condition wording by default, optional 2024 SRD wording, campaign-editable descriptions, case-insensitive `!cond-<condition>` quick references, marker artwork, an accurate selected-token menu, a GM current-page condition/marker status roster, verified marker-toggling announcements in public chat or player whispers, add/remove/toggle commands, guarded player permissions, and marker-change descriptions. Every condition marker operation and observation goes through MarkerService.
* **TokenAssist** – provides general token controls through bare `!token`, full-name `!tokenassist`, `!token-assist`, and short `!ta` commands, explicit-ID permissions, token-change observers, and MarkerService-backed status operations. Its everyday GM screen keeps common actions close, while **More Actions** opens an organized library for names, bars, markers, auras, lighting, movement, size, appearance, ordering, and reference tools. Older supported `!token-mod` macros remain deprecated compatibility aliases in v2.0.0; removal requires a separately announced migration release. GameAssist does not process that alias when standalone TokenMod is detected.
* **InitiativeAssist** – provides the case-insensitive `!Init-` command family for D&D 5E 2014 and 2024 characters, public player invitations, composable roll options, detailed dice/formula results, score-aware optional narration, selective rerolls, encounter groups, audits, and preservation-first `!Init-RR`. It does not advance turns or own encounter rounds.
* **CombatAssist** – provides the case-insensitive `!Combat-` command family as an optional layer over Roll20's native Turn Tracker. Native arrows remain available; a recognized native round-counter row can own the round number, while guarded movement, stale-safe timers, native pings, private player prompts, preserved-round maintenance, and one-step recovery add convenience. TurnTrackerService is required for tracker access; timers never advance initiative and pings never alter tokens.
* **WelcomeAssist** – optionally posts one delayed table greeting after GameAssist completes a healthy startup. It starts disabled, offers professional, built-in table-humor, campaign-custom, and mixed greeting modes, keeps configuration and previews private to the GM, and uses the short case-insensitive `!Welcome` / `!Welcome-Action` command family.
* **EffectAssist** – starts disabled and coordinates a focused catalog of source-aware effects for the official 2014 sheet. Bless, Guidance, Warding Bond, and Haste receive supported marker and sheet automation; Holy Weapon and Pass Without a Trace are explicitly labeled tracked/manual effects. Every EffectAssist-owned 2014 modifier uses the compact `(GA)` label convention. A uniquely labeled Guidance row may end exactly one unambiguous active Guidance after a supported 2014 sheet skill check; unsupported checks, ambiguous evidence, pre-existing rows, and edited rows retain the explicit **Use Guidance** action. Players may cast built-ins from controlled sources unless the GM locks that path. The player chooses a caster first and then a recipient count; Bless offers one to three recipients directly and a separate Higher Level Casting choice for four to eleven. Recipient failures name the exact token that needs its **Represents Character** link repaired, and duplicate source tokens are distinguished by token and layer so concentration belongs to the chosen source. An unambiguous official 2014 Bless card can create a private GM proposal without choosing recipients or applying anything automatically. Overlapping sources remain independently removable, pre-existing state remains campaign-owned and is identified during cleanup, and audit never writes without fresh confirmation.
* **HealAssist** – starts disabled and guides an authorized 2014 healer through supported spells, potions, or a bounded manual formula. One-recipient actions go directly to Roll20's target prompt instead of asking the user to choose a recipient count of one; multi-recipient actions retain the count choice. Normal and maximum-healing catalogs are available. Automatic verified application after recipient selection is the default for new configurations; the GM may turn on review-before-apply, and failed automatic writes produce a private GM diagnostic. Existing saved choices are preserved. Visible PCs can be selected without granting token control; NPC, GM-layer, and off-page healing remains private GM work.
* **AttackAssist** – starts disabled and guides an authorized official-2014 character through a verified repeating attack, a compact native visible-target choice, and one familiar character-attributed roll. By default it submits immediately using the character sheet's saved roll setting; the GM can enable **Review Before Roll** to offer sheet, Normal, Advantage, and Disadvantage choices before each attack. Before submission it materializes the complete Classic-sheet formula, including nested saved modifiers, instead of leaving Roll20 to resolve missing or interactive fields inside an API-authored roll. The submitted Roll20 sheet card remains visible because the roll is sent directly rather than consumed by an internal callback. The sheet's standard per-roll whisper and advantage questions use their documented first choices, Public and Normal; any other unresolved prompt or field receives a clear refusal before it can reach the dice parser. Hidden or off-page placement stays with the GM, and the module never applies damage or changes combat state.
* **AlmanacAssist** – starts disabled and combines a compact live-session dashboard, a complete worldbuilding workspace, and six independently controlled systems: Time, Climate, Astronomy, Weather, Environment, and Rest. Its authoritative current scene joins place, local time, weather, terrain, visibility, moon visibility, and temporary phenomena without presenting competing values as simultaneous truth. Prepared destinations, reviewed travel, local temporal contexts, versioned WorldPacks, and advanced Wayfarer handout editing support large campaign worlds while common date, weather, rest, and announcement actions remain close at hand.
* **MECHSUITS Structure** – the executable script uses the literal codename `GAMEASSIST`, framed sections, file-scoped canonical tree metadata, and per-section change notes.

**Design goal:** useful, inspectable campaign automation that reports failures clearly and can be upgraded incrementally.

---

## 4 · Quick Start <a id="4-quick-start"></a>

| Step | What to do |
| --- | --- |
| 📥 **1 · Install** | For this release candidate, paste the complete `GameAssist.js` file into **Mod (API) Scripts**, then save. After One-Click publication, check the listed version before installing from the library. |
| 🧩 **2 · Choose Features** | Open `!GA-GM` for the suite control center, then use `!ga-config ui` to keep only the tools that fit the campaign. MarkerService, TurnTrackerService, and HealthService begin enabled; InitiativeAssist, CombatAssist, WelcomeAssist, EffectAssist, HealAssist, AttackAssist, and AlmanacAssist begin disabled until the GM deliberately configures them. |
| 📜 **3 · Prepare CritAssist** | If CritAssist will be used, create the seven tables listed in [§11 · Roll-Table Cookbook](#11-roll-table-cookbook). Skip this step when CritAssist is disabled. |
| 🔄 **4 · Reload** | Save or restart the Mod sandbox and wait for the GameAssist core ready whisper. Module-by-module startup whispers are normally quiet. |
| 🩺 **5 · Check Health** | Run `!ga-status` and `!ga-config modules`. Confirm the features you enabled are running. `!ga-health` opens shared HP evidence, `!ga-health bars` chooses and audits the NPC HP bar, `!ga-health alerts` manages optional GM-private PC health notices, and `!ga-sheets` explains sheet-sensitive capability status. |
| 🕰️ **6 · Set Table Time** | Open `!ga-timezone`, choose the city/region that governs the campaign clock, and confirm the displayed time and Session date. The sandbox default remains available. |
| 🎲 **7 · Try the Table Tools** | Test `!token-assist help`, `!condition help`, `!critfumble menu`, `!concentration --status`, `!HP-Selected`, `!Init-Help`, `!Combat-Help`, `!Welcome`, `!Effect-Guide`, `!Heal-Guide`, and `!Attack-Guide` for the modules you use. `!ga-handouts` opens the stable handout index when you use report-writing modules. |
| 🛡️ **8 · Verify Real Changes** | With disposable tokens, test one NPC death/revival, one concentration marker, and one mixed-character initiative reroll before the first live session. |

GameAssist v2.0.0 retains the integrated TokenAssist and ConditionAssist replacements introduced in `v0.1.5.0`. It does not send their work back to standalone TokenMod or StatusInfo. Remove both standalone scripts before testing overlapping TokenAssist or ConditionAssist commands.

If MarkerService is deliberately disabled, ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, and DebugTools are also disabled. CritAssist, ConfigUI, InitiativeAssist, CombatAssist, WelcomeAssist, and HPAssist remain available. Standalone **TokenMod by The Aaron** and **StatusInfo by Robin Kuiper** can then provide their own token-marker and condition tools, but they do not restore GameAssist death-history, concentration, TokenAssist, or ConditionAssist features.

`GameAssist.flags.QUIET_STARTUP` defaults to `true`. Expect the core ready whisper, but not one ready message from every module.

### 4.1 Minimum Smoke Test

Run these commands after every update:

```roll20chat
!ga-status
!GA-GM
!ga-help
!ga-nav
!ga-config modules
!ga-timezone
!ga-config list
!ga-metrics
!token-assist help
!condition help
!condition
!condition status
!critfumble menu
!ga-enable InitiativeAssist
!Init-Menu
!Init-Status
!Init-Go
!Init-GM
!Init-RR
!ga-enable CombatAssist
!Combat-Help
!Combat-Start
!Combat-Status
!concentration --status
!npc-death-help
!npc-death-report
!npc-death-buckets
!npc-death-audit
!npc-death-repair
!HP-Selected
!ga-enable EffectAssist
!Effect-GM
!Effect-Status
!Effect-Audit
!ga-enable HealAssist
!Heal-GM
!Heal-Status
!Heal-Audit
!ga-enable AttackAssist
!Attack-GM
!Attack-Status
!Attack-Audit
!ga-enable AlmanacAssist
!aa-gm
!Almanac-Status
!Almanac-Audit
```

Then perform thirteen real actions:

1. Drop a linked NPC below 1 HP and verify the death marker appears.
2. Raise that NPC above 0 HP and verify the marker clears.
3. Run a real concentration check.
4. Select a disposable token, add and remove one condition, and confirm unrelated markers remain unchanged.
5. Select a disposable token and use one supported `!token-assist --set` or `--on` command.
6. Disable and re-enable one module or service.
7. Put a PC, a living NPC, and a custom round/counter row in Roll20's Turn Tracker; run `!Init-RR` and verify only the two characters reroll.
8. Start CombatAssist, move the native tracker through one complete forward cycle, move back once, remove or add one disposable combatant, and verify the round survives the native edit while row contents remain intact. Preview one restore before ending the test.
9. If WelcomeAssist will be used, enable it, preview a greeting, reload the sandbox, and verify exactly one public greeting appears.
10. With linked 2014 PC source and target tokens, test Bless and Guidance. Verify Bless's markers and global attack/save rows, then verify one ordinary sheet skill check using the uniquely labeled `Guidance (GA)` row ends exactly that Guidance instance. Unsupported or ambiguous checks must retain the manual **Use Guidance** action. Clear concentration and verify all EffectAssist-owned projections are removed. Repeat the Bless overlap test with two sources before release approval.
11. Enable HealAssist and note the saved application mode. With a damaged disposable 2014 PC, run `!Heal-Auto on`, then `!Heal`, and verify one supported action applies once without a review screen. Repeat with `!Heal-Auto off` to verify review and one-use confirmation, then with an NPC to verify that its HP and result remain GM-private. Restore your preferred mode.
12. Enable AttackAssist, select a controlled 2014 PC with two repeating attacks, run `!Attack`, choose a visible target the player does not control, and submit one Normal or Advantage roll. Confirm the familiar roll appears once, CritAssist reacts once to a natural 1, and no target HP or combat state changes.
13. Enable AlmanacAssist, open `!aa-gm`, test one quick advance, one private announcement preview, and direct saved-Wayfarer selection, then generate weather, choose an environment preset, and preview a Short Rest on a disposable linked 2014 PC. Confirm the six internal systems can be turned off independently without erasing their saved settings.

---

## 5 · Deep-Dive Architecture <a id="5-deep-dive-architecture"></a>

### 5.1 Runtime Pipeline

Normal Roll20 traffic follows a direct, guarded route:

```text
Roll20 event or API chat command
          ↓
GameAssist command/event wrapper
          ↓
Module initialized + active guard
          ↓
ACL / GM-only / command-boundary checks
          ↓
Module handler executes directly
          ↓
Metrics and error reporting
```

Serialized work is separate and explicit:

```text
Module calls GameAssist.enqueue(task, options)
          ↓
Priority-sorted explicit queue
          ↓
Task runs until complete or timeout
          ↓
Queue advances to the next task
```

Module enable/disable transitions also use the internal queue to prevent overlapping lifecycle changes.

Marker work follows a separate direct service path:

```text
NPCAssist, ConcentrationAssist, DebugTools, or another consumer
          ↓
GameAssist.MarkerService resolves the configured marker
          ↓
Structured read/add/remove/toggle operation
          ↓
Only the requested marker state changes
          ↓
Roll20 change event is published to MarkerService observers
```

MarkerService is a toggleable core service rather than a gameplay module. Disabling one consumer leaves MarkerService available to the others. Disabling MarkerService itself first disables every dependent module, then closes the marker API while leaving unrelated GameAssist features available.

Health work follows a separate evidence-first path:

```text
Supported 2014 PC HP attribute or linked NPC selected-bar changes
          ↓
GameAssist.HealthService normalizes before/after values
          ↓
Linked sheet/token duplicates collapse into one transition
          ↓
Immutable health.transition event is published
          ↓
Optional consumers decide whether to offer their own action
```

An unexplained decrease is evidence that HP went down, not proof of an attacker, damage type, resistance interaction, or concentration trigger. GameAssist-owned writers may declare `damage`, `healing`, `initialization`, or `synchronization` only when they also supply producer and operation identity and the resulting Roll20 value verifies successfully. HealthService itself performs no rolls, death-history writes, concentration checks, combat actions, or automatic rollback.

### 5.2 Why Normal Events Are Not Queued

Roll20 event handlers often perform small, immediate checks. Automatically routing every event through one queue would add latency, increase coupling, and create a single congestion point. In v0.1.5.0, ordinary handlers remain direct; modules opt into serialization only when their own work requires it.

### 5.3 Fail-Safe Scenarios

| Scenario | GameAssist Response | Important Limit |
| --- | --- | --- |
| Uncaught exception in a guarded module handler | Records an error and whispers the GM. Other handlers can continue. | It cannot repair arbitrary module logic. |
| Explicit queued task exceeds its timeout | Logs the timeout and releases the queue for later work. | It cannot cancel the underlying JavaScript or Roll20 operation. |
| Explicit queue remains busy beyond watchdog threshold | Watchdog releases the busy queue state and records a warning. | The original operation may still finish later. |
| Known module branch lacks valid `config` or `runtime` containers | Repairs the malformed containers while preserving valid configuration values. | It does not infer arbitrary missing custom values. |
| Unknown `state.GameAssist` branch is found | Warns and leaves it untouched. | Removal requires `!ga-config cleanup`. |
| Required external dependency is confirmed missing | Skips startup, preserves the DM's enabled setting, and reports the configured module as needing attention; a later manual enable is refused without changing the setting, while `!ga-disable` can still turn off the inactive module. | Discovery depends on metadata Roll20 exposes. |
| Dependency cannot be verified | Warns and proceeds without confirmation. | The GM must confirm the dependency manually. |

### 5.4 Persistent State Shape

```text
state.GameAssist
├─ config
├─ flags
├─ metrics
├─ MarkerService
│  ├─ config
│  └─ runtime
├─ TurnTrackerService
│  ├─ config
│  └─ runtime
├─ HealthService
│  ├─ config
│  └─ runtime
├─ ConfigUI
│  ├─ config
│  └─ runtime
├─ CritAssist
│  ├─ config
│  └─ runtime
├─ ConditionAssist
│  ├─ config
│  └─ runtime
├─ TokenAssist
│  ├─ config
│  └─ runtime
├─ InitiativeAssist
│  ├─ config
│  └─ runtime
├─ CombatAssist
│  ├─ config
│  └─ runtime
├─ WelcomeAssist
│  ├─ config
│  └─ runtime
├─ NPCAssist
│  ├─ config
│  └─ runtime
├─ ConcentrationAssist
│  ├─ config
│  └─ runtime
├─ HPAssist
│  ├─ config
│  └─ runtime
└─ DebugTools
   ├─ config
   └─ runtime
```

Module configuration belongs under `state.GameAssist.<Module>.config`. Runtime caches belong under the matching module’s `runtime` object.

### 5.5 Configuration Snapshot Shape

`!ga-config list` writes a `GameAssist Config` handout containing:

```json
{
  "format": "gameassist-config-snapshot",
  "schemaVersion": 1,
  "scope": "configuration-only",
  "generatedAt": "<ISO timestamp>",
  "version": "1.8.1",
  "flags": {},
  "globalConfig": {},
  "modules": {}
}
```

The snapshot excludes runtime caches and metrics. v2.0.0 does not import or restore snapshots.

### 5.6 Table Timezone

Run `!ga-timezone` or `!ga-config timezone` to open the GM-only timezone menu. Choose a common region or enter a standard IANA name such as `America/New_York`, `Europe/London`, or `Australia/Sydney`. GameAssist validates the name before saving it and refuses an unsupported value without replacing the current setting.

The selected timezone controls human-facing GameAssist dates and times, including status panels, logs, configuration handouts, condition and NPC handouts, death/revival history displays, and the date used by automatically named NPC Sessions. Named regions follow daylight-saving changes automatically. `!ga-timezone clear` restores the Roll20 sandbox clock.

GameAssist stores event instants as absolute ISO timestamps. Changing the table timezone changes how those instants are displayed; it does not move or rewrite the underlying events. A date-managed NPC Session updates immediately when the timezone setting crosses a date boundary and continues checking before NPCAssist activity. A deliberately named Session remains unchanged until the DM uses **Reset Session Date**.

---

## 6 · Module Guides <a id="6-module-guides"></a>

Every module now follows the same small navigation vocabulary through its established command family:

| Choice | What it opens |
| --- | --- |
| **Guide** or **Help** | A compact starting panel with the most useful actions. |
| **Menu**, **GM**, or **DM** | The module's main Game Master interaction screen. GM and DM are equal role aliases. |
| **Status** | A concise current-health or current-state summary. |
| **Info** | A short explanation of what the module does at the table. |
| **Audit** | A read-only inspection that explicitly says it changed nothing. |
| **Manual** | A stable `GameAssist Guide - <Module>` handout for modules with substantial workflows. Brief modules explain that their complete guidance already fits in chat. |

The displayed prefix stays familiar to that feature: for example, `!critfumble guide`, `!condition audit`, `!npc-death-manual`, `!Init-Info`, and `!Welcome-Menu`. Command letters are case-insensitive, and spaces or hyphens may separate command words. For example, `!GA STATUS`, `!ga-status`, `!gA gM`, and `!GA-GM` work alike. Documented buttons use one consistent spelling so menus remain easy to scan. An unrecognized command under a module's prefix explains the problem and offers an **Open Guide** button instead of failing silently. The GM and DM role aliases open the screen that best fits that module: for example, `!Init-GM` and `!Init-DM` open the private initiative roster, while `!Combat-GM` and `!Combat-DM` open CombatAssist's Control Center.

### 6.1 CritAssist

> **Module version:** `0.2.5.3`

CritAssist watches supported attack roll templates for a kept natural 1 and offers a player-targeted fumble menu. Dropped d20s from advantage, disadvantage, and other keep/drop expressions do not trigger a fumble. Calling `!critfumble menu` opens the guided Natural 1 dialogue; `!critfail` opens the direct GM-facing player picker.

Recognized templates include:

```text
atk, atkdmg, npcatk, npcfullatk, npcaction, spell, simple, dmg, default
```

Commands:

* `!critfumble` / `!critfumble help` → Whisper a quick reference with setup table names and a button to open the guided menu.
* `!crit` / `!CritAssist-<command>` → Use the shorter or canonical CritAssist command family for the same guide, menu, status, audit, manual, and roll actions.
* `!critfumble guide` → Open the same compact quick reference.
* `!critfumble menu` → Whisper the guided Natural 1 dialogue with player-picker, direct-roll, and confirm-roll buttons.
* `!critfail`, `!CritAssist-GM`, or `!CritAssist-DM` → Open the direct manual player picker for the Game Master.
* `!critfumble status` / `!critfumble audit` → Check the seven required rollable-table names; Audit is explicitly read-only.
* `!critfumble info` → Whisper the short module explanation.
* `!critfumble manual` → Create or update the stable CritAssist user-manual handout.
* `!critfumble-melee|ranged|thrown|spell|natural` → Roll the selected fumble table.
* `!confirm-crit-martial` / `!confirm-crit-magic` → Roll the matching confirmation table.

The established `!critfumble*`, `!critfail`, and `!CritFumble-GM|DM` forms remain compatibility aliases. New macros should prefer `!crit` or `!CritAssist-*` when a branded module name is useful.

Internal player-targeted button syntax:

```text
!critfumblemenu --pid <playerId>
```

Config keys: `debug`, `useEmojis`, `rollDelayMs`.

### 6.2 ConditionAssist

> **Module version:** `1.0.5`

ConditionAssist gives the table a readable condition reference and a marker-backed selected-token menu. It defaults to the fifteen SRD 5.1 conditions used by the 2014 rules, including Exhaustion rather than Inspiration. The GM can switch the official descriptions to SRD 5.2.1 wording for the 2024 rules or edit any description for campaign-specific wording. Open `!condition` after selecting tokens to see their active configured conditions and toggle another condition with one click. Use `!condition status` to review every linked character or NPC on the current player page that has a configured condition or another active marker. Select linked character tokens and use `!condition announce`, `!c-a`, or `!cond-!` to toggle a condition marker and report the verified result publicly or to their player controllers. `!condition help` is the quick-start guide.

Common commands:

* `!condition` → Open the selected-token condition menu.
* `!condition status` or `!condition --status` → Show a GM-only current-page summary of configured conditions and other active markers, and update the complete `GameAssist Condition Status` handout.
* `!condition help` / `guide` → Open the compact guide.
* `!condition menu`, `!Condition-GM`, or `!Condition-DM` → Open the selected-token condition menu for the Game Master.
* `!condition info` → Whisper the short module explanation.
* `!condition audit` → Inspect current-page condition markers without changing them.
* `!condition manual` → Create or update the stable ConditionAssist user-manual handout.
* `!condition <name>` → Show one configured condition description.
* `!cond-<condition>` → Show the same description with a case-insensitive short reference command, such as `!cond-prone`, `!COND-EXHAUSTION`, or a DM-created condition key.
* `!condition add <condition...>` → Add one or more conditions to selected tokens.
* `!condition remove <condition...>` → Remove conditions from selected tokens.
* `!condition toggle <condition...>` → Switch conditions on or off for selected tokens.
* `!condition announce`, `!c-a`, or `!cond-!` → Open a selected-character menu that toggles the chosen marker and reports the verified result publicly or by player whisper.
* `!condition config` → Open GM settings.
* `!condition config-conditions` → Add, edit, or remove condition definitions.
* `!condition config export` / `!condition config import <JSON>` → Export or apply a validated ConditionAssist configuration.
* `!condition reset` → Open a confirmation prompt before restoring defaults.

Player description access and player marker changes are separate settings. Both are off by default. The permanent `!condition` and `!cond-<condition>` commands remain available even when the GM configures an additional compatibility alias. A private **Read Exact Wording** button issued by the GM grants only that temporary reference; it does not enable unrestricted player commands.

The **Condition wording** setting offers **2014 SRD** and **2024 SRD** profiles. Switching profiles updates only the fifteen official condition names and descriptions: configured marker choices and additional campaign conditions are retained. Editing any description marks the wording source as **Campaign Custom**. Untouched ConditionAssist 1.0.0 defaults are upgraded to the complete 2014 list; previously edited or migrated definitions are preserved as custom wording.

Condition definitions store a display name, plain-language description, and a marker. A marker may be a built-in id, a custom display name, an exact stored `Name::id` tag, or a numbered value such as `red@3`. ConditionAssist uses MarkerService for every read, add, remove, toggle, and marker-change observation, so unrelated markers and number overlays remain intact. Built-in markers render from Roll20's status artwork. Registered custom markers use their campaign-library image URL when Roll20 exposes it; an exact tag without readable registry artwork falls back to the marker name.

The GM-only status workflow keeps chat readable while preserving the complete result. It lists configured conditions separately from other active markers, omits unmarked tokens, counts marked unlinked items separately, and updates the `GameAssist Condition Status` handout with every marked linked character or NPC on the current player page.

The announcement workflow is GM-only. Select up to twelve linked character tokens, open `!condition announce` or either shorthand, choose a configured official or custom condition, then choose a final public or player-whisper button. That final button toggles the marker once on every captured token, verifies the stored result, and gives each character a direct statement such as **Mira is Prone** or **Orin is no longer Prone**. Saved definitions named exactly **Concentration** are displayed as **Concentrating** while their stored key, marker, and description remain intact. Summary messages include an expiring **Read Exact Wording** button; exact-wording choices include the configured description immediately. If a marker change cannot be verified, that token is omitted from the success message and the GM receives the failure details.

On first startup, valid legacy `state.STATUSINFO` settings and condition definitions are copied into `state.GameAssist.ConditionAssist.config`. GameAssist keeps the original `state.STATUSINFO` branch for rollback and records what was imported. A separately installed StatusInfo script should then be removed or disabled because both tools respond to `!condition` and condition-marker changes.

Configuration imports are size-bounded, reject unsafe keys, validate every definition, and apply only after the entire payload passes. The protected `conditions`, `rulesProfile`, and migration-record maps cannot be replaced through generic `!ga-config set`; use the ConditionAssist settings menu and validated importer.

**StatusInfo compatibility boundary:** ConditionAssist preserves the principal condition-reference, artwork, menu, permission, definition, import/export, and marker-change workflows, but it is not a line-for-line replacement. StatusInfo's Shaped Character Sheet attribute synchronization is intentionally omitted because GameAssist currently targets Roll20's D&D 5E sheets and treats token markers as the condition source of truth. Legacy StatusInfo global helper names and observer callbacks are replaced by `GameAssist.ConditionAssist` and `GameAssist.MarkerService.observe(...)`. An optional custom command alias takes effect after the Mod sandbox reloads; permanent `!condition` and `!cond-<condition>` routes remain active.

Config keys: `command`, `rulesProfile`, `userAllowed`, `userToggle`, `sendOnlyToGM`, `showDescOnStatusChange`, `showIconInDescription`, and `conditions`.

### 6.3 TokenAssist

> **Module version:** `1.3.0`

TokenAssist provides general token controls without requiring standalone TokenMod. Use `!token-assist` for the full command name, `!ta` for a short form, or `!ta-<action>` for quick table commands such as `!ta-set` and `!ta-move`. Select one or more tokens before running a command. Players can affect tokens they can select, while direct `--ids` targeting remains GM-only unless the GM enables **Players can use --ids**.

Start here:

```roll20chat
!token-assist help
!TokenAssist-GM
!TokenAssist-DM
!token-assist status
!token-assist audit
!token-assist manual
!token-assist about
!token-assist actions
!ta-help
!ta-help-statusmarkers
```

The private GM Controls page keeps the most common actions visible. Choose **More Actions**, or run `!token-assist actions`, `!Token-Actions`, or `!ta-actions`, to open the larger organized action library without crowding the everyday screen.

Supported compatibility families:

* `--on <property...>` → Turn supported boolean token properties on.
* `--off <property...>` → Turn supported boolean properties off.
* `--flip <property...>` → Toggle supported boolean properties.
* `--set <property|value...>` → Set common names, tooltips, bars, auras, colors, layers, position, size, facing, vision, lighting, links, controllers, and markers.
* `--move <distance>` / `--move <angle|distance>` → Move relative to current facing or an absolute/relative angle. Supported units include `g`, `u`, and common page units.
* `--order tofront|toback` → Change token stacking order.
* `--report <recipient|message>` → Report token values with `{property}`, `{property:before}`, `{property:change}`, and `{property:abschange}` placeholders.
* `--ids <token-or-character-id...>` → Add explicit token or represented-character targets when authorized.
* `--ignore-selected`, `--current-page`, and `--active-pages` → Refine targeting.
* `--api-as <player-id>` → Preserve script-to-script authorization behavior for a command whose Roll20 sender is `API`.
* `--config players-can-ids|on|off` → GM control for player `--ids` use.

Examples:

```roll20chat
!ta-on showname
!ta-set name|"City Watch" bar1_value|25
!ta-set aura1_radius|5 aura1_color|336699 aura1_options|circle
!ta-set bar1_value|-5 left|+70
!ta-move 3g
!token-assist --set layer|gmlayer --order tofront
!ta-set statusmarkers|red:3|Warded;;1001;4
!ta-report gm|"{name}: {bar1_value:before} to {bar1_value}"
```

Relative numbers use `+`, `-`, `*`, or `/`. Use a leading `=` for exact assignment when a negative number might otherwise mean subtraction: `bar1_value|=-5`. Quoted text is required when a value contains spaces.

Status-marker syntax is handled only by MarkerService. An unprefixed name or `+name` adds a marker, `-name` removes it, `!name` toggles it, and `=name` replaces the complete marker list after the replacement resolves successfully. Use `red:3` for a number, a registered custom display name, or an exact `Name::id` tag. In Roll20 query/button syntax, `Name;;id;3` is accepted for a numbered custom tag. Unrelated markers and their numbers are preserved unless an explicit replacement is requested.

TokenAssist `1.3.1` includes exact saved-attribute and supported computed-value reports, exact or unambiguous controller-list editing, privacy-aware report recipients, relative color and dimming controls, relative or random multi-sided-token selection, and MarkerService-backed duplicate-index, conditional, relative-count, and minimum/maximum marker expressions. Unsupported or ambiguous operations are refused before unrelated requested changes are applied.

Persistent image-side stack editing, token-image replacement, and default-token writes remain outside this release because they modify longer-lived token assets and require a dedicated preview and recovery contract. TokenAssist also keeps its own help and public API rather than rebuilding TokenMod's help handout or publishing a global `TokenMod` compatibility object.

On first startup, TokenAssist copies a valid legacy `state.TokenMod.playersCanUse_ids` value into its own configuration. It records the migration and leaves `state.TokenMod` untouched for rollback. It does not expose a global `TokenMod` object; integrations should use `GameAssist.TokenAssist.observeTokenChange(...)` or MarkerService's marker observer.

Existing supported `!token-mod` macros remain compatibility aliases in v2.0.0, but new macros should use `!token-assist`, `!ta`, or `!ta-*`. Their eventual removal requires a separate announced migration release. When standalone TokenMod is detected, GameAssist leaves `!token-mod` to that script while TokenAssist commands remain available. Remove standalone TokenMod for normal v2.0.0 use because both tools can change the same token properties and markers.

Config keys: `playersCanUseIds`, `warnOnStandalone`, and the protected `configSchemaVersion`.

### 6.4 InitiativeAssist

> **Module version:** `1.0.6`<br>
> **Core service:** `TurnTrackerService 1.0.0`<br>
> **Default:** Disabled until the GM enables it.

InitiativeAssist works inside Roll20's native Turn Tracker and reads initiative for both **D&D 5E by Roll20 (2014)** and **D&D 2024 by Roll20** characters in the same encounter. The 2024 sheet uses Roll20's asynchronous Beacon/Computed access and may require the supported Experimental Mod API server. If 2024 initiative data cannot be read, GameAssist leaves that tracker row unchanged and explains the problem; it never substitutes zero.

Start here:

```roll20chat
!ga-enable InitiativeAssist
!Init-Help
!Init-Menu
!Init-Go
!Init-GM
!Init-DM
```

`!TokenAssist-GM` and `!TokenAssist-DM` open the same action-focused Game Master screen for the current token selection. `!token-assist help` and `!ta-help` remain the instructional guide.

All `!Init-` commands are case-insensitive. `!Init-Go` posts a direct public call for initiative; `!Init-Go!` uses a rotating set of light encounter announcements. `!Init-GM` and `!Init-DM` open the same neutral roll controls and complete encounter roster only for the Game Master, without posting an invitation to the table. The public calls offer **Roll Initiative**, **Roll Selected**, and **Roll Options**, then privately give the GM separate PC, object-layer NPC, and GM-layer NPC controls. The GM can roll everyone on the Objects layer, either NPC layer, or every living NPC across both layers. A player's controlled, linked token does not need to be in Turn Order first: InitiativeAssist finds it on the active encounter page, saves a page-owned Roll20 row, verifies the visible tracker data, and only then announces the result. Players who control several characters may select those tokens and use **Roll Selected**; every token's page, link, control, and eligibility are checked again before rolling. No Roll20 macro is required.

NPC roll details are **GM-only by default**, including the raw inline roll and the readable result panel. The GM can make object-layer NPC rolls public from the Control Center with `!Init-NPC-Rolls public`; `!Init-NPC-Rolls hidden` restores privacy. GM-layer NPC rolls always remain private, regardless of that setting. PC results remain public so the table can see player initiative normally.

**Roll Options are cumulative.** First choose normal, advantage, or disadvantage. Then optionally add a flat adjustment and zero, one, or two bonus dice. Common die buttons avoid typing; custom dice accept whole-number sides from 2 to 100. Advantage and disadvantage results show both d20s, followed by any bonus dice, the final total, and the complete formula, matching ConcentrationAssist's readable evidence style. Results requested through `!Init-Go!` also receive varied narration selected from six score ranges, from being caught unready at 5 or less to appearing to act before combat began at 35 or more. `!Init-Go` remains neutral and direct.

The in-game screens have separate jobs: the **Guide** is a compact starting page whose topic buttons open focused reference panels, the **Control Center** contains encounter actions, the **Status Summary** provides a quick check, and the **Detailed Review** reports tracker and page details privately in chat without creating a campaign handout.

GM commands:

* `!Init-Menu` → Open the Initiative Control Center for encounter actions.
* `!Init-Help` → Open the InitiativeAssist Guide.
* `!Init-Status` → Open the quick Status Summary for PCs, NPCs, preserved rows, and items needing attention.
* `!Init-Go` / `!Init-Go!` → Invite players to roll, then whisper the GM an encounter roster with individual and batch controls.
* `!Init-GM` / `!Init-DM` → Open the neutral initiative controls and complete encounter roster only for the Game Master.
* `!Init-Roll-Selected` → Roll every eligible selected character controlled by the clicking GM or player, including characters not yet in Turn Order.
* `!Init-Start --scope all|npc|gm-npc|all-npc` → Add or update eligible object-layer characters, object-layer NPCs, GM-layer NPCs, or NPCs across both layers; normally used through the GM roster buttons.
* `!Init-NPC-Rolls hidden|public` → Keep object-layer NPC roll details GM-only or make them public. GM-layer rolls always remain private.
* `!Init-RR` → Reroll every unique PC and living NPC already in the tracker, then whisper the bounded result summary to the GM.
* `!Init-RR-Menu` → Reroll only PCs, living NPCs, selected tokens, one character, or a saved encounter group.
* `!Init-Group` → Create, review, rename, reroll, or remove page-scoped encounter groups built from selected tracker tokens.
* `!Init-Audit` → Show a detailed, read-only GM chat review of current tracker rows and linked characters not yet in Turn Order.
* `!Init-Info` → Whisper the short InitiativeAssist explanation.
* `!Init-Manual` → Create or update the stable InitiativeAssist user-manual handout.
* `!Init-Mode observer|manager` → Choose read-only coexistence or InitiativeAssist-owned writes.

`!Init-RR` rolls once per unique eligible token. Duplicate occurrences receive the same result. NPC living/dead eligibility uses the shared bar chosen through `!ga-health bars`, including Bar 2 or Bar 3; the current setting is read again before a reroll is written. Custom rows, counters, objects, dead NPCs, HP/death-marker mismatches, stale references, off-page tokens, unsupported sheets, and unreadable 2024 entries are not rerolled or repositioned. Eligible rows sort only among the positions InitiativeAssist owns, so a round counter or another Mod's custom entry stays exactly where the GM placed it.

InitiativeAssist deliberately stops at initiative. CombatAssist owns deliberate encounter lifecycle, exact turn movement, native or conservative round counting, optional turn timers, and native current-turn pings. Condition-duration countdowns and automatic end-of-turn effects remain outside both modules in v2.0.0.

Config keys: `enabled`, `mode` (`manager` or `observer`), `hideNpcRolls` (default `true`).

### 6.5 CombatAssist

> **Module version:** `1.2.1`<br>
> **Core service:** `TurnTrackerService 1.0.0`<br>
> **Default:** Disabled until the GM enables it.

CombatAssist manages the flow of an encounter after initiative has been established. It observes Roll20's native Turn Tracker rather than replacing it: the GM can continue using Roll20's ordinary arrows, add or remove combatants, reorder entries, and reroll initiative. CombatAssist starts only when the GM asks it to start and never treats an open tracker as proof that combat has begun.

CombatAssist has one **hard prerequisite**: TurnTrackerService, because every tracker read and write uses that shared authority. Baseline InitiativeAssist and CombatAssist operation remains independent. A future optional feature may connect them, but that feature must name its prerequisite, remain off or unavailable when the prerequisite is absent, and never prevent either module's independent features from running.

Start here:

```roll20chat
!ga-enable CombatAssist
!Combat-Help
!Combat-Start
```

All `!Combat-` commands are case-insensitive. The **Control Center** is the main table screen; the compact **Quick Guide** links to focused topics for starting, tracker edits, recovery, player messages, and troubleshooting; **Status** reports the saved encounter and a plain-language tracker check. **What does CombatAssist do?** creates or updates the persistent `GameAssist Guide - CombatAssist` handout, then offers buttons to open the manual, whisper a short summary, or return to the Control Center.

* `!Combat-Menu`, `!Combat-GM`, or `!Combat-DM` → Open the action-focused Game Master Control Center.
* `!Combat-Help` or `!Combat-Guide` → Open the plain-language Quick Guide.
* `!Combat-Manual` → Create or update the complete CombatAssist user-manual handout.
* `!Combat-Info` → Whisper the abbreviated purpose and ordinary table workflow.
* `!Combat-Start` → Begin tracking the current open Turn Tracker at its recognized round-counter value, or round 1 when no counter is present.
* `!Combat-Start --confirm` → Deliberately replace the current CombatAssist encounter baseline.
* `!Combat-Next` → Move exactly one native tracker row through TurnTrackerService.
* `!Combat-Prev` → Move exactly one native tracker row backward without changing the saved round.
* `!Combat-End-Turn --token <ID>` → Player control generated by Whispers mode; advances only when the clicking player still controls the current token.
* `!Combat-Adopt` → Keep the current Roll20 tracker, preserve the round, and begin a fresh cycle from its current entry.
* `!Combat-Restore` → Preview a one-step restoration of the last accepted tracker; confirmation and an unchanged tracker revision are required.
* `!Combat-Pause` → Stop counting while leaving the native tracker untouched.
* `!Combat-Resume` → Keep the round number and accept the current tracker order as a fresh baseline.
* `!Combat-Status` → Review state, round, current turn, page, announcement mode, and tracker readability.
* `!Combat-Audit` → Run the same current tracker and encounter inspection with an explicit read-only result.
* `!Combat-End` → Open a confirmation prompt.
* `!Combat-End --confirm` → Clear only CombatAssist's encounter record; tracker rows remain unchanged.
* `!Combat-Announce gm|public|whispers|off` → Whisper turns to the GM, post them publicly, privately notify the GM and current player, or suppress automatic turn notices.
* `!Combat-Confirm standard|varied` → Choose one direct player turn-completion message or a warmer rotation that contains the Standard sentence exactly once.
* `!Combat-Timer` → Open turn length, deadline audience, and early-reminder controls.
* `!Combat-Timer on|off` → Enable or disable timers without changing initiative.
* `!Combat-Timer duration <seconds>` → Set a 10-3600 second turn length.
* `!Combat-Timer deadline gm|player|both|public` → Choose who hears that the configured turn time elapsed.
* `!Combat-Timer add <seconds-remaining> <gm|player|both|public>` → Add or update one of five early reminders.
* `!Combat-Timer remove <seconds-remaining>` / `clear --confirm` → Remove reminder points.
* `!Combat-Cue off|gm|players|both|public` → Choose who receives Roll20's temporary native current-turn ping.
* `!Combat-Ready on|off|profile <5e|legacy>` → Configure optional Ready/Delay records. The feature starts off and never applies an attack or guesses legacy initiative placement.
* `!Combat-Hold` → Record one authorized held action for the current character and advance the native tracker.
* `!Now` / `!Combat-Now` → Signal that an authorized held action is being used without applying damage, conditions, or resources.
* `!Combat-Cancel-Hold` → Remove an authorized held-action record.
* `!Combat-Timeline` → Review bounded HealthService evidence by encounter, round, or turn boundary without claiming that an HP change proves damage or causation.

CombatAssist counts an exact forward or backward row rotation as turn movement. When exactly one custom item is clearly named **Round**, **Rounds**, **Round Count**, **Round Counter**, **Round Number**, **Round Tracker**, **Combat Round**, or **Current Round**, its positive whole-number value becomes the authoritative round. When CombatAssist moves that row to the top, it evaluates a simple signed whole-number Round Calculation such as `+1`; this replaces the native calculation that Roll20's API-side array write would otherwise skip. Multiple plausible counters are refused rather than guessed. Without a recognized counter, one uninterrupted forward cycle back to the anchor advances the internal round. Backward movement never advances a round.

Valid additions, removals, InitiativeAssist rerolls, priority changes, and manual reordering keep the current round and establish the current first entry as a fresh cycle baseline. If a recognized round counter is present, its displayed value remains authoritative after that rebaseline. These changes do not restart CombatAssist or rewrite Roll20's chosen order.

Pause remains useful when the GM wants to make several changes without intermediate notices. It is no longer required for ordinary roster maintenance. CombatAssist enters **attention** only when it cannot read a trustworthy tracker, such as a closed or wrong-page tracker, malformed data, a stale token reference, duplicate identities, or ambiguous native movement with exactly two entries.

CombatAssist retains the last accepted tracker and one previous checkpoint. **Use Current Tracker** continues from a readable tracker without changing the round. **Restore Last Safe Tracker** or **Undo Last Tracker Change** previews the exact saved entries before a confirmed, revision-guarded restoration. **Restart at Round 1** remains available, but it is not the normal recovery path.

With exactly two rows, Roll20's native forward and backward arrows produce the same visible order. CombatAssist cannot distinguish them. Use **Next Turn**, **Previous Turn**, `!Combat-Next`, or `!Combat-Prev` for a two-row encounter when round counting matters.

Every private GM turn notice includes **Next Turn**, **Previous Turn**, and **Open Menu**. In `whispers` mode, the current linked character's non-GM controller also receives a private **End My Turn** button. A successful click receives its **Turn Complete** confirmation before any next-character **Your Turn** prompt, including when one player controls consecutive characters. The confirmation reports the next initiative without implying the recipient controls it. A linked token visible on the objects layer may be named; GM-layer tokens, unlinked objects, and custom rows use a generic continuation message. An older button explains that the turn has already advanced and makes no additional change. The GM can choose one Standard sentence or a warmer Varied rotation containing that Standard sentence once.

Turn timers are disabled by default. Each callback is bound to the active encounter, round, current token identity, exact tracker revision, and stored deadline. Advancing through Roll20, CombatAssist, InitiativeAssist, or End My Turn invalidates the old callbacks. Pausing, attention, ending, or disabling CombatAssist cancels them. A timer reports elapsed time only and never advances the Turn Tracker. Player-targeted reminders are sent only for visible linked Objects-layer character turns; hidden, unlinked, and custom entries stay with the GM. When the sandbox reloads, a still-valid saved deadline resumes; an already-passed deadline produces no late player reminder.

Current-turn pings are also disabled by default. They use Roll20's native `sendPing()` without recentering anyone's map or changing token state. A GM-layer or otherwise hidden token is restricted to GM visibility even if the configured audience is broader. Custom tracker rows receive no token ping.

Config keys: `enabled`; `announcements` (`gm`, `public`, `whispers`, or `off`; default `gm`); `playerConfirmations` (`standard` or `varied`; default `standard`); `timerEnabled` (default `false`); `timerDurationSeconds` (default `120`); `timerDeadlineAudience` (default `gm`); `timerReminders` (up to five guarded reminder records); and `turnCue` (`off`, `gm`, `players`, `both`, or `public`; default `off`). Saved pre-release `fun` values migrate to `varied`.

### 6.6 ConcentrationAssist

> **Module version:** `0.6.0`<br>
> **Marker service:** ConcentrationAssist uses the integrated `GameAssist.MarkerService`; standalone TokenMod is not required.

`!concentration` or `!cc` opens buttons for normal, advantage, or disadvantage rolls. The case-insensitive `!Con-<command>` and `!Concentration-<command>` families provide equivalent aliases, while the established space-and-`--` syntax remains compatible:

* `help` / `guide` / `--help` → Whisper the compact guide.
* `menu` / `gm` / `dm` → Open the concentration-check buttons. `!Con-GM|DM` and `!Concentration-GM|DM` are the short role forms.
* `info` → Whisper the short module explanation.
* `status` / `--status` → List tokens currently carrying the configured marker.
* `audit` → Run the same marker inspection with an explicit read-only result.
* `manual` → Create or update the stable ConcentrationAssist user-manual handout.
* `settings` / `config` → Open result-message, HP-loss offer, and concentration-marker settings.
* `markers` → Choose a common built-in marker or a custom marker registered in the campaign.
* `marker --value <name-or-tag>` → Validate and save one built-in id, custom display name, or exact custom marker tag; GM only.
* `--damage N` → Roll against DC `max(10, floor(N / 2))`.
* `--mode normal|adv|dis` → Choose roll mode.
* `--last` → Repeat the player’s last recorded check.
* `--off` → Remove the configured marker from selected tokens.
* `--config randomize on|off` → Toggle emote randomization.
* `--config healthPrompts on|off` → Enable or disable optional private HealthService check offers without disabling manual checks.
* `!ga-conc-status` → GM-only snapshot of the most recent concentration DC and damage per player.

The tracker reads a persisted or Roll20-computed `constitution_save_bonus` from a token's represented official 2014 Classic character. If that save data is absent, unreadable, or belongs to the 2024 Beacon sheet, ConcentrationAssist refuses the roll with a next step instead of silently substituting `+0`. Use the 2024 sheet's native concentration roll until a separately verified 2024 adapter is available. Runtime `lastDamage` data self-heals and accepts legacy number entries.

In v0.1.4.3, built-in marker ids, custom marker display names, and exact custom tags resolve to the marker identity Roll20 stores on tokens. If the configured marker cannot be recognized, `!concentration --status` gives an actionable warning instead of silently reporting an incorrect empty result.

In v0.1.5.0, concentration status, add, remove, and teardown operations use MarkerService. Each mutation returns an explicit result, exact stored custom tags remain usable when the campaign registry cannot be read, and unrelated or numbered markers are preserved. ConditionAssist observes MarkerService directly and can describe a configured concentration marker when a matching condition definition exists.

In v2.0.0, fresh campaigns use Roll20's built-in `stopwatch` marker, which does not require a custom campaign marker. A saved `Concentrating` value is preserved when that custom marker exists; only the exact unresolved former stock default migrates to `stopwatch`. Open `!concentration settings` and choose **Choose Marker** to use another built-in or registered custom marker without editing raw configuration.

In v2.0.0, a supported numeric HP decrease can offer one private concentration check when the affected token is already concentrating and both Health Prompts and HealthService are enabled. Verified GameAssist damage is labeled **Damage**. A direct Roll20 or third-party decrease is labeled **Observed HP Loss** because its cause is unknown. Healing, initialization, synchronization, clearing, invalid values, and unrelated HP changes do not prompt. Generated Normal, Advantage, and Disadvantage buttons expire after ten minutes and recheck the latest HP event, current HP, concentration marker, token identity, current controller, and that controller's visible page before rolling. GM-layer and player-hidden token offers remain GM-only, and hidden-token checks do not post a public emote.

Config keys: `marker`, `randomize`, `healthPrompts`.

### 6.7 NPCAssist

> **Marker service:** NPCAssist uses the integrated `GameAssist.MarkerService`; death history remains independent from marker-write success.

> **Module version:** NPCAssist `1.5.0` in GameAssist v2.0.0. NPCAssist `1.0.0` introduced the four-level history model; `1.1.0` added curated Arc management, hierarchical clearing, date rollover, and the report writer; `1.1.1` hardened standalone interoperability and new-token HP initialization; `1.2.0` migrated marker behavior to MarkerService; `1.2.1` added confirmation-gated marker repair; `1.3.0` applies the DM-selected timezone to Session dates and history displays without changing stored event instants; `1.3.1` added compact navigation, status, and a persistent manual; `1.3.2` added equivalent NPC command families and dedicated GM/DM control aliases; `1.3.3` adds configurable GM-private Bloodied threshold notices; `1.4.0` adds optional page-local progressive names; `1.4.1` moves HP-dependent tracking and audits to the shared HP bar; `1.5.0` adds an explicit, deduplicated CombatAssist encounter-summary handoff and stable owned-handout identity.

NPCAssist watches the current HealthService-selected token bar for linked NPC characters with `npc=1`.

* HP below 1 → record the NPC death into the active Campaign, Chapter, Section, and Session buckets, then request the configured `deadMarker`.
* HP above 0 → annotate the matching death entry as revived and request removal of the configured `deadMarker`.
* HP crosses from above half to half or below while still above 0 → whisper the GM once when `notifyBloodied=true` and the selected bar maximum is valid and positive.
* `autoHide=true` → move newly dead NPC tokens to `hideLayer`.

When HPAssist `autoRollOnAdd=true`, NPCAssist treats the short placeholder-HP interval on a newly added token as setup rather than combat. Blank or unknown starting HP is not accepted as evidence that a living NPC crossed below 1 HP. The automatic roll therefore does not flash the death marker, add a false death/revival pair to history, or produce a false Bloodied notice; later known gameplay changes remain ordinary tracked events.

Commands:

* `!npc-death-help` / `!npc-death-guide` → Open the compact NPCAssist guide.
* `!NPC-GM`, `!NPC-Death-GM`, or `!NPCAssist-GM` → Open the NPCAssist Control Center. Replace `GM` with `DM` for the equal Dungeon Master aliases.
* `!npc-bloodied` → Toggle private Bloodied alerts and immediately return to the Control Center. The equivalent NPCAssist command families are also accepted.
* `!npc-numbering` → Toggle automatic page-local NPC names and immediately return to the Control Center. Equivalent NPCAssist command families are accepted.
* `!npc-death-status` → Show current bucket, history, marker, and Arc health.
* `!npc-death-info` → Whisper the short module explanation.
* `!npc-death-manual` → Create or update the stable NPCAssist user-manual handout.
* `!npc-death-report` → Show the active Session bucket summary.
* `!npc-death-report --scope campaign|chapter|section|session` → View a different active bucket.
* `!npc-death-report --recent` → Show the newest recorded death events for the selected bucket.
* `!npc-death-report --page N` → Page through older recorded death events for the selected bucket.
* `!npc-death-report --write` → Open the report writer without immediately changing a handout.
* `!npc-death-report --help` or `!npc-death-help` → Open the central NPCAssist guide for setup, reports, clearing, audits, and Arcs.
* `!npc-death-buckets` → Show active bucket names, counts, report buttons, and rename buttons.
* `!npc-death-buckets --campaign "Name" --chapter "Name" --section "Name" --session "Name"` → Set retained active bucket names.
* `!npc-death-clear --scope session` → Ask for confirmation before clearing the selected active bucket. Defaults to Session.
* `!npc-death-clear --scope session --confirm` → Clear only that active bucket.
* `!npc-death-clear --scope section --nested --confirm` → Clear the active Section and Session while retaining Chapter and Campaign. The same rule applies to other parent levels.
* `!NPC-WR` or `!npc-death-write` → Open the report writer.
* `!npc-death-write --all` → Update all four active handouts.
* `!npc-death-write --scope section` → Update one active handout.
* `!npc-death-write --newSection "Name"` → Start/resume a Section and seed it with only missing deaths from the current Session.
* `!npc-death-audit` → Check the current player page for HP/death-marker mismatches and update the `GameAssist NPC Death Audit` handout.
* `!npc-death-repair` → Re-scan the current page and preview marker corrections based on current selected-bar HP.
* `!npc-death-repair --confirm` → Apply the previewed rule after a fresh scan, changing only the configured death marker.
* `!npc-death-arc` → Show arc bucket help and current arc counts.
* `!npc-death-arc --name "Arc Name"` → Add selected linked PC/NPC tokens to that arc handout.
* `!npc-death-arc --name "Arc Name" --session` → Append current Session bucket deaths to that arc handout.
* `!npc-death-arc --name "Arc Name" --manage` → Open removal, selected-token removal, undo, and Session-import controls.
* `!npc-death-arc --name "Arc Name" --session --allowDuplicates` → Intentionally add repeated entries; ordinary additions deduplicate by creature.

Every NPCAssist command suffix in this section is available through the case-insensitive `!NPC-*`, `!NPC-Death-*`, and `!NPCAssist-*` families. The older `!NPCManager-*` family remains a compatibility alias. For example, `!NPC-Audit`, `!NPC-Death-Audit`, `!NPCAssist-Audit`, and `!NPCManager-Audit` run the same read-only audit.

`!npc-death-report` is a history report. It opens with totals, the latest death, most frequent names, recent entries, and buttons for common next steps. Every new death is written to all four active buckets. A clear confirmation offers either the selected bucket alone or that level and its descendants; for example, clearing Section and below clears Section and Session while retaining Chapter and Campaign. Each bucket has its own handout named like `GameAssist Deaths - Session - 2026-07-17`. Revivals are annotated on the matching entry instead of silently deleting the death. Current entries are matched by token ID, so separate tokens with the same name remain separate records.

The default Session name follows the active GameAssist table date. Choose the table timezone with `!ga-timezone`; when none is selected, GameAssist uses the Roll20 sandbox clock. Before any NPCAssist command or tracked NPC HP change, GameAssist checks the date and moves a date-managed Session to the new `YYYY-MM-DD` bucket. Changing the timezone also refreshes the Session immediately when the named date changes. No death processed after that check is written into yesterday's Session. If the DM explicitly names the Session, that custom name remains active across date changes; **Reset Session Date** restores automatic date-managed rollover.

Arc handouts are curated rosters, not another hierarchy level. A linked creature appears once per Arc by default, so adding selected NPCs and later importing the full Session does not repeat those creatures. The Session import can enrich an existing selected entry with its death record. The management menu can remove one entry, remove all selected tokens, or undo the most recent Arc addition. `--allowDuplicates` is an explicit override for deliberate repetition. Selected-token Arc entries remain general story notes; revival annotations apply only after an entry is linked to Session death history.

`!npc-death-audit` is the read-only mismatch checker. Chat shows a summary plus bounded, token-specific **Add Death Marker** and **Remove Death Marker** groups. The complete list is written to the `GameAssist NPC Death Audit` handout. The audit checks linked NPC tokens on the current player page; player characters are not included. A clean audit means linked NPC tokens have death markers that match their HP. The audit may also note ignored unlinked page items such as party markers, scenery, labels, or props. Blank or non-numeric HP is reported separately and is never treated as zero by repair.

When mismatches exist, **Review Marker Repairs** opens the separate `!npc-death-repair` preview. It explains exactly how many markers would be added or removed and requires confirmation. Confirmation re-scans current HP before acting, verifies each MarkerService change, and preserves HP, death history, report buckets, Arc records, and unrelated markers. This separation matters when the mismatch reveals housekeeping the DM would rather fix manually, such as a revived token whose marker was removed before its HP was restored.

Disabling NPCAssist stops its automation and requests removal of its configured marker from qualifying current-page tokens. Saved Campaign, Chapter, Section, Session, and Arc records remain available after the module is enabled again. Use the NPCAssist clear and Arc-management controls when history should actually be removed.

When automatic NPC names are enabled, a newly added linked NPC on the Objects or GM layer uses its represented character name. If another eligible NPC on that page already uses the name, NPCAssist chooses the lowest available positive suffix. Existing tokens are not renumbered, pages are independent, deleted gaps may be reused, and the GM can turn the feature off or rename a token afterward to make a deliberate duplicate.

The NPCAssist Control Center shows whether automatic names and Bloodied alerts are on and provides one-click Turn On or Turn Off buttons. Bloodied notices are whispered only to the GM and show the NPC name plus current/max HP. They do not add a Bloodied marker, write history, alter Arc records, or repeat while the NPC remains at or below half. Healing above half naturally rearms a later crossing. PCs, unlinked tokens, non-object-layer tokens, deaths, and blank, invalid, zero, or negative maximum HP values do not produce the notice.

Config keys: `autoTrackDeath`, `notifyBloodied`, `autoNumberNpcTokens`, `deadMarker`, `autoHide`, `hideLayer`.

### 6.8 HPAssist

> **Module version:** `0.3.0`<br>
> **Dependency:** HPAssist does **not** require TokenMod.

HPAssist reads `npc=1` and `npc_hpformula` from linked characters, parses `NdM+K` or `NdM-K`, and writes the result to the HealthService-selected NPC token bar. When HealthService is enabled, the roll is recorded as one verified initialization or synchronization operation with HPAssist provenance. If the GM deliberately disables HealthService, HPAssist retains direct Bar 1 rolling; shared bar selection and provenance-aware integration are unavailable until the service returns.

Use either command style below. Commands are not case-sensitive.

* `!HP-Selected` or `!hp selected` → Roll HP for qualifying selected NPC tokens.
* `!HP-All` or `!hp all` → Roll HP for qualifying NPC tokens on the current player page.
* `!HP-Guide` or `!hp guide` → Open the compact guide.
* `!HP-Status` or `!hp status` → Show module and automatic-roll status.
* `!HP-Audit` or `!hp audit` → Count qualifying, skipped, and invalid current-page tokens without changing HP.
* `!HP-Info` or `!hp info` → Whisper the short module explanation.
* `!HP-GM`, `!HP-DM`, `!hp gm`, or `!hp dm` → Open the Game Master HP controls.
* `autoRollOnAdd=true` → Quietly attempt HP rolling when a qualifying NPC token is added.

Older `!HPAssist-*`, `!npc-hp-*`, `!NPCHP-*`, and `!NPCHPRoller-*` macros remain compatibility aliases, but new macros and every HPAssist button use `!HP-<command>` or `!hp <command>`.

Invalid, unlinked, and PC tokens are skipped.

Config key: `autoRollOnAdd`.

Open `!ga-health bars` to choose Bar 1, 2, or 3 for GameAssist NPC HP. **Audit Current Page** identifies linked NPCs needing setup and separately names token candidates that do not represent a character. **Prepare Linked NPCs** previews, then copies each linked NPC character's current and maximum HP into the chosen bar without changing the other two bars. **Link To Sheet HP** is a separate deliberate option because duplicate tokens representing the same character would share one linked HP value.

### 6.9 Config UI

> **Module version:** `0.2.5`

`!ga-config ui` or `!ga-config-ui` whispers a GM-only chat control panel. Shared services appear first in alphabetical order, followed by feature modules in alphabetical order. Each component card can show:

* Current enabled/disabled status with a one-click toggle.
* Boolean configuration keys as chat buttons.
* A brief, wrapping configuration summary that never dumps nested JSON into chat.
* A direct **Manage PC Health Alerts** button on the HealthService card.
* Previous, refresh, and next pagination controls.

Config keys: `pageSize`, `showSummaries`.

Disable ConfigUI if you prefer command-only administration.

Use `!ga-config-ui help|guide`, `menu|gm|dm`, `status`, `info`, or `audit` for the standard compact screens. `!ConfigUI-GM` and `!ConfigUI-DM` open the same settings screen. `!ga-config-ui manual` explains that this brief module keeps its complete guidance in chat.

### 6.10 Debug Tools *(GM-only)*

> **Module version:** `0.3.1`

DebugTools is disabled by default and remains dry-run unless `--apply` is present:

* `!ga-debug damage --amount 12 [--token TOKENID] [--apply]`
* `!ga-debug marker --marker statusname [--state on|off|toggle] [--token TOKENID] [--apply]`
* `!ga-debug save --dc 15 [--bonus 3] [--mode adv|dis|normal] [--label "Text"] [--apply]`

To act on the currently selected token, omit `--token`. Literal `--token select` is not supported.

When HealthService is enabled and the chosen token has a supported HP surface, applied damage is written to the selected shared HP bar and verified as declared DebugTools damage. That makes `!ga-debug damage ... --apply` the live test path for the stronger ConcentrationAssist **Damage** offer. Unsupported tokens and campaigns that deliberately disable HealthService retain the established direct Bar 1 diagnostic.

Typical session:

```roll20chat
!ga-enable DebugTools
!ga-debug marker --marker dead --state toggle
!ga-debug marker --marker dead --state toggle --apply
!ga-disable DebugTools
```

After enabling the module, use `!ga-debug help|guide`, `menu|gm|dm`, `status`, `info`, `audit`, or `settings` for its standard compact screens. `!Debug-GM|DM` and `!DebugTools-GM|DM` open the diagnostic control screen. `!ga-debug manual` explains that the full dry-run-first guidance already fits in chat.

### 6.11 WelcomeAssist *(optional, GM-managed)*

> **Module version:** `0.1.6`<br>
> **Default:** Disabled<br>
> **Automatic behavior:** At most one public greeting per sandbox lifecycle after completed GameAssist startup.

WelcomeAssist gives the table a short opening greeting without turning startup into a wall of status messages. Its default `mixed` mode chooses from the professional greeting, the included built-in greeting library, and any campaign greetings the GM adds. Each campaign greeting has twice the individual chance of one built-in line.

Start here:

```roll20chat
!ga-enable WelcomeAssist
!Welcome
!Welcome-Preview
```

Choose a mode, adjust the greeting if desired, then reload the Mod sandbox. WelcomeAssist waits for the configured delay and confirms that every other enabled GameAssist component is active before it posts. If a component remains unhealthy, the greeting is skipped and the GM receives the component name instead of a misleading ready announcement.

Enabling WelcomeAssist during a running sandbox does **not** post publicly. `!Welcome-Preview` is always private to the GM. `!Welcome-Announce` is the explicit immediate public action and cancels any pending automatic greeting for that sandbox lifecycle.

Main commands:

* `!Welcome` or `!Welcome-Help` → Open the compact action guide; its topic buttons reveal setup, mode, campaign-text, appearance, and startup details.
* `!Welcome-Guide` → Open the same compact guide.
* `!Welcome-Menu`, `!Welcome-GM`, or `!Welcome-DM` → Open private greeting settings and actions.
* `!Welcome-Info` → Whisper the short module explanation.
* `!Welcome-Audit` → Inspect readiness and saved greeting configuration without posting or changing anything.
* `!Welcome-Manual` → Create or update the stable WelcomeAssist user-manual handout.
* `!Welcome-Status` → Review the current mode, delay, header, custom-list count, timer, and current-sandbox announcement.
* `!Welcome-Preview` → Show the next greeting only to the GM.
* `!Welcome-Announce` → Post one greeting publicly now.
* `!Welcome-Mode default|builtin|custom|mixed` → Choose the greeting pool.
* `!Welcome-Delay <seconds>` → Set a delay from 1 to 60 seconds.
* `!Welcome-Header show|hide|<text>` → Control the optional heading.
* `!Welcome-Default <text>` → Replace the professional greeting.
* `!Welcome-Custom list|add|remove|clear` → Manage up to ten campaign greetings; clearing requires `--confirm`.

All short Welcome commands are case-insensitive. The longer `!welcome-assist ...` forms remain accepted so existing campaign macros do not break, but new menus and documentation use the shorter family.

Custom greetings are plain text, limited to 240 characters, deduplicated without regard to capitalization, and escaped before public output. Roll20 inline-roll, attribute, ability, and query syntax is displayed as text rather than executed.

Config keys: `enabled`, `mode`, `delayMs`, `showHeader`, `header`, `defaultGreeting`, and the protected `customGreetings` list.

---

### 6.12 EffectAssist *(optional, player-capable and GM-managed)*

> **Module version:** `2.5.4`<br>
> **Default:** Disabled<br>
> **Launch sheet:** Official D&D 5E by Roll20 2014 sheet. The 2024 sheet and other character sheets are deferred until their contracts can be implemented and tested separately.

EffectAssist records **why** an effect exists instead of treating a marker or character-sheet field as the complete truth. Each active instance retains its source character and token, exact targets, concentration dependency, stacking group, duration guidance, creator, lifecycle, and every visible or mechanical projection it manages.

Start here:

```roll20chat
!ga-enable EffectAssist
!effect
```

Select the target tokens, run `!effect`, choose an effect, and choose its source. By default, EffectAssist immediately applies the supported marker and sheet changes after the source is chosen. The optional **Application Review** setting restores a review panel before anything changes. A new concentration effect normally ends the source's previous concentration effect automatically; the advanced **Allow Multiple Concentration** setting is available for campaigns that deliberately use exceptional rules.

| Effect | Catalog level | Automatic in v2.0.0 | Still handled at the table |
| --- | --- | --- | --- |
| **Bless** | Marker and sheet automation | Target marker; 2014-sheet `1d4` global attack and save rows; source concentration; linked cleanup. | Choose legal targets and end early when a non-concentration rule requires it. |
| **Guidance** | Marker and sheet automation | Target marker; uniquely labeled 2014-sheet `1d4` global skill row; source concentration; linked cleanup. One unambiguous supported sheet skill check consumes one matching active Guidance instance. | Use **Use Guidance** for an ability check that is not represented by a sheet skill, or whenever the roll evidence is unsupported, ambiguous, pre-existing, or edited. |
| **Warding Bond** | Marker and sheet automation | Target marker; 2014-sheet `+1` AC and saving-throw rows. | Resolve resistance and mirrored damage. |
| **Haste** | Marker and sheet automation | Target marker; 2014-sheet `+2` AC row; source concentration; linked cleanup. | Resolve speed, Dexterity-save advantage, the restricted action, and ending lethargy. |
| **Holy Weapon** | Tracked; mechanics manual | Target marker; source concentration; linked cleanup. | Apply bonus damage only to the affected weapon and resolve the optional burst. A global damage row is deliberately not used because it would affect every weapon. |
| **Pass Without a Trace** | Tracked; mechanics manual | Target marker; source concentration; linked cleanup. | Add `+10` only to affected Stealth checks and maintain the area-based target list. The 2014 global skill row is deliberately not used because it would affect every skill. |

The catalog separates **Marker and Sheet Automation** from **Tracked; Rules Stay Manual** before the GM or player chooses an effect. Gift of Alacrity, Longstrider, and Beacon of Hope are not built-in launch entries because marker-only treatment would not remove enough table work to justify prominent buttons. A GM may still create a guided custom marker, condition, or record-only effect when tracking one of those rules is useful.

Players can run `!effect` or a direct spell shortcut and apply a built-in effect from a linked source token or character they control. Source buttons lead to Roll20's native map targeting, so a player can choose a visible linked recipient without controlling that recipient. Every application rechecks source identity, page, visibility, and control; optional review adds a separate confirmation without weakening those checks. Hidden or off-page recipients use **Ask the GM**; the request remains available briefly in `!Effect-Requests` and the GM Control Center instead of depending on one easy-to-miss whisper. The GM retains the custom-effect, status, audit, repair, and configuration screens and can lock or restore player casting at any time.

Every recipient used for sheet automation must be a token linked through **Represents Character**. A refusal names each affected token, distinguishes an empty link from a stale character reference, and explains the exact Roll20 correction. Compatibility reads accept Roll20's `represents` and `_represents` forms, but neither is allowed to hide a broken character reference. Concentration effects also verify the configured ConcentrationAssist marker before writing any target marker or sheet row; a failed dependency leaves no partial Bless, Guidance, Haste, Holy Weapon, or Pass Without a Trace application. A successful result identifies the exact source token and layer whose concentration was established, which keeps duplicate tokens representing one character independent.

EffectAssist can also recognize an exact Bless card from the official D&D 5E by Roll20 2014 `spell` template. Recognition succeeds only when the spell name, character name, active page, linked source token, and player control identify one caster without ambiguity. It creates one short-lived private proposal for the GM; it does not apply Bless, select recipients, establish concentration, or change a marker or sheet field. The GM selects the actual recipient tokens and uses **Review Selected Recipients** to enter the same application path as the catalog: direct application by default, or a preview and confirmation when **Application Review** is on. Repeated copies of the same chat card are suppressed, and a proposal can be used only once.

Spell-card target wording is descriptive and is never interpreted as token identity. Unsupported spells, ambiguous character names or source tokens, and 2024-sheet cards do not create effect instances. Use `!Effect-Casts` to review pending proposals or `!Effect-Recognition on|off` to control the shortcut. The manual `!effect` catalog remains the complete and reliable path whether recognition is on or off.

Guidance uses a narrower automatic ending rule. EffectAssist labels only the global skill row it creates, then watches for that exact label in an official 2014 simple skill-check roll made by the target's controller. It ends one matching active Guidance through the ordinary ownership-safe cleanup path only when the character and instance are unique. Advantage and disadvantage remain eligible when Roll20 retains the owned label. An unrelated `d4`, an unsupported template, a non-skill ability check, a pre-existing row, an edited row, or more than one possible instance does nothing automatically; use the generated **Use Guidance** button instead.

Two sources applying the same non-stacking effect to one target remain separate instances but share each effective projection. Ending one source leaves the other source's marker and sheet rows in place. Ending the final source removes only the state EffectAssist originally created. Matching markers or modifier rows that existed first remain untouched, and the completion panel names preserved campaign state instead of implying that it was removed.

Removing the final managed target marker or condition manually ends that effect, clears its source concentration when EffectAssist owns it, and performs ownership-safe sheet cleanup. Removing only one target marker from a multi-target effect remains visible drift that Audit can repair. Removing the source's Concentrating marker, clearing concentration through ConcentrationAssist, or using **End Effect** also ends the dependent effect and performs the same guarded cleanup.

Built-in effects also carry formal duration rules. When an effect begins during an active CombatAssist encounter on the same page, EffectAssist records the accepted round and initiative point. When TimeAlmanac is active, it records the committed fictional minute as a second optional source of evidence. Reaching either verified boundary creates a private **Effect Duration Review** item for the GM; the effect remains active until the GM ends it or another established ending rule, such as lost concentration, resolves it.

Tracker rebases, initiative edits, backward movement, disabled providers, and effects created before duration tracking are not guessed through. Ending an encounter before a tracked round boundary produces a reminder rather than an expiration claim. Large Almanac jumps are compared once instead of replaying every elapsed minute. The GM can keep a candidate active, reopen that decision later, turn duration candidates off, or continue using the existing manual End Effect controls.

Main commands:

* `!Effect-GM`, `!Effect-DM`, or `!Effect-Menu` → Open the Game Master control screen.
* `!Effect-Guide` or `!Effect-Help` → Open the compact quick-start guide.
* `!effect` or `!Effect-Catalog` → Open the focused launch catalog directly.
* `!Bless`, `!Guidance` / `!Guide`, `!Haste`, `!Warding-Bond`, `!Holy-Weapon`, or `!PwoaT` → Open a compact source-and-review path for that effect; commands are case-insensitive.
* `!Effect-Active` → Manage active instances and end one exact source.
* `!Effect-Status` → Review compact module, record, health, and player-casting totals without printing the full active/recent history.
* `!Effect-Casts` → Review short-lived official 2014 Bless proposals waiting for GM-selected recipients.
* `!Effect-Recognition on|off` → Enable or disable supported spell-card proposals without changing the manual catalog.
* `!Effect-Requests` → Review short-lived player requests, then use selected tokens or Roll20 map targeting before the ordinary preview and confirmation.
* `!Effect-Duration` → Review active duration rules and GM-only expiration candidates or encounter-end reminders.
* `!Effect-Durations on|off` → Allow or stop duration-provider candidate processing without deleting active effects or saved evidence.
* `!Effect-Definitions` → Review built-in and campaign definitions with automatic, assisted, and informational behavior.
* `!Effect-Audit` → Compare semantic records, exact targets, ownership ledgers, markers, conditions, concentration, and sheet rows without changing anything.
* `!Effect-Repair` → Reopen the audit unless a fresh one-use confirmation grant is supplied by the audit button.
* `!Effect-End --id <generated-id>` → End one exact source instance; ordinary menus generate this button so the GM need not memorize IDs.
* `!Effect-Info` → Explain source ownership, overlap, and current supported boundaries.
* `!Effect-Manual` → Create or update the stable EffectAssist user-manual handout.
* `!Effect-Players on|off` → Allow or lock player use of built-in casting controls; GM application remains available.
* `!Effect-Settings` → Open the ordinary EffectAssist settings screen.
* `!Effect-Review on|off` → Require or skip the application review panel; the default is `off`.
* `!Effect-Advanced` → Open exceptional-rules settings.
* `!Effect-Multiple-Concentration on|off` → Permit or refuse multiple concentration effects from one source; the default is `off`.
* `!effect <command>` → Use the same controls through the case-insensitive spaced command family.

Audit reports missing tokens, token representation changes, unavailable projections, missing or changed markers and sheet rows, missing ownership records, orphaned owned state, and malformed preserved records. Repair is offered only for safe current mismatches, is bound to the GM who ran the audit, expires after five minutes, rechecks the complete mismatch signature, and verifies the result. If a GM edits an EffectAssist-created sheet row, cleanup preserves that edited row and marks the instance for attention instead of deleting the GM's work.

Disabling EffectAssist stops its commands and future automation while preserving valid active records, ended history, definitions, and existing projections. Re-enable it and run Status or Audit before continuing. MarkerService, ConditionAssist, or ConcentrationAssist can be unavailable without corrupting the semantic record; affected projections remain visible as pending or needing attention.

Config keys: `enabled`, `allowPlayerCasting`, `castRecognition`, `durationCandidates`, `reviewApplications`, `allowMultipleConcentration`, the protected `markerOverrides` map, and the protected `customDefinitions` map. In v2.0.0, the two protected maps are reserved for validated release data and are not edited through `!ga-config`; GMs use the built-in catalog or the guided custom Marker, Condition, and Record Only choices.

---

### 6.13 HealAssist *(optional, player-capable and GM-managed)*

> **Module version:** `1.2.1`<br>
> **Default:** Disabled<br>
> **Launch sheet:** Official D&D 5E by Roll20 2014 sheet. The 2024 sheet and other character sheets require separate verified adapters.

HealAssist provides a guided path between deciding to heal and changing a character's HP. It does not replace the native sheet, spend spell slots or items, interpret arbitrary spell cards, reverse damage, or manage temporary HP. HealthService remains the only GameAssist authority used to read and write supported HP.

Start here:

```roll20chat
!ga-enable HealAssist
!Heal-GM
```

Choose **Healing Actions** or **Maximum Healing**, select a linked healer, choose a supported action, and identify the recipients. Cure Wounds, Healing Word, Heal, potions, and other actions with exactly one legal recipient open Roll20's target prompt directly; they do not pause at a redundant **Choose 1 Recipient** screen. Multi-recipient actions still ask how many targets are involved. Automatic mode is the default for new configurations: HealAssist rolls once and applies the verified result after recipient selection. The GM may choose Require Review to see the formula together with every recipient's current HP, proposed HP, maximum HP, and actual gain before an expiring one-use confirmation. Existing saved mode choices are retained. Automatic failures make no success claim and send the GM a private diagnostic.

Supported launch actions are Cure Wounds, Healing Word, Prayer of Healing, Mass Healing Word, Mass Cure Wounds, Heal, the four 2014 healing-potion grades, and a bounded manual healing formula. Spell actions ask for slot level and, where required, the healer's Intelligence, Wisdom, or Charisma modifier. They never guess multiclass rules or consume the selected resource. The result reminds the table to mark off the spell slot, item, or feature manually.

Players may start from a linked healer they currently control. Roll20's native target prompt lets them choose visible supported PC recipients even when they do not control those recipients. NPC, GM-layer, hidden, and off-page placement becomes a retained private GM request; NPC names and HP are never published through that player path. The GM may lock player healing without disabling HealAssist.

For public result messages, HealAssist announces only visible PC recipients and reports the amount each actually regained after the maximum-HP cap. Private mode keeps every result between the acting player and GM. Internal roll evidence is GM-private in both modes.

Multi-target healing is one operation in both modes. Every recipient is revalidated before the first write. If a later verified write fails, HealAssist attempts to restore earlier recipients to their starting values and reports the failure instead of presenting a partial action as complete. Old, reused, fabricated, expired, or stale buttons are refused without another roll or HP change.

Main commands:

* `!Heal`, `!Heal-Menu`, or `!Heal Catalog` → Open the healing-action catalog.
* `!Heal-Max` or `!Heal maximum` → Open the maximum-healing catalog; dice use their maximum possible result while flat healing remains unchanged.
* `!Heal-GM` or `!Heal-DM` → Open the private Game Master control center.
* `!Heal-Guide` or `!Heal-Help` → Open the compact quick-start guide.
* `!Heal-Status` → Review module availability, player permission, result audience, and current transient workflow counts.
* `!Heal-Audit` → Run a read-only review of configuration, HealthService availability, and pending workflow counts.
* `!Heal-Requests` → Review retained player requests that require GM placement or NPC access.
* `!Heal-Players on|off` → Allow or lock player-started healing; GM workflows remain available.
* `!Heal-Results public|private` → Choose safe public PC summaries or private results.
* `!Heal-Auto on|off` → Use the default automatic verified application (`on`) or require review-before-apply (`off`). Existing saved choices are retained.
* `!Heal-Info` → Review ownership boundaries and supported behavior.
* `!Heal-Manual` → Create or update the stable HealAssist user-manual handout.
* `!HealAssist-<command>` → Use the compatibility command family for the same guarded controls.

Config keys: `enabled`, `allowPlayerHealing`, `autoApply`, and protected `resultAudience`. Pending source choices, requests, and confirmations are sandbox-local safety capabilities and are not exported or restored after a restart.

---

### 6.14 AttackAssist *(optional, player-capable and GM-managed)*

> **Module version:** `1.1.0`<br>
> **Default:** Disabled<br>
> **Launch sheet:** Official D&D 5E by Roll20 2014 player-character repeating attacks. The 2024 sheet and NPC action rows require separate verified adapters.

AttackAssist provides a shorter route from “I attack that token” to the familiar 2014 attack result. It does not replace the character sheet, apply damage, write HP, spend ammunition or spell slots, change conditions or effects, or move initiative.

Start here:

```roll20chat
!ga-enable AttackAssist
!Attack-GM
```

Select a linked 2014 character token and run `!Attack`. AttackAssist verifies the character, reads its repeating attacks by stable Roll20 row identity, and presents the available names in the sheet's saved order. Two attacks may share a display name; numbered menu labels keep them distinct while the saved row ID determines which formula is rolled.

After the attack is chosen, Roll20's native target prompt lets the player point at a visible token without controlling it. The target is used only for the after-roll announcement. Hidden, GM-layer, or off-page placement becomes a retained request in `!Attack-Requests`, where the GM chooses or selects the target privately.

By default, choosing the target submits the attack immediately using the character sheet's saved roll setting. The GM can enable **Review Before Roll** from `!Attack-GM` or with `!Attack-Review-Mode on`; that optional review offers **Use Sheet Setting**, **Normal**, **Advantage**, and **Disadvantage** before each attack. AttackAssist preserves the verified sheet-generated `atk` or `atkdmg` template, materializes the selected repeating row and its nested Classic-sheet fields, and submits the result as the acting character. Documented 2014 defaults are supplied when Roll20 did not persist them as attributes: the ordinary critical range, checked attack and first-damage flags, unchecked second-damage and save flags, and inactive sheet toggles. If the sheet is configured to ask about whispering or advantage on every roll, an API-authored roll cannot open those client prompts; AttackAssist therefore uses the sheet's first documented choices, Public and Normal. Any other interactive prompt, circular reference, or genuinely unknown field is reported before `sendChat`, so malformed dice input cannot disable the sandbox. AttackAssist never temporarily changes the character's saved settings. Once one optional review button is used, the other buttons from that review expire.

AttackAssist sends the completed sheet command directly through Roll20 so the normal attack card, dice result, and configured whisper audience remain visible. It then shows a compact submission notice without consuming or duplicating the roll. A GM-reviewed hidden or off-page target remains private. CritAssist sees a supported natural-1 attack exactly once.

Main commands:

* `!Attack` or `!Attack-Menu` → Choose an authorized attacker and verified repeating attack.
* `!Attack-GM` or `!Attack-DM` → Open the private Game Master control center.
* `!Attack-Guide` or `!Attack-Help` → Open the compact quick-start guide.
* `!Attack-Status` → Review player permission, available sources and attacks, and transient workflow counts.
* `!Attack-Audit` → Run a read-only current-page review of verified and unsupported repeating rows.
* `!Attack-Requests` → Review retained player requests for hidden, GM-layer, or off-page target placement.
* `!Attack-Players on|off` → Allow or lock player-started guided attacks; GM workflows and native sheet rolls remain available.
* `!Attack-Review-Mode on|off` → Show roll-mode choices before each attack, or use the default immediate sheet-setting submission.
* `!Attack-Info` → Review the roll contract, privacy behavior, and module boundary.
* `!Attack-Manual` → Create or update the stable AttackAssist user-manual handout.
* `!AttackAssist-<command>` → Use the full module-name command family for the same guarded controls.

Config keys: `enabled`, `allowPlayerAttacks`, and the protected `reviewBeforeRoll` setting managed through AttackAssist controls. Source choices, retained requests, and one-use submissions are sandbox-local safety capabilities and are not exported or restored after a restart.

---

### 6.15 AlmanacAssist *(optional, GM-managed world context and deliberate rests)*

> **Module version:** `2.0.6`<br>
> **Status:** Alpha Testing<br>
> **Default:** Disabled<br>
> **Launch sheet for RestAlmanac:** Official D&D 5E by Roll20 2014 PC sheet. Time, Climate, Astronomy, Weather, and Environment do not require a character sheet.

All six Almanac systems are included in this alpha. Enable only the systems you want to try, use **Current Settings** for everyday world setup, and preview announcements before sharing them. Keep a campaign copy before imports or substantial calendar changes, and test rest writes on disposable characters. The [Almanac testing guide](Smoketest.md#focused-v200-complete-almanacassist-acceptance) provides focused checks and troubleshooting steps.

AlmanacAssist is one GameAssist module with two deliberate modes. **Session Mode** keeps the current place, coherent scene, date, weather, travel, events, rest, and announcements ready for play through compact GM palettes. **Worldbuilding Mode** manages geographies, biomes, ecoregions, locations, phenomena, local temporal contexts, presets, Wayfarer definitions, and WorldPacks. The six systems share context when available, but none is a hidden prerequisite for another: Weather has fallbacks, Environment accepts a manual override, Astronomy can use a manual day and season, and Rest does not require fictional-time advancement.

Start here:

```roll20chat
!ga-enable AlmanacAssist
!aa-gm
!Almanac-Systems
```

| System | Short command | Responsibility |
| --- | --- | --- |
| **TimeAlmanac** | `!date`, `!time`, `!cal`, `!aa-time` | Owns one elapsed fictional-minute value and presents it through Standard, Solamnic, Harptos, or campaign-edited Wayfarer calendars. It supports deliberate advancement, confirmed reversal or exact setting, bounded history, and dated holidays. |
| **ClimateAlmanac** | `!clim`, `!aa-climate` | Manages built-in or campaign climate profiles, bounded regions, parent inheritance, regional overrides, and a manual season fallback. |
| **AstronomyAlmanac** | `!astro`, `!aa-astro` | Calculates configurable moon phases, daylight, solstice/equinox boundaries, bounded forecasts, and separately configured weighted rare celestial events. |
| **WeatherAlmanac** | `!weather`, `!aa-weather` | Generates continuity-aware current weather, bounded forecasts, lockable or manual conditions, and readable history using whatever Time and Climate context is available. |
| **EnviroAlmanac** | `!enviro`, `!aa-enviro` | Converts current weather or a GM override into descriptive visibility, temperature, precipitation, wind, ground, water, exposure, severity, and tags. It does not silently impose rules penalties. |
| **RestAlmanac** | `!rest`, `!aa-rest` | Previews and revalidates Short, Long, Extended, or bounded custom rests for selected linked 2014 PCs. Long Rest writes only verified HP, Hit Dice, and spell-slot fields; optional fictional-time advancement is part of the same confirmed transaction. |

Main commands:

* `!Almanac`, `!aa`, `!aa-gm`, `!aa-dm`, `!Almanac-GM`, `!Almanac-DM`, or `!Almanac-Menu` → Open the private, action-first AlmanacAssist control center.
* `!aa-preview` → Privately preview the date/time announcement exactly as configured.
* `!aa-announce` → Send the configured announcement to public chat or the GM.
* `!aa-announcement-settings` → Choose Off, Descriptive, Detailed, or Technical presentation, public or GM-only delivery, an information preset, and a custom heading.
* `!aa-announcement-fields` → Give date, time, season, observances, moon phases, weather, climate, and environment their own Off, Descriptive, Detailed, or Technical presentation.
* `!aa-more` → Open system toggles, status, audit, and reference tools that are intentionally kept off the daily-use screen.
* `!Almanac-Systems` → Turn any of the six internal systems on or off without deleting its valid settings or history.
* `!Almanac-Status` → Review current system availability and compact world context.
* `!Almanac-Audit` → Run a read-only health review across all six systems.
* `!Almanac-Guide` or `!Almanac-Help` → Open the compact navigation guide.
* `!Almanac-Manual` → Create or update one stable AlmanacAssist user-manual handout.
* `!aa-wayfarer` → Open the compact Wayfarer home for using the saved calendar, editing a draft, previewing, activating, copying, or recovering.
* `!aa-world` → Open Worldbuilding Mode and its grouped definition tools.
* `!aa-palette` → Choose climate, biome, geography, ecoregion, or seasonal profiles for the current place; create and customize reusable campaign copies.
* `!aa-palette seasons` → Map calendar season names to weather responses without renaming your seasons.
* `!aa-scene` → Review the one resolved current scene; `!aa-scene details` includes field-level provenance and coherence notes.
* `!aa-location` → Name the current place, create a location, or choose a saved place. Detailed settings and travel lists have their own buttons.
* `!aa-travel` → Open current road guidance, plan travel from pace and mileage, privately roll interval-based encounter checks, or continue destination-based journeys.
* `!aa-events` → Open celestial-omen, travel-check, and campaign-phenomena choices without generating hidden encounter content or applying mechanics.
* `!aa-phenomena` → Manage explicit temporary or magical scene overlays without rewriting the underlying world.
* `!aa-temporal` → Define and preview local time contexts while preserving the one authoritative base chronology.
* `!aa-presets` → Preview immutable versioned starter worlds and install editable copies without replacing existing locations.
* `!aa-rules` → Enable optional D&D 5E (2014) or system-neutral read-only guidance; it never applies gameplay changes.
* `!aa-worldpack` → Export, preview, and atomically import bounded campaign-world definitions through the owned WorldPack handout.
* `!aa-wayfarer handout` → Open the advanced complete-calendar handout workflow; imports replace only the unreviewed saved draft.
* Focused systems also accept standard, case-insensitive role and reference routes with a hyphen or space, such as `!Weather-GM`, `!weather dm`, `!Weather-Help`, `!Weather-Status`, and `!Weather-Audit`. The same pattern applies to Time, Calendar, Wayfarer, Climate, Astronomy, Environment, and Rest.

### Session Mode And Worldbuilding Mode

`!aa-gm` is the daily screen. It puts current conditions and direct weather generation first, followed by time/date, travel, rest, astronomy, environment, events, announcements, location, and calendar actions. Long definition lists, raw provenance, transfer tools, and diagnostics remain behind named buttons.

`!aa-world` is the construction screen. **Regions** and **subregions** are GM-named places. **Geography** describes physical land and water; a **Biome** describes vegetation, aridity, ground, and water availability. A reusable **Ecoregion Profile** combines a climate, biome, and geography; an **Ecoregion Area** places that combination within a region. A **Location** supplies the playable place and local adjustments. Dependency checks prevent deleting a definition that another definition still uses.

### Current Settings And Saved Places

Open **Current Settings** from `!aa-gm`, or type `!aa current`. No region tree or ecoregion-area setup is required.

1. **Choose Climate** sets the regional weather pattern. **Choose Biome** sets the landscape. Both offer named buttons, with up to eight choices per page.
2. **Ecoregion Starters** offer twelve ready-made combinations of biome, geography, and local adjustments. They leave your chosen climate unchanged. A new starter replaces its biome/geography pair and retains your optional local details.
3. **Local Details** adds optional Geography, Terrain, Environment, Hydrology, and Vegetation. Choosing a new value replaces that layer, rather than stacking repeated clicks. **Remove** drops its extra influence.
4. **Seasons** shows the current local-calendar season and lets you choose its weather response. **Weather Breakdown** shows the climate, every local influence, GM adjustments, seasonal change, and the final starting point for generation. Routine menus keep those calculations out of the way.
5. **Generate Weather** uses the current setup and season. Changing settings alone leaves current weather untouched. **Weather > More Weather Controls** contains forecasts and manual weather entry.
6. **Save Current Settings > Save As New Location** records the complete setup under a name and makes it the active place. **Recall Location** restores it on a later visit without advancing time or restoring an old weather roll. Generate new weather when ready.

**Fine-Tune Values** edits climate values, local profile adjustments, individual layers, extra GM adjustments, and landscape descriptions. **Save Custom Profile** keeps the local layers and descriptions for reuse with other climates; it does not copy the regional climate or extra GM adjustments. Editing a selected copy does not change its reusable definition. Names and descriptions may contain spaces and apostrophes; embedded double quotation marks are refused with an explanation rather than saving truncated text.

Named places keep independent copies of their settings. Subsequent edits remain working changes until you choose **Update This Location** and confirm. Recall asks before replacing unsaved edits; **Fine-Tune Values > Discard Working Changes** returns to the saved setup. Working settings survive a sandbox restart. WorldPacks include saved places and custom profiles, but not unsaved working settings. Older snapshots remain readable; their original custom influence values are preserved.

Climate must be enabled for matrix values to influence weather; Weather must be enabled to generate it. Locks and explicit environment overrides remain in force. These profiles are editable game aids, not a physical climate simulation. Environment layers describe outdoor exposure and shelter; indoor weather and underground microclimates require a GM environment override. Terrain and vegetation descriptions remain advisory and do not impose movement penalties.

| Current Settings category | Choices | Examples |
| --- | --- | --- |
| Climate | 17 | Temperate, Desert, Tropical Monsoon, Mediterranean, Polar Ice Cap |
| Biome | 16 | Temperate Woodland, Hot Desert, Freshwater Wetland, Alpine Meadow |
| Ecoregion starter | 12 | Hot Desert Basin, Wet Coastal Woodland, Cold Peat Lowlands |
| Geography | 12 | Coastal Plain, River Valley, High Plateau, Mountain Range |
| Terrain | 8 | Maintained Road, Rocky Ground, Loose Sand, Soft Mud, Snow Cover |
| Environment | 5 | Open Country, Exposed Ridge, Sheltered Hollow, Built-Up Settlement, Open-Air Ruins |
| Hydrology | 8 | Streams, River, Lake, Marsh, Estuary, Open Coast, Frozen Waterways |
| Vegetation | 8 | Grasses, Scrub, Dense Forest, Reeds, Cultivated Fields, Fungal Growth |

Seasonal responses can be Cold, Mild Wet, Warm, Cooling, Rainy, Dry, Little Seasonal Change, or four custom adjustments. A shared response update requires confirmation because it affects every location using that season name. The climate's **Season temperature strength** scales its temperature contribution: `0` disables that temperature change, `1` uses it as entered. Humidity, precipitation, and wind use their own adjustments. Weather Breakdown explicitly flags an unmapped season.

### Choose World Profiles

The existing linked-world controls remain under **More Tools > Reusable Definitions**, or `!aa-palette`. For locations using that model, choose an **Ecoregion Profile**, preview it, and select **Use for This Location**, or choose climate, biome, and geography separately. Locations saved through **Current Settings** are edited there instead; their independent snapshots do not follow later shared-profile edits. **World Records** retains the advanced location and region hierarchy.

| Palette | Built-in choices | Examples |
| --- | --- | --- |
| Climate | 17 | Desert, Equatorial Rainforest, Tropical Monsoon, Mediterranean, Temperate Maritime, Humid Continental, Polar Tundra, Polar Ice Cap |
| Biome | 16 | Temperate Woodland, Tropical Rainforest, Grassland, Hot Desert, Wetland, Mangrove, Alpine |
| Geography | 12 | Coastal Plain, River Valley, High Plateau, Mountain Range, Rain Shadow, Island Chain |
| Ecoregion Profile | 12 | Temperate Wooded Lowlands, Hot Desert Basin, Tropical River Forest, Cold Peat Lowlands, Polar Tundra Coast |
| Seasonal response | 7 | Cold, Mild Wet, Warm, Cooling, Rainy, Dry, Little Seasonal Change |

Profile lists show eight choices per page. **Create Editable Copy** saves a campaign version; **Edit Saved Profile** changes that version without modifying the starter library. Choosing a profile affects only the location named in the panel. Editing a shared saved profile affects places that follow it; independently assigned local biome and geography choices remain independent.

### Name And Prepare Locations

Open `!aa-location`. **Name This Place** names the current location without changing its settings or rerolling weather. **Create Location** asks only for a name, starts from the current physical setup, and opens the new location's settings without moving the party.

Use **Choose World Profiles** to configure that saved destination before visiting it. **Move Party Here** opens a preview; **Move Party** confirms the change. An unchanged starter is shown as **Unnamed Starting Place**, not as an invented campaign location. Existing saved places are never automatically deleted.

**Manage Locations** provides settings for saved places, eight per page. **Context and Notes** contains region and area choices, local weather adjustments, private notes, page associations, prepared/favorite controls, and confirmed removal. **Travel Lists** shows prepared, favorite, and recent places separately; the current place is not repeated as a destination, and an empty prepared list stays empty.

For advanced handout-based editing, open **WorldPack Handout** from **Context and Notes**. This uses the existing JSON export, edit, preview, and import workflow for world definitions, including locations. Ordinary prose notes are not imported as location settings.

**Regions** provides names, parent/subregion choices, climate selection, and **Settings > Fine Tune** for local adjustments. Region, geography, biome, and local-time selectors display names rather than asking the GM to remember internal IDs.

**Seasons** follows the active calendar. Wayfarer's Vernalrise, Summertide, Leafturn, and Frosthold already have responses. For a custom season, choose a response or customize its temperature, humidity, precipitation-chance, and wind adjustments. An unmapped season uses the base climate and shows a setup note; it is not silently treated as Spring. Season dates remain in the calendar editor.

### Weather From Your Place

After changing profiles, choose **Generate Weather**. Profile selection alone retains current weather. With **Current Settings**, generation combines the climate baseline, local profile adjustments, each chosen layer, GM adjustments, and the current seasonal response. Weather Breakdown shows that sum; elevation and biome adjustments are not added a second time. Locations using the linked-world controls retain their climate, season, elevation, coast, biome wetness, and local adjustments. In that model, a location-specific climate takes precedence over its ecoregion profile, which takes precedence over regional inheritance.

Forecasts use the calendar season on their future dates. Continuity applies only within the same place and climate context, so changing from a rainforest to an ice cap cannot carry warm rain into freezing generated weather. Rain reduces visibility, and biome ground remains recognizable beneath rain or snow instead of becoming generic firm ground.

Climate temperatures are seasonal baselines, not a second current temperature. Locked weather remains locked. Manually entered weather is preserved on location changes; explicit generation can replace it when unlocked. A GM environment override is retained and labeled separately until **Follow Weather Again** is chosen.

The built-in numbers are editable game defaults, not measured climate normals. Rain/snow uses a simplified freezing threshold. Latitude and descriptive topography remain world information; this release does not simulate planetary circulation or infer mapped rain shadows.

`GameAssist.AlmanacAssist.getScene()` is the single authority for the current resolved scene. It returns a defensive snapshot with provenance for every composed field. Active phenomena overlay the snapshot but never overwrite the saved location, climate, weather, or environment definition. If a subsystem is off or unavailable, the scene records that limitation instead of presenting stale data as current.

Travel is review-first. Choosing a prepared destination previews route, pace, duration, destination, and resulting scene without changing anything. Only acceptance starts the journey; progress advances the one base chronology exactly once per accepted step, and completion changes the active location while retaining bounded history.

The mileage planner begins with **Slow** (2 mph), **Normal** (3 mph), **Fast** (4 mph), or a bounded custom pace. The GM enters miles, an encounter-check interval, and a die with at least four sides. The preview shows duration, estimated arrival, current road and visibility guidance, and check count before offering **Advance Time & Roll**, **Advance Time Only**, or **Roll Checks Only**. Every started interval receives one check. Results use 1-2 for **Negative**, the die midpoint rounded up for **Neutral**, the maximum for **Positive**, and every other result for **No encounter**; therefore a d4 uses 1-2 Negative, 3 Neutral, and 4 Positive. Results stay GM-private and advisory. AlmanacAssist does not choose creatures, impose movement changes, apply damage, or reveal private campaign information.

Travel hours and hourly check choices follow the active calendar clock, including Wayfarer's 75-minute hour. Mileage travel records progress without changing the named location; use a prepared-destination journey when the active location should change on arrival.

Local temporal contexts change how a place displays time. They do not create a second campaign chronology and never rewind rests, effects, combat, NPC history, or character resources. Year `1` remains elapsed fictional minute zero for saved-campaign compatibility; valid Year `0` dates use signed elapsed minutes without shifting existing dates.

WorldPacks contain bounded world definitions, Almanac configuration, and an optional Wayfarer draft. They never contain the active fictional minute, travel runtime, preview grants, character data, or module runtime caches. Import validates syntax, schema, object limits, references, conflicts, and the complete definition graph before one atomic commit. Imported records retain their pack/source provenance, and an imported Wayfarer calendar remains an unreviewed draft until its separate activation workflow succeeds.

Current policy permits 8 quick actions, 100 locations, 60 ecoregion areas, 30 reusable ecoregion profiles, 32 seasonal response rules, 40 biomes, 40 geographies, 30 phenomena, 30 prepared destinations, 20 page associations per location, 20 temporal contexts, 10 retained WorldPack manifests, and 50 travel-history entries. One reviewed mileage plan may contain at most 200 encounter checks, and chat shows at most 40 individual results while retaining the bounded record. A WorldPack handout is limited to 120,000 characters, 500 nested objects/arrays, and 8 levels of depth. These are validation boundaries, not recommended campaign targets; over-limit input is refused before mutation.

### Build A Custom Wayfarer Calendar

Wayfarer is for campaign worlds whose calendar does not match Standard, Solamnic, or Harptos. Setup uses a saved draft, so you can stop, check your notes, and return later without changing the calendar or date currently shown to players.

Open `!aa-wayfarer` to reach the compact **Wayfarer Calendar** home. **Use Wayfarer** switches directly to the last saved Wayfarer definition with one confirmation; it does not force an already usable calendar through draft construction. Choose **Edit Calendar** only when changing the draft. The focused edit menu gives direct access to every calendar component, so changing one holiday or season does not require stepping through unrelated screens:

1. **Name, Clock & Start** manages the calendar name, fictional clock, and first-activation date.
2. **Weekdays** stores the repeating weekday names in order.
3. **Periods** accepts `Name:Days`; append `:Feast` when a multi-day festival period should not advance the ordinary weekday cycle.
4. **Festival Days** adds one-day observances between periods.
5. **Leap Rule** manages the optional recurring leap day.
6. **Holidays** names existing dates without adding days.
7. **Seasons** accepts `Name:StartPeriod:StartDay:EndPeriod:EndDay`; a range may cross the year boundary, but ranges may not overlap.
8. **Preview Draft** and **Review and Activate** show the complete result before it can replace the active display.

A **Continue Guided Review** button remains available for a first-time build. Routine editors return to the focused **Edit Calendar** menu. Examples and terminology are available through each editor's **Explain This** button instead of occupying space during every change. Invalid edits leave the prior valid draft and active calendar unchanged.

**Starting from an existing calendar:** A fresh Wayfarer draft begins with the campaign's complete **Wayfarer Calendar**: its 20-hour clock, 75-minute hours, ten named weekdays, twelve months, five festival periods, four dated seasonal observances, and four season ranges. The **Start From a Copy** screen can also copy Standard, built-in Solamnic, Harptos, or the saved Wayfarer definition into the draft. The copy is fully editable and does not become active until you confirm it. Wayfarer supports one repeating leap interval, so a Standard copy uses a four-year leap day and does not reproduce Gregorian century exceptions.

**Default Wayfarer year:** The ordinary year contains 460 days. Celestia's Embrace opens the year transition before Newkolt; Meltwater's Merriment follows Deepkolt; Verdant Rebirth follows Brookgreen; Starwatch follows Fleurgreen; and Glowfest follows Reapember. These festival periods do not advance the ordinary weekday cycle. The default seasons and equinox/solstice dates follow the campaign briefing exactly, including Frosthold crossing the year boundary from Frostkolt 11 through Deepkolt 40.

**Default Wayfarer day:** The customary day runs from First Light through Morningtide, Highsun, Waning Hours, Evening's Crest, Nightfall, and Deep Night. Dawn is around the 2nd Hour, midday the 7th, dusk the 12th, and midnight the 17th. The generated AlmanacAssist manual records the complete hour ranges and calendar reference.

**Replacing the complete period list:** Calendar dates depend on period positions. To prevent an old holiday or leap day from silently moving to an unrelated new period, replacing the full list clears the draft's previous festival days, leap rule, holidays, and seasonal ranges and marks those stages for review. The setup screen explains what was cleared; re-enter only the dates that belong to the new year.

**Editing an active Wayfarer calendar:** GameAssist preserves elapsed fictional time and shows how the revised calendar interprets that moment. If the draft cannot represent the current elapsed time, activation stops without changing anything and offers a separately labeled option to restart at the draft's chosen starting date.

**Undo and recovery:** **Recovery Options** contains **Discard Draft Changes** for unactivated edits. Every successful activation also keeps one previous calendar-and-time checkpoint, available through **Restore Previous Activation** until another activation replaces it. The command-only recovery path `!aa-wayfarer reset-default --confirm yes` replaces the saved draft with the campaign Wayfarer default without changing the active calendar or fictional time; it is intentionally not exposed as a chat button.

The AlmanacAssist manual created by `!Almanac-Manual` explains weekdays, periods, festival days, leap rules, holidays, seasonal ranges, activation, rollback, and recovery, and includes a complete worked example.

TimeAlmanac never changes GameAssist's real-world table timezone, log timestamps, or NPCAssist Session dates. Moving fictional time backward or setting an exact date requires explicit confirmation and records the change; it does not attempt to reverse weather, effects, rests, or other past events.

Current moon phases are visible from the current date/time panel, a full announcement preview, and **Wayfarer Calendar Details**. Descriptive announcements report when a moon is not visible because of daylight or cloud cover. Moon cycles, offsets, and phase names are managed through direct Astronomy add/edit controls because they are world context that continues when the GM changes only the calendar display.

RestAlmanac supports Standard, Heroic, Gritty, and bounded Custom rest durations. Those settings change the fictional duration of a Short, Long, or Extended Rest; the selected recovery type still determines which verified 2014-sheet fields are restored.

Announcement settings prioritize easy presets without forcing every campaign into the same report. **Quick** shares date, time, and season; **Calendar** adds observances and moon phases; **Travel** adds weather, climate, and environment; **Everything** includes every available field. The GM may also choose individual fields and a custom heading. Unavailable systems are quietly omitted, preview is always private, and preview changes no state.

Weather forecasts do not silently replace current weather. A locked or manually chosen condition remains authoritative until the GM unlocks or replaces it. Astronomy keeps deterministic moon/daylight calculations separate from weighted rare-event suggestions, so adding a comet or omen never changes the underlying calendar result.

RestAlmanac is deliberately transactional. The preview identifies every selected character and proposed field change, expires after a bounded interval, belongs to the requesting player, and rechecks control, representation, and current sheet values before writing. Once validated writing begins, that confirmation is consumed whether the complete transaction succeeds or fails. A failed write is rolled back where possible and requires a fresh preview, preventing an old confirmation from reporting success for work that was undone. If a required field or optional TimeAlmanac decision changed after preview, the rest is refused without partial sheet updates. When HealthService is enabled, supported HP restoration and rollback also carry AlmanacAssist operation identity and verified healing or synchronization evidence; Hit Dice and spell-slot ownership remain with RestAlmanac.

Disabling AlmanacAssist stops every Almanac command and write while preserving valid settings and history. Disabling one internal system stops only that system. Re-enable it and use `!Almanac-Status` or `!Almanac-Audit` before continuing.

Config keys: `enabled`; protected `submodules`, `wayfarer`, `wayfarerDraft`, `climate`, `astronomy`, `weather`, `announcement`, `environment`, `rest`, `world`, `temporalContexts`, `worldPacks`, `rulesAdvisorEnabled`, and `rulesAdvisorProfile` branches. Structured Almanac settings are changed through the guided Almanac screens so nested data is validated as a complete operation. Runtime chronology, travel progress, confirmation grants, and the single activation rollback point are not configuration-transfer data.

---

## 7 · Installation <a id="7-installation"></a>

I. **Open the Roll20 Mod/API Editor**

1. Open your game’s **Settings**.
2. Open **Mod (API) Scripts**.
3. Create or select the GameAssist script entry.

II. **Install GameAssist**

1. Paste the complete contents of `GameAssist` v2.0.0.
2. Keep the script as one complete file; do not paste only individual MECHSUITS sections into Roll20.
3. Save the script.

III. **Remove Overlapping Standalone Marker Tools**

GameAssist v2.0.0 replaces standalone TokenMod and StatusInfo for the token and condition workflows supported by TokenAssist and ConditionAssist. Remove both standalone scripts before enabling the overlapping GameAssist modules. TokenAssist and standalone TokenMod both recognize `!token-mod`; ConditionAssist and standalone StatusInfo both recognize `!condition` and marker changes.

If standalone TokenMod is accidentally left installed, TokenAssist suspends only its deprecated `!token-mod` alias and warns the GM instead of applying that command twice. The `!token-assist`, `!ta`, and `!ta-*` commands remain available, but this safeguard is diagnostic rather than a supported permanent dual-install arrangement.

MarkerService itself may be disabled when the campaign deliberately chooses a different marker system. GameAssist will also turn off its dependent modules and explain which features are unavailable; CritAssist, ConfigUI, and HPAssist continue to work.

IV. **Create the Seven CritAssist Tables**

Create these exact rollable-table names:

```text
CF-Melee
CF-Ranged
CF-Thrown
CF-Spell
CF-Natural
Confirm-Crit-Martial
Confirm-Crit-Magic
```

V. **Reload and Inspect**

1. Save/reload the API sandbox.
2. Expect one core ready whisper.
3. Run:

```roll20chat
!ga-status
!ga-config modules
!ga-timezone
```

Because `QUIET_STARTUP` defaults to `true`, individual module-ready whispers are normally suppressed.

VI. **Run the Smoke Test**

Use the checklist in [§4.1 Minimum Smoke Test](#41-minimum-smoke-test) before trusting the release in a live session.

---

## 8 · Command Matrix <a id="8-command-matrix"></a>

All GameAssist command paths are case-insensitive, and spaces or hyphens between command words are interchangeable. For example, `!GA STATUS`, `!ga-status`, `!gA gM`, and `!GA-GM` are equivalent. Values, quoted text, and documented `--options` keep their ordinary syntax; the command matrix uses one canonical spelling for readability.

`!concentration --config randomize on|off` changes the shared module setting and is part of the current player-accessible concentration command surface.

| Scope | Command | Parameters / Flags | Purpose |
| --- | --- | --- | --- |
| **Navigation** | `!GA-GM` / `!GA-DM` | — | Open the private suite-level Game Master control center with one button for each feature module. Disabled modules offer an Enable button. |
|  | `!ga-help` | `[module]` | Open the private help center. Enabled modules open their own help; disabled modules still show a concise purpose and deliberate Enable action. |
|  | `!ga-nav` | `[module] [section]` | Browse all modules, then open a module's available screens. Larger modules use one additional organized section page. |
| **Admin** | `!ga-status` | `[--details]` | Show a plain-language system check; `--details` adds session activity, queue, timestamp, and internal event-hook diagnostics. |
|  | `!ga-health` | `[recent\|audit\|alerts\|bars]` | Show HealthService status, bounded HP evidence, supported-token health, alert controls, or shared NPC HP-bar setup. |
|  | `!ga-health alerts` | `[on\|off\|preview\|exact on\|off\|threshold 50\|25\|10 on\|off]` | Manage optional GM-private PC health-band notices through validated controls. |
|  | `!ga-timezone` / `!ga-config timezone` | `set <IANA timezone>`, `clear` | Open table-time settings, save a validated named timezone, or restore sandbox-default time. |
|  | `!ga-metrics` | `[reset]` | Show persisted session totals/history or reset metrics. |
|  | `!ga-config list` | — | Write a versioned configuration-only snapshot handout. |
|  | `!ga-handouts` | — | Open or update the GM-only index of GameAssist-owned handouts and report stable-identity conflicts. Roll20 does not expose a supported writable Journal-folder API, so filing remains manual. |
|  | `!ga-sheets` | — | Audit current-page sheet evidence and per-operation 2014/2024/unknown capability status without changing characters. |
|  | `!ga-config get <ModuleOrService> [key]` | — | Whisper one config value or the component’s full config. |
|  | `!ga-config set <ModuleOrService> <key>=<value>` | — | Persist an ordinary component config value; unsafe and component-protected keys are refused. |
|  | `!ga-config modules` | — | Show feature-module and core-service configured/runtime/dependency status. |
|  | `!ga-config cleanup` | — | Explicitly remove unknown/orphaned state branches. |
|  | `!ga-config ui` / `!ga-config-ui` | `[--page N]` | Open the GM Config UI. |
|  | `!ga-config-ui help|menu|gm|dm|status|info|audit|manual` | `!ConfigUI-GM|DM`, `!Config-GM|DM` | Open ConfigUI guidance, the Game Master settings screen, health, explanation, read-only review, or its short-module manual notice. |
|  | `!ga-enable <ModuleOrService>` / `!ga-disable <ModuleOrService>` | — | Enable or disable a module or core service; names are case-insensitive. |
| **Initiative** | `!Init-Menu` / `!Init-Help` / `!Init-Status` | — | Open InitiativeAssist controls, guidance, or the current native-tracker summary. |
|  | `!Init-Go` / `!Init-Go!` | — | Publicly invite players to roll, then whisper the GM a PC/NPC roster with individual and batch controls. |
|  | `!Init-GM` / `!Init-DM` | — | Whisper the Game Master the neutral initiative controls and complete encounter roster without a public invitation. |
|  | `!Init-Roll-Selected` | `[--mode normal\|adv\|dis] [--adjust number] [--extra die[,die]]` | Roll every eligible selected character controlled by the clicking GM or player. |
|  | `!Init-Start` | `--scope all\|npc\|gm-npc\|all-npc` | Add or update object-layer characters, object-layer NPCs, GM-layer NPCs, or NPCs across both layers. |
|  | `!Init-NPC-Rolls` | `hidden\|public` | Choose whether object-layer NPC evidence is GM-only. GM-layer evidence always remains private. |
|  | `!Init-Roll` / `!Init-Options` | `[--token ID] [--mode normal\|adv\|dis] [--adjust number] [--extra die[,die]]` | Roll an authorized linked token. The guided options combine d20 mode, a bounded flat adjustment, and up to two bounded bonus dice. |
|  | `!Init-RR` | — | Reroll every unique eligible PC and living NPC already in the tracker while preserving other rows. |
|  | `!Init-RR-Menu` | — | Open PC, NPC, selected-token, individual, and saved-group reroll choices. |
|  | `!Init-Group` | `[--create "Name"] [--rename ID --name "Name"] [--remove ID]` | Manage page-scoped encounter groups from selected tracker tokens. |
|  | `!Init-Audit` | — | Show the detailed read-only Initiative Review privately in chat. |
|  | `!Init-Info` / `!Init-Manual` | — | Whisper the short explanation or create/update the stable InitiativeAssist manual handout. |
|  | `!Init-Mode observer\|manager` | — | Choose read-only coexistence or InitiativeAssist tracker writes. |
| **Combat** | `!Combat-Menu` / `!Combat-GM` / `!Combat-DM` | — | Open the CombatAssist Control Center. |
|  | `!Combat-Help` / `!Combat-Guide` | `[turns\|timers\|recovery\|messages\|attention]` | Open the compact guide or one focused reference panel. |
|  | `!Combat-Manual` / `!Combat-Info` | — | Create or update the complete user-manual handout, or whisper its abbreviated purpose. |
|  | `!Combat-Status` / `!Combat-Audit` | — | Review current encounter health, or run the explicitly read-only tracker inspection. |
|  | `!Combat-Start` | `[--confirm]` | Start from a recognized native round counter or round 1, or deliberately replace an existing encounter baseline after confirmation. |
|  | `!Combat-Next` | — | Rotate the native Turn Tracker forward exactly one row through TurnTrackerService. |
|  | `!Combat-Prev` | — | Rotate the native Turn Tracker backward exactly one row without changing the round. |
|  | `!Combat-End-Turn` | `--token <ID>` | Whispers-mode player button; advances only if the clicking player still controls the current token. |
|  | `!Combat-Adopt` | — | Keep the current readable native tracker and current round, then begin a fresh cycle from its first entry. |
|  | `!Combat-Restore` | `[--confirm --revision <ID>]` | Preview and confirm one revision-guarded restoration of the last accepted tracker state. |
|  | `!Combat-Pause` / `!Combat-Resume` | — | Optionally pause during several tracker edits, then keep the round and accept the current order as a fresh baseline. |
|  | `!Combat-End` | `[--confirm]` | Clear only CombatAssist encounter state after confirmation; leave Roll20 tracker rows unchanged. |
|  | `!Combat-Announce` | `gm\|public\|whispers\|off` | Choose GM-only, public, GM-plus-current-player, or disabled turn notices. |
|  | `!Combat-Confirm` | `standard\|varied` | Choose one direct private player acknowledgement or a warmer rotation containing the Standard sentence exactly once. |
|  | `!Combat-Timer` | `on\|off\|duration N\|deadline audience\|add N audience\|remove N\|clear --confirm` | Configure stale-safe turn timing and per-reminder recipients; never auto-advance. |
|  | `!Combat-Cue` | `off\|gm\|players\|both\|public` | Configure a temporary native current-turn ping without changing token properties or map position. |
|  | `!Combat-Ready` | `on\|off\|profile 5e\|legacy` | Configure optional, rules-profiled Ready/Delay records. The feature starts off. |
|  | `!Combat-Hold` / `!Combat-Now` / `!Now` / `!Combat-Cancel-Hold` | current authorized character or generated token id | Record, use, or cancel one held action without applying its game mechanics. |
|  | `!Combat-Timeline` | `[round N\|current\|last\|clear --confirm]` | Review or deliberately clear bounded HP-change evidence tied to encounter and turn boundaries. |
| **Welcome** | `!Welcome` / `!Welcome-Help` / `!Welcome-Status` / `!Welcome-Preview` | — | Open the GM guide, review settings, or preview the next greeting privately. |
|  | `!Welcome-Guide` / `!Welcome-Menu` / `!Welcome-GM` / `!Welcome-DM` | — | Open the compact guide or private greeting controls. |
|  | `!Welcome-Info` / `!Welcome-Audit` / `!Welcome-Manual` | — | Open the short explanation, read-only readiness review, or stable manual handout. |
|  | `!Welcome-Announce` | — | Post one greeting publicly now and cancel the pending automatic greeting for this sandbox. |
|  | `!Welcome-Mode` | `default\|builtin\|custom\|mixed` | Choose the greeting pool. |
|  | `!Welcome-Delay` | `<seconds>` | Set the automatic delay from 1 to 60 seconds. |
|  | `!Welcome-Header` | `show\|hide\|<text>` | Show, hide, or replace the public greeting header. |
|  | `!Welcome-Default` | `<text>` | Replace the professional default greeting. |
|  | `!Welcome-Custom` | `list`, `add <text>`, `remove <number>`, `clear --confirm` | Manage the bounded campaign greeting list. |
| **Effects** | `!Effect-GM` / `!Effect-DM` / `!Effect-Menu` | selected linked targets; guided source picker | Open EffectAssist's private action screen. |
|  | `!Effect-Guide` / `!Effect-Help` / `!Effect-Info` / `!Effect-Manual` | — | Open compact guidance, the short explanation, or the stable manual handout. |
|  | `!effect` / `!Effect-Catalog` | GM: selected linked targets; player: no recipient preselection | Open the catalog directly. Bless, Guidance, Warding Bond, and Haste provide supported marker/sheet automation; Holy Weapon and Pass Without a Trace are clearly labeled tracked/manual entries. |
|  | `!Bless` / `!Guidance` / `!Guide` / `!Haste` / `!Warding-Bond` / `!Holy-Weapon` / `!PwoaT` | controlled source; player uses native target picker | Open a compact source-and-review path for one built-in effect. |
|  | `!Effect-Active` / `!Effect-Status` / `!Effect-Definitions` | — | Manage active instances, review compact health totals, or inspect catalog behavior. |
|  | `!Effect-Casts` / `!Effect-Recognition on\|off` | GM only | Review bounded official 2014 Bless proposals or enable/disable this recognition shortcut; the catalog remains available. |
|  | `!Effect-Requests` | GM only | Review retained player requests and choose visible, hidden, or off-page recipients through the ordinary application preview. |
|  | `!Effect-Apply` | generated GM source query, player flow, or retained request; bounded custom definition options | Preview one atomic application. The generated confirmation identifies automatic 2014-sheet changes and assisted table steps before writing. |
|  | `!Effect-End` | `--id <generated-id>` | End one exact source instance through generated buttons and remove only an unneeded EffectAssist-owned projection. |
|  | `!Effect-Audit` / `!Effect-Repair` | fresh generated confirmation grant | Compare records against marker, condition, concentration, and 2014-sheet projections without writing, then deliberately repair only a still-current safe mismatch. |
|  | `!Effect-Players on\|off` | GM only | Allow or lock player casting from controlled linked sources. |
|  | `!Effect-Settings` / `!Effect-Review on\|off` | GM only | Manage the ordinary application-review setting; review starts off. |
|  | `!Effect-Advanced` / `!Effect-Multiple-Concentration on\|off` | GM only | Manage the exceptional multiple-concentration setting; it starts off. |
|  | `!effect <command>` / `!EffectAssist-<command>` | case-insensitive | Spaced canonical command family and compatibility family for the same guarded controls. |
| **Healing** | `!Heal` / `!Heal-Menu` | guided source and recipient choices | Open the supported 2014 healing catalog. One-recipient actions go directly to target selection; multi-recipient actions ask for a target count. Players begin from a linked healer they control; the GM may use any supported source. |
|  | `!Heal-GM` / `!Heal-DM` | GM only | Open the private HealAssist control center. |
|  | `!Heal-Guide` / `!Heal-Help` / `!Heal-Info` / `!Heal-Manual` | — | Open compact guidance, explain boundaries, or create/update the stable manual handout. |
|  | `!Heal-Status` / `!Heal-Audit` | GM only | Review availability and transient workflow totals, or run the explicitly read-only health/configuration review. |
|  | `!Heal-Requests` | GM only | Review retained player requests for NPC, GM-layer, hidden, or off-page recipients. |
|  | `!Heal-Players on\|off` | GM only | Allow or lock player-started healing without disabling GM workflows. |
|  | `!Heal-Results public\|private` | GM only | Permit safe visible-PC completion summaries or keep results private. NPC and hidden results remain private. |
|  | `!HealAssist-<command>` | case-insensitive compatibility family | Open the same guarded HealAssist controls. Generated Start, Recipients, Review, Confirm, Request, and Dismiss commands are short-lived UI capabilities. |
| **Attacks** | `!Attack` / `!Attack-Menu` | selected controlled 2014 PC or guided source choice | Choose one verified repeating attack and a visible map target. The default submits with the sheet setting; optional review adds explicit roll-mode choices. |
|  | `!Attack-GM` / `!Attack-DM` | GM only | Open the private AttackAssist control center, player-access toggle, retained placement requests, and diagnostics. |
|  | `!Attack-Guide` / `!Attack-Help` / `!Attack-Info` / `!Attack-Manual` | — | Open compact guidance, explain boundaries, or create/update the stable manual handout. |
|  | `!Attack-Status` / `!Attack-Audit` | GM only | Review availability and pending transient choices, or run the explicitly read-only setup review. |
|  | `!Attack-Requests` | GM only | Review retained player requests for hidden, GM-layer, or off-page targets without exposing their identities to the player. |
|  | `!Attack-Players on\|off` | GM only | Allow or lock player-guided attacks without disabling GM use. |
|  | `!Attack-Review-Mode on\|off` | GM only | Enable roll-mode review before each attack, or restore immediate sheet-setting submission. |
|  | `!AttackAssist-<command>` | case-insensitive compatibility family | Open the same guarded AttackAssist controls. Generated source, target, review, request, and roll commands are short-lived one-use UI capabilities. |
| **Almanac** | `!Almanac` / `!aa` / `!aa-gm` / `!aa-dm` / `!Almanac-GM` / `!Almanac-DM` / `!Almanac-Menu` | GM only | Open the private, action-first campaign-world controls for all six AlmanacAssist systems. |
|  | `!aa-preview` / `!aa-announce` / `!aa-announcement-settings` / `!aa-announcement-fields` / `!aa-more` | GM only | Preview privately, deliver the configured world announcement, choose its audience, heading, preset, or independent per-field presentation, or open setup and diagnostics. |
|  | `!Almanac-Systems` / `!Almanac-Status` / `!Almanac-Audit` | GM only | Manage internal-system availability, review compact context, or run a read-only six-system audit. |
|  | `!Almanac-Guide` / `!Almanac-Help` / `!Almanac-Info` / `!Almanac-Manual` | — | Open compact guidance, explain system boundaries, or create/update the stable manual handout. |
|  | `!aa-world` / `!aa-scene` / `!aa-scene details` | GM only | Open Worldbuilding Mode or review the authoritative current scene and its field-level provenance. |
|  | `!aa current` / `!aa-current` | GM only | Choose a regional baseline and local influence profile, adjust values, and generate weather without constructing a world hierarchy. |
|  | `!aa current adjust` / `!aa current save-menu` / `!aa current locations` | GM only | Edit working settings, save or explicitly update a named place, or recall a saved setup without changing the date or rerolling weather. |
|  | `!aa-location` / `!aa-travel` | GM only | Name, create, configure, and choose saved places, or preview and conduct a reviewed journey. |
|  | `!aa-location manage` / `!aa-location lists` | GM only | Open saved-location settings or the separate prepared/favorite/recent lists. |
|  | `!aa-palette --location <location-id>` | GM only | Prepare profiles for a saved destination without moving the party; Location Settings supplies this button automatically. |
|  | `!aa-phenomena` / `!aa-temporal` | GM only | Manage explicit scene overlays or local-time contexts without rewriting permanent definitions or the base chronology. |
|  | `!aa-presets` / `!aa-rules` | GM only | Preview immutable starter definitions or optional read-only D&D 5E (2014)/system-neutral guidance. |
|  | `!aa-worldpack` / `!aa-wayfarer handout` | GM only | Open bounded, previewed, stale-protected WorldPack or complete-calendar handout workflows. |
|  | `!date` / `!time` / `!cal` / `!aa-time` | TimeAlmanac enabled | Read or deliberately manage the fictional calendar and clock. Players receive the read-only current date/time view. |
|  | `!aa-wayfarer` | GM only | Build, save, preview, duplicate, activate, discard, or restore a bounded Wayfarer custom calendar without editing the live definition in place. |
|  | `!clim` / `!aa-climate` | GM only | Manage climate profiles, regions, inheritance, overrides, and manual season context. |
|  | `!astro` / `!aa-astro` | GM only | Manage moons, phase names, daylight/season context, forecasts, and weighted rare-event suggestions. |
|  | `!weather` / `!aa-weather` | GM only | Generate, forecast, lock, unlock, manually set, or review continuity-aware weather. |
|  | `!enviro` / `!aa-enviro` | GM only | Review derived environment context or manage a descriptive GM override. |
|  | `!rest` / `!aa-rest` | selected controlled linked 2014 PCs | Preview, confirm, and record a validated rest; the GM may configure built-in and bounded custom rest types. |
| **Token Controls** | `!token-assist help` / `!ta-help` | — | Open TokenAssist guidance, commands, compatibility limits, provenance, and attribution. |
|  | `!token-assist menu|gm|dm|status|info|audit|manual` | matching `!ta-*` aliases; `!TokenAssist-GM|DM` | Open Game Master controls, health, explanation, read-only review, or the stable TokenAssist manual. |
|  | `!token-assist actions` / `!Token-Actions` / `!ta-actions` | GM only | Open the organized extended action library linked from **More Actions** on the compact GM screen. |
|  | `!token-assist --help-statusmarkers` / `!ta-help-statusmarkers` | — | Open the marker-command guide. |
|  | `!token-assist --on|--off|--flip <property...>` / `!ta-on|off|flip` | selected/authorized targets | Change supported boolean token properties. |
|  | `!token-assist --set <property|value...>` / `!ta-set` | selected/authorized targets | Change supported token, bar, aura, vision, lighting, layer, position, and marker properties. |
|  | `!token-assist --move <distance|angle\|distance>` / `!ta-move` | selected/authorized targets | Move tokens using pixels, grid units, or page units. |
|  | `!token-assist --order tofront|toback` / `!ta-order` | selected/authorized targets | Change token stacking order. |
|  | `!token-assist --report <recipient\|message>` / `!ta-report` | `{property}` placeholders | Report before/after token values to the GM, caller, table, or controllers. |
|  | `!token-assist --ids <id...>` / `!ta-ids` | `--ignore-selected`, `--current-page`, `--active-pages` | Add explicit token/character targets when authorized and optionally filter their pages. |
|  | `!token-assist --config players-can-ids|on|off` / `!ta-config` | GM only | Control whether players may supply explicit IDs; selected-token use remains available. |
|  | `!token-mod ...` | temporary older syntax | Accepts supported older macros in v2.0.0; use `!token-assist` or `!ta` for new macros. Removal requires a separately announced migration release. |
| **GM** | `!HP-All` / `!hp all` | — | Roll and set HP for qualifying NPC tokens on the current page. |
|  | `!HP-Selected` / `!hp selected` | — | Roll and set HP for qualifying selected NPC tokens. |
|  | `!HP-<command>` / `!hp <command>` | case-insensitive | Open HPAssist controls, roll selected/page NPC HP, show guidance, or run read-only checks; older HP command families remain compatibility aliases only. |
|  | `!npc-death-help` | — | Open the same central NPCAssist guide as `!npc-death-report --help`. |
|  | `!NPC-<command>` / `!NPC-Death-<command>` / `!NPCAssist-<command>` | legacy `!NPCManager-<command>`; case-insensitive | Use any NPCAssist command through an equivalent family; GM and DM open the Control Center. |
|  | `!npc-death-report` | `[--scope campaign\|chapter\|section\|session] [--recent] [--page N] [--write] [--help]` | Show bucket history; `--help` opens the central guide and `--write` opens the report writer. |
|  | `!npc-death-buckets` | `[--campaign "Name"] [--chapter "Name"] [--section "Name"] [--session "Name"] [--resetSession]` | View or rename the active death-history buckets. |
|  | `!npc-death-clear` | `[--scope session] [--nested] [--confirm]` | Clear only the selected bucket, or add `--nested` to clear that level and its descendants. |
|  | `!NPC-WR` / `!npc-death-write` | `[--all] [--scope <level>] [--newSection "Name"]` | Open the report writer, update selected handouts, or seed a new Section from the current Session. |
|  | `!npc-death-audit` | — | Summarize current HP/death-marker mismatches and update the audit handout. |
|  | `!npc-death-repair` | `[--confirm]` | Preview marker corrections from current HP; `--confirm` re-scans and changes only the configured death marker. |
|  | `!npc-death-arc` | `[--name "Arc"] [--session] [--note "Text"] [--manage] [--allowDuplicates]` | Maintain a deduplicated Arc roster from selected tokens or the current Session; manage removal and undo in chat. |
|  | `!ga-conc-status` | — | Show recent concentration DC/damage data per player. |
|  | `!condition config` | — | Open ConditionAssist settings and condition-definition controls. |
| **Player / GM** | `!critfumble` / `!critfumble help` | — | Whisper the CritAssist quick reference. |
|  | `!critfumble menu` | — | Whisper the guided Natural 1 dialogue. |
|  | `!critfumble guide|gm|dm|status|info|audit|manual` | `!crit`, `!CritAssist-*`; legacy `!CritFumble-GM|DM` | Open compact navigation, the Game Master picker, setup health, explanation, read-only table audit, or the stable manual. |
|  | `!critfail` | — | Open the direct GM-facing manual fumble prompt. Intended for GM use, but not currently GM-gated. |
| **Debug** | `!ga-debug damage` | `--amount N [--token ID] [--apply]` | Preview or apply selected-bar damage; supported applied HP writes use verified HealthService damage evidence. |
|  | `!ga-debug help|menu|gm|dm|status|info|audit|settings|manual` | `!Debug-GM|DM`, `!DebugTools-GM|DM` | Open DebugTools controls, guidance, and read-only checks; its short guidance remains in chat. |
|  | `!ga-debug marker` | `--marker NAME [--state on|off|toggle] [--token ID] [--apply]` | Preview or apply a status marker change. |
|  | `!ga-debug save` | `--dc N [--bonus N] [--mode normal|adv|dis] [--label "Text"] [--apply]` | Preview or roll a save. |
| **Player / GM** | `!critfumble-<type>` | `melee|ranged|thrown|spell|natural` | Roll the selected fumble table. |
|  | `!confirm-crit-martial` / `!confirm-crit-magic` | — | Roll the matching confirmation table. |
|  | `!condition` / `!condition help` | — | Open the selected-token condition menu or quick-start guide. |
|  | `!condition guide|menu|gm|dm|status|info|audit|manual` | `!Condition-GM|DM` | Open compact navigation, selected-token controls, health, explanation, read-only review, or the stable manual. |
|  | `!condition <name>` | — | Show one configured condition description when permitted. |
|  | `!cond-<condition>` | — | Show any official or DM-created condition through the case-insensitive short reference prefix. |
|  | `!condition add|remove|toggle <condition...>` | selected tokens | Change one or more condition markers when permitted. |
| **GM** | `!condition announce` / `!c-a` / `!cond-!` | selected linked character tokens | Choose a condition, then toggle and verify its marker while announcing the result or exact wording publicly or to player controllers. |
|  | `!condition status` / `!condition --status` | current player page | List linked characters and NPCs with configured conditions or other active markers. |
|  | `!concentration` / `!cc` / `!Con-<command>` / `!Concentration-<command>` | `help|guide|menu|gm|dm|status|info|audit|manual|settings`, plus established `--damage N`, `--mode normal|adv|dis`, `--last`, `--off`, `--status`, `--config randomize|healthPrompts on|off`, `--help` | Open navigation or perform a concentration workflow through case-insensitive equivalent aliases. Generated `!Con-Check` buttons resolve one private HealthService offer. |

### 8.1 Configuration Safety

These keys are refused:

```text
__proto__
prototype
constructor
```

Setting `enabled=true` or `enabled=false` routes through component lifecycle controls rather than directly mutating the stored value. ConditionAssist's `conditions`, `rulesProfile`, and migration record are protected from generic replacement; use `!condition config` and its validated importer.

---

## 9 · Configuration Keys <a id="9-configuration-keys"></a>

| Module | Key | Type | Default | Purpose |
| --- | --- | --- | --- | --- |
| **ConfigUI** | `enabled` | bool | `true` | Enable the ConfigUI module. |
|  | `pageSize` | number | `3` | Modules displayed per UI page. |
|  | `showSummaries` | bool | `true` | Show config summaries on module cards. |
| **CritAssist** | `enabled` | bool | `true` | Enable automatic and manual fumble handling. |
|  | `debug` | bool | `false` | Enable CritAssist-specific debug messages. |
|  | `useEmojis` | bool | `true` | Use emoji styling in CritAssist output. |
|  | `rollDelayMs` | number | `200` | Delay between applicable table-roll actions. |
| **ConditionAssist** | `enabled` | bool | `true` | Enable condition menus, descriptions, and marker controls. |
|  | `command` | string | `"condition"` | Optional additional command alias; permanent `!condition` compatibility remains. |
|  | `rulesProfile` | enum | `"2014"` | Select `2014`, `2024`, or campaign-`custom` condition wording through the ConditionAssist settings panel. |
|  | `userAllowed` | bool | `false` | Allow players to request condition descriptions. |
|  | `userToggle` | bool | `false` | Allow players to change condition markers on selected tokens. |
|  | `sendOnlyToGM` | bool | `false` | Whisper condition descriptions only to the GM. |
|  | `showDescOnStatusChange` | bool | `true` | Show a condition description when its marker is added. |
|  | `showIconInDescription` | bool | `true` | Show built-in or registered custom marker artwork beside descriptions, with a readable fallback. |
|  | `conditions` | object | 15 definitions | Validated condition name, marker, and description map; manage through `!condition config`. |
| **TokenAssist** | `enabled` | bool | `true` | Enable general token controls and retained compatibility support for older `!token-mod` macros. |
|  | `playersCanUseIds` | bool | legacy value or `false` | Allow players to add explicit `--ids` targets; selected-token controls remain available. |
|  | `warnOnStandalone` | bool | `true` | Warn when standalone TokenMod is detected and compatibility handling is suspended. |
|  | `configSchemaVersion` | number | `1` | Protected TokenAssist configuration schema identifier. |
| **InitiativeAssist** | `enabled` | bool | `false` | Enable the `!Init-` workflow after choosing InitiativeAssist as the encounter's initiative owner. |
|  | `mode` | enum | `"manager"` | Use `manager` for guarded tracker writes or `observer` for status and audit only. |
|  | `hideNpcRolls` | bool | `true` | Hide NPC inline rolls and result details from players. GM-layer NPC rolls remain private even when this is false. |
| **CombatAssist** | `enabled` | bool | `false` | Enable explicit encounter, turn, and round tracking through the `!Combat-` workflow. |
|  | `announcements` | enum | `"gm"` | Send turn notices with `gm`, `public`, `whispers`, or `off`; Whispers privately gives the current player an authorized End My Turn button. |
|  | `playerConfirmations` | enum | `"standard"` | Use `standard` or `varied` private acknowledgements after a player successfully ends a turn. |
|  | `timerEnabled` | bool | `false` | Enable guarded turn timers; timers report only and never advance initiative. |
|  | `timerDurationSeconds` | number | `120` | Set the turn deadline from 10 to 3600 seconds. |
|  | `timerDeadlineAudience` | enum | `"gm"` | Send the deadline notice to `gm`, `player`, `both`, or `public`. |
|  | `timerReminders` | array | `[]` | Up to five seconds-remaining/audience records managed through `!Combat-Timer`. |
|  | `turnCue` | enum | `"off"` | Send a native non-centering ping to `gm`, `players`, `both`, or `public`; hidden turns remain GM-only. |
| **HealthService** | `pcAlerts` | protected object | alerts off; 50%, 25%, and 10% selected; exact HP hidden | Manage through `!ga-health alerts`. Configuration snapshots include these choices, while generic `!ga-config set` writes are refused. |
|  | `hpBar` | enum | `"bar1"` | Choose `bar1`, `bar2`, or `bar3` through `!ga-health bars`; NPCAssist, HPAssist, and supported DebugTools NPC writes share that choice. |
| **WelcomeAssist** | `enabled` | bool | `false` | Enable the optional post-bootstrap table greeting. Reload after setup for automatic behavior. |
|  | `mode` | enum | `"mixed"` | Use the professional default, built-ins, campaign greetings, or the combined weighted pool. |
|  | `delayMs` | number | `3000` | Wait 1-60 seconds after Bootstrap before checking health and greeting the table. |
|  | `showHeader` | bool | `true` | Show the greeting card header. |
|  | `header` | string | `"Game Night Is Ready"` | Set the bounded heading text; the default also includes a die icon. |
|  | `defaultGreeting` | string | professional greeting | Set the professional greeting used by default and mixed modes. |
|  | `customGreetings` | array | `[]` | Protected list of up to ten campaign greetings; manage through `!Welcome-Custom`. |
| **ConcentrationAssist** | `enabled` | bool | `true` | Enable concentration commands and tracking. |
|  | `marker` | string | `"stopwatch"` | Built-in id, custom display name, or exact custom tag used for concentration. Manage it through `!concentration settings`. |
|  | `randomize` | bool | `true` | Randomize concentration emote flavor. |
|  | `healthPrompts` | bool | `true` | Offer private, revalidated checks after supported HP loss while HealthService is enabled; manual checks remain independent. |
| **NPCAssist** | `enabled` | bool | `true` | Enable NPC death tracking. |
|  | `autoTrackDeath` | bool | `true` | Automatically add/remove the death marker. |
|  | `notifyBloodied` | bool | `true` | Whisper the GM when an eligible living NPC crosses to half HP or below. |
|  | `autoNumberNpcTokens` | bool | `true` | Give newly added linked NPC tokens unique page-local names using the lowest available suffix. |
|  | `deadMarker` | string | `"dead"` | Marker used for death state. |
|  | `autoHide` | bool | `false` | Move newly dead NPC tokens to another layer. |
|  | `hideLayer` | string | `"gmlayer"` | Target layer used by `autoHide`. |
| **EffectAssist** | `enabled` | bool | `false` | Enable catalog-driven effect controls and supported 2014-sheet projections. |
| **EffectAssist** | `allowPlayerCasting` | bool | `true` | Allow players to apply built-in effects from linked sources they control; the GM can lock this from the module control center. |
|  | `castRecognition` | bool | `true` | Allow exact supported official 2014 Bless cards to create private GM proposals without applying an effect. |
|  | `durationCandidates` | bool | `true` | Allow verified provider boundaries to create private GM review items without ending effects automatically. |
|  | `markerOverrides` | object | `{}` | Protected release data for validated effect-marker choices; not an end-user `!ga-config` setting. |
|  | `customDefinitions` | object | `{}` | Protected bounded definitions created only through EffectAssist's guided custom-effect workflow. |
| **HealAssist** | `enabled` | bool | `false` | Enable guided official-2014 healing workflows. HealthService is required. |
|  | `allowPlayerHealing` | bool | `true` | Allow controlled player healers to start supported visible-PC workflows; the GM can lock this without disabling HealAssist. |
|  | `autoApply` | bool | `true` | Apply verified healing after recipient selection by default, or require review with `!Heal-Auto off`. Existing saved choices are preserved. |
|  | `resultAudience` | enum | `"public"` | Use `public` for safe visible-PC completion summaries or `private` for private results. Manage through `!Heal-Results`; generic config writes are refused. |
| **AttackAssist** | `enabled` | bool | `false` | Enable guided official-2014 repeating attacks. The module never applies damage or changes combat state. |
|  | `allowPlayerAttacks` | bool | `true` | Allow players to start guided attacks from official-2014 characters they control; the GM can lock this without disabling GM use. |
|  | `reviewBeforeRoll` | bool | `false` | Protected GM choice: submit with the sheet setting immediately, or show roll-mode review before each attack. Manage through `!Attack-GM` or `!Attack-Review-Mode`. |
| **AlmanacAssist** | `enabled` | bool | `false` | Enable the AlmanacAssist command surface and its six independently controlled systems. |
|  | `systems` | object | all six `true` | Protected enablement map for Time, Climate, Astronomy, Weather, Environment, and Rest; use `!Almanac-Systems` to change it. |
|  | `time` / `climate` / `astronomy` | object | validated defaults | Protected calendar, region/profile, moon, and celestial-event definitions managed through their focused setup screens. |
|  | `weather` / `environment` / `rest` | object | validated defaults | Protected continuity, override, and rest definitions managed through their focused setup screens. |
| **HPAssist** | `enabled` | bool | `true` | Enable NPC HP commands. |
|  | `autoRollOnAdd` | bool | `false` | Attempt HP rolling when qualifying tokens are added. |
| **DebugTools** | `enabled` | bool | `false` | Enable GM-only dry-run/apply debug commands. |

Examples:

```roll20chat
!ga-config get NPCAssist
!ga-config get NPCAssist deadMarker
!ga-config set NPCAssist notifyBloodied=false
!ga-config set NPCAssist autoNumberNpcTokens=false
!ga-config set NPCAssist autoHide=true
!ga-config set NPCAssist hideLayer=gmlayer
!ga-config set HPAssist autoRollOnAdd=true
!ga-config set CritAssist debug=false
!token-assist --config players-can-ids|off
```

---

## 10 · Developer API <a id="10-developer-api"></a>

### 10.1 Public API Summary

| Category | Method | Description |
| --- | --- | --- |
| **Module Registration** | `GameAssist.register(name, initFn, options)` | Register a module before Roll20’s `ready` event. |
| **Command Handling** | `GameAssist.onCommand(prefix, handler, moduleName, opts)` | Register a guarded API-command handler. |
| **Event Handling** | `GameAssist.onEvent(eventName, handler, moduleName)` | Register a guarded Roll20 event handler. |
| **Explicit Queue** | `GameAssist.enqueue(task, options)` | Explicitly submit serialized work; returns `true` if accepted. |
| **Listener Bookkeeping** | `GameAssist.offCommands(moduleName)` / `GameAssist.offEvents(moduleName)` | Clear GameAssist’s internal registry entries; cannot detach Roll20 handlers. |
| **Module Control** | `GameAssist.enableModule(name)` / `GameAssist.disableModule(name)` | Run guarded module lifecycle transitions. |
| **State Management** | `GameAssist.getState(name)` / `saveState(name, data)` / `clearState(name)` | Read, merge, or reset a module-owned state branch. |
| **Token Helper** | `GameAssist.getLinkedCharacter(token)` | Return `{ token, character }` for a valid linked object-layer token, otherwise `null`. |
| **Marker Service** | `GameAssist.MarkerService` | Resolve markers and artwork metadata, inspect state, add, remove, toggle, set, and observe through one structured contract. |
| **Turn Tracker Service** | `GameAssist.TurnTrackerService` | Read immutable native-tracker snapshots, classify rows, apply guarded lossless updates, and observe tracker changes. |
| **Semantic Events** | `GameAssist.SemanticEvents` | Publish or observe immutable versioned in-sandbox domain events without persistence or replay. |
| **Health Service** | `GameAssist.HealthService` | Read canonical supported HP snapshots, observe deduplicated immutable transitions, and perform producer-identified verified writes. |
| **Condition Assist** | `GameAssist.ConditionAssist` | Read validated condition definitions or apply add/remove/toggle actions through MarkerService. |
| **Token Assist** | `GameAssist.TokenAssist` | Inspect component provenance/lifecycle and subscribe to token changes made through supported TokenAssist commands. |
| **Initiative Assist** | `GameAssist.InitiativeAssist` | Inspect the currently classified mixed-sheet tracker roster while InitiativeAssist is running. |
| **Combat Assist** | `GameAssist.CombatAssist` | Inspect the active CombatAssist component version and a defensive copy of its current encounter record. |
| **Welcome Assist** | `GameAssist.WelcomeAssist` | Inspect the active module version; Bootstrap uses its guarded completion hook internally. |
| **Effect Assist** | `GameAssist.EffectAssist` | Create, end, inspect, audit, and observe source-aware semantic effect instances while the module is enabled. |
| **Heal Assist** | `GameAssist.HealAssist` | Inspect supported guided-healing actions and current transient workflow status while HealAssist is running. |
| **Attack Assist** | `GameAssist.AttackAssist` | Inspect verified official-2014 repeating attacks and current transient workflow status while AttackAssist is running. |
| **Almanac Assist** | `GameAssist.AlmanacAssist` | Read current fictional-world context, inspect internal systems, and observe Almanac semantic events without requiring every system to be enabled. |
| **Chat Helpers** | `GameAssist.createButton(label, command)` / `GameAssist.rollTable(tableName)` | Create safe chat buttons or roll a sanitized table name. |
| **Config UI** | `GameAssist.renderConfigUI(playerId, options)` | Open the ConfigUI when that module is active. |
| **Metrics** | `GameAssist.getMetricsStore()` / `GameAssist.recordMetric(type, opts)` | Inspect or record metrics. |
| **Logging** | `GameAssist.log(mod, message, level, opts)` / `GameAssist.handleError(mod, error)` | Whisper safe logs and record errors. |

### 10.2 Module Registration

```js
GameAssist.register('MyModule', function initMyModule() {
    GameAssist.onCommand('!mymod', msg => {
        GameAssist.log('MyModule', `Hello, ${msg.who}`);
    }, 'MyModule');
}, {
    enabled: true,
    events: ['chat:message'],
    prefixes: ['!mymod'],
    teardown: null,
    resume: null,
    dependsOn: [],
    preserveRuntimeOnDisable: false,
    protectedConfigKeys: []
});
```

Important contracts:

* Registration must happen before Roll20’s `ready` event.
* `events`, `prefixes`, and `dependsOn` are metadata; they do **not** wire handlers automatically.
* Modules still call `GameAssist.onEvent(...)` and/or `GameAssist.onCommand(...)`.
* Ordinary module initializers register Roll20 handlers once. If `teardown` removes service observers, timers, or an exposed API, provide an idempotent `resume` callback to restore those resources on re-enable. It must not register new chat/event handlers. Initial setup still belongs to `initFn`; services retain their existing restart contract.
* A module should persist only inside `state.GameAssist.<Module>`.
* Dependencies may be reported as unverifiable if Roll20 does not expose script metadata.
* Runtime is cleared on disable by default. Set `preserveRuntimeOnDisable: true` only when the module deliberately stores durable records there; NPCAssist uses this for death-history buckets and Arc records.
* Use `protectedConfigKeys` when a complex configuration map must be changed only through a component-owned validator.

### 10.3 Command Matching

```js
GameAssist.onCommand('!mymod', handler, 'MyModule', {
    gmOnly: false,
    acl: [],
    match: {
        caseInsensitive: true,
        mode: 'token'
    }
});
```

| Option | Meaning |
| --- | --- |
| `gmOnly` | Refuse non-GM callers when `true`. |
| `acl` | Optional allowed player-ID list. |
| `match.caseInsensitive` | Match command case-insensitively when `true`. |
| `match.mode: 'token'` | Require a whitespace/end boundary after the command. Recommended for ordinary commands. |
| `match.mode: 'prefix'` | Intentionally match any content beginning with the prefix. Use sparingly. |

### 10.4 Events and Lifecycle Guards

```js
GameAssist.onEvent('change:graphic:bar1_value', (token, previous) => {
    // Handle the event directly.
}, 'MyModule');
```

Normal handlers execute directly and return early unless their module is initialized and active. `offCommands()` and `offEvents()` clear GameAssist’s internal bookkeeping but cannot unregister callbacks from Roll20’s event bus.

### 10.5 Explicit Queue

Use the queue only when order or non-overlap matters:

```js
GameAssist.enqueue(() => {
    // Synchronous serialized work.
});

GameAssist.enqueue(() => new Promise(resolve => {
    sendChat('', '[[1d20]]', results => {
        // Process results, then settle the queued portion.
        resolve();
    });
}), {
    priority: 0,
    timeout: 30000
});
```

Queue rules:

* `GameAssist.enqueue(task, options)` returns `true` when accepted and `false` when `task` is invalid.
* Async queued work must return a Promise.
* Higher numeric priority runs first; equal-priority tasks preserve enqueue order.
* A timeout advances/releases the queue but cannot cancel the underlying operation.
* Never use the queue merely because an event exists.

### 10.6 MarkerService

`GameAssist.MarkerService` is toggleable core infrastructure. It begins enabled and may be controlled through `!ga-enable MarkerService`, `!ga-disable MarkerService`, or ConfigUI. Marker-dependent modules must be enabled only while the service is running.

```js
const markers = GameAssist.MarkerService;

const resolution = markers.resolve('Concentrating');
const artwork = markers.artwork('Concentrating');
const inspection = markers.inspect(token, 'Concentrating');
const added = markers.add(token, 'Concentrating');
const removed = markers.remove(token, 'Concentrating');
const toggled = markers.toggle(token, 'Concentrating');
const setResult = markers.set(token, 'Concentrating', true);

const subscription = markers.observe(event => {
    // event.added, event.removed, event.previous, event.current, event.token
}, { owner: 'MyModule' });

// Later:
subscription.unsubscribe();
```

Public operations:

| Method | Result |
| --- | --- |
| `version` | MarkerService component version (`1.1.1`). |
| `isEnabled()` | Reports whether MarkerService currently accepts marker work. |
| `resolve(marker)` | Resolves a built-in id, custom display name, exact stored tag, or numbered stored value. |
| `artwork(marker)` | Returns presentation-neutral built-in or registered custom artwork metadata; consumers provide readable fallback UI when unavailable. |
| `read(token)` | Returns the complete parsed marker list, including duplicates and number overlays. |
| `inspect(token, marker)` | Returns resolution, presence, match count, and matching stored entries. |
| `has(token, marker)` | Boolean convenience check. Use `inspect` when diagnostics matter. |
| `add/remove/toggle/set` | Returns `ok`, `changed`, `verified`, before/after entries, and an error code/message when unsuccessful. |
| `observe(callback, options)` | Subscribes to the shared marker-change stream and returns an unsubscribe handle. |
| `clearObservers(owner)` | Removes every observer registered under an owner name. |
| `getRegistry()` | Returns the readable campaign custom-marker registry and the Roll20 property that supplied it. |

Marker removal clears every duplicate instance of the requested marker. Other marker ids, duplicate entries for unrelated markers, and number overlays are preserved. Adding an already-present marker is idempotent unless a number option explicitly updates its first matching entry.

Custom marker lookup reads Roll20's documented `token_markers` campaign property first and uses `_token_markers` only as a compatibility fallback when the documented value is absent or unusable. Built-in marker ids and exact stored `Name::id` tags do not require either registry property to resolve.

When MarkerService is disabled, marker operations return `UNAVAILABLE` with the command needed to restore the service. ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, and DebugTools are disabled before the service closes so their teardown can complete safely. Observer registrations pause while the service is off and resume when it is enabled again.

### 10.7 TurnTrackerService

`GameAssist.TurnTrackerService` is toggleable, rules-neutral infrastructure. It owns GameAssist reads and writes to Roll20's native `Campaign().get('turnorder')` data but does not decide who should roll, advance turns, or manage rounds.

```js
const tracker = GameAssist.TurnTrackerService;
const snapshot = tracker.snapshot();

if (snapshot.ok) {
    const rows = snapshot.entries.map((entry, index) =>
        tracker.classifyEntry(entry, index, snapshot)
    );
}

const subscription = tracker.observe(event => {
    // event.current is a fresh immutable snapshot.
}, { owner: 'MyModule' });
```

| Method / Field | Result |
| --- | --- |
| `version` | TurnTrackerService component version (`1.0.0`). |
| `isEnabled()` | Reports whether the service currently accepts tracker work. |
| `snapshot()` | Returns the active initiative page, exact raw tracker data, immutable parsed entries, and a revision identifier. Malformed JSON returns a refusal result. |
| `classifyEntry(entry, index, snapshot)` | Structurally identifies custom, token, missing-token, off-page, or unknown rows without applying game rules. |
| `apply(mutator, options)` | Gives the mutator a fresh cloned tracker, serializes one guarded Roll20 write, preserves unmodified fields, and returns before/after snapshots. |
| `observe(callback, options)` | Subscribes to native or GameAssist-owned tracker changes. |
| `clearObservers(owner)` | Removes observers registered under one owner. |

Consumers should preserve fields they do not own and refuse malformed input. Disabling TurnTrackerService first disables InitiativeAssist and CombatAssist and leaves Roll20's current tracker untouched.

### 10.8 ConditionAssist

`GameAssist.ConditionAssist` is available while the module is running:

```js
const conditions = GameAssist.ConditionAssist;

const prone = conditions.getCondition('prone');
const allDefinitions = conditions.getConditions();
const result = conditions.apply([token], ['prone', 'poisoned'], 'add');
```

| Method | Result |
| --- | --- |
| `version` | ConditionAssist component version (`1.0.5`). |
| `configSchemaVersion` | Validated condition export/import schema version (`2`). |
| `rulesProfile()` | Returns the active `2014`, `2024`, or `custom` wording source. |
| `getCondition(name)` | Returns a copy of one definition or `null`. |
| `getConditions()` | Returns a deep copy of every configured definition. |
| `apply(tokens, names, action)` | Applies `add`, `remove`, or `toggle` through MarkerService and returns changed/unchanged/failed counts. |

The public API refuses mutation while ConditionAssist is disabled. Callers must inspect `ok`; a disabled module returns `UNAVAILABLE`, and an unsupported action returns `INVALID_ARGUMENT`.

### 10.9 TokenAssist

`GameAssist.TokenAssist` is available for integrations that need TokenAssist lifecycle, provenance, or command-owned token-change notifications:

```js
const tokens = GameAssist.TokenAssist;

const subscription = tokens.observeTokenChange((token, previous, context) => {
    // Called after a supported TokenAssist command changes this token.
    // context.source === 'TokenAssist'; context.command contains the API command.
}, { owner: 'MyModule' });

// Later:
subscription.unsubscribe();
```

| Method / Field | Result |
| --- | --- |
| `version` | TokenAssist component version (`1.3.1`). |
| `configSchemaVersion` | TokenAssist configuration schema (`1`). |
| `reference` | Pinned TokenMod reference version, repository, commit, path, and blob. |
| `isEnabled()` | Reports whether TokenAssist and MarkerService are both running. |
| `observeTokenChange(callback, options)` | Subscribes to successful TokenAssist command mutations and returns an unsubscribe handle. |
| `ObserveTokenChange(callback, options)` | Compatibility spelling on the GameAssist-owned API object; no global `TokenMod` object is created. |
| `clearObservers(owner)` | Removes observers registered under one owner, or all observers when the owner is omitted. |

Use `GameAssist.MarkerService.observe(...)` when the integration needs every marker change, including direct GameAssist condition, death, concentration, or debug actions. Use TokenAssist observation only for complete token mutations performed by its supported command handler.

### 10.10 InitiativeAssist

`GameAssist.InitiativeAssist` is available while the module is running:

```js
const roster = await GameAssist.InitiativeAssist.getRoster();
```

The result retains the TurnTrackerService snapshot and adds InitiativeAssist classifications such as PC, NPC, object, death state, attention messages, resolved modifier, and reroll eligibility. The API is read-only in `1.0.8`; tracker mutations remain behind the guarded `!Init-` UX and TurnTrackerService authority.

### 10.11 CombatAssist

`GameAssist.CombatAssist` is available while CombatAssist is running:

```js
const encounter = GameAssist.CombatAssist.getStatus();
```

`version` reports CombatAssist `1.2.2`. `getStatus()` returns a defensive copy of the current encounter record or `null`; changing the returned object cannot alter saved GameAssist state. `combatEventSchemaVersion` reports schema 1, while `observe(callback, options)` and `clearObservers(owner)` expose immutable encounter and verified-turn events without giving consumers tracker-write authority. Tracker mutation remains behind GM-only Next, Previous, and confirmed Restore controls or the current player's token-bound End My Turn control, and every path uses TurnTrackerService authority. A recognized round counter is reported as the round source. Timer callbacks and native pings remain private module behavior and expose no mutation API.

### 10.12 WelcomeAssist

`GameAssist.WelcomeAssist` exists only while WelcomeAssist is running. Its `version` field is available for inspection. The `onBootstrapComplete()` method is the module's internal post-bootstrap lifecycle hook; external modules should not call it to produce additional greetings. Public management belongs to the guarded short `!Welcome` commands; the longer `!welcome-assist` family remains a compatibility alias.

### 10.13 SemanticEvents

`GameAssist.SemanticEvents` is always available as lightweight in-sandbox infrastructure. It does not discover or enable providers, persist events, replay startup history, or move ordinary handlers onto the queue.

```js
const subscription = GameAssist.SemanticEvents.observe(event => {
    // event.type, event.producer, event.eventId, event.sequence, event.payload
}, {
    owner: 'MyModule',
    types: ['effect.lifecycle.changed']
});

const result = GameAssist.SemanticEvents.publish(
    'example.completed',
    'MyModule',
    { id: 'example-1' }
);

// Later:
subscription.unsubscribe();
```

Every accepted event includes `eventSchemaVersion`, `eventId`, `streamId`, monotonic `sequence`, `type`, `producer`, RFC-3339 `occurredAt`, optional `causeEventId`, and a deeply frozen JSON-safe `payload`. Delivery is direct and ordered. Observer exceptions are isolated through GameAssist diagnostics.

### 10.14 HealthService

`GameAssist.HealthService` is toggleable core infrastructure. Version `1.1.1` supports official D&D 5E by Roll20 2014 PC `hp` attributes and a GM-selected linked-NPC token bar. Linked PC sheet/token notifications describing the same before-and-after values are published once. GMs can inspect the service through `!ga-health`, view bounded recent evidence with `!ga-health recent`, run the read-only Player Ribbon page check with `!ga-health audit`, manage optional PC threshold notices with `!ga-health alerts`, or choose and prepare Bar 1, 2, or 3 with `!ga-health bars`.

The shared NPC HP-bar screen is deliberately separate from raw configuration. Its audit names linked NPCs that need setup and unlinked token candidates that cannot participate until **Represents Character** is set. **Prepare Linked NPCs** copies each character's current and maximum HP into the selected bar while preserving the other bars. **Link To Sheet HP** creates an explicit sheet link and warns that multiple tokens representing one character then share the same HP value.

PC health alerts are off by default and always whisper only the GM. The 50%, 25%, and 10% choices can be enabled independently; one large decrease combines every crossed threshold into one notice. Remaining below a threshold does not repeat the alert, while healing above it rearms the next downward crossing. Exact HP is hidden unless the GM enables it. Initialization, synchronization, blank or invalid values, simultaneous maximum-HP changes, and every NPC transition remain outside this alert path. The feature listens to the canonical HealthService event and does not add another Roll20 HP watcher.

```js
const health = GameAssist.HealthService;
const snapshot = health.readCharacter(characterId);

const subscription = health.observe(event => {
    // event.type === 'health.transition'
    // event.payload.classification, direction, delta, before, after,
    // character, token, pageId, surface, and provenance
}, { owner: 'MyModule' });

const result = health.writeCharacter({
    character: characterId,
    current: 17,
    producer: 'MyModule',
    operationId: 'heal-encounter-17',
    classification: 'healing'
});
```

| Method / Field | Result |
| --- | --- |
| `version` / `healthEventSchemaVersion` | HealthService and transition-payload contract versions. |
| `isEnabled()` / `getStatus()` | Report lifecycle and bounded in-memory evidence counts. |
| `readCharacter(characterOrId)` | Return an immutable supported 2014-PC HP snapshot or `null`. |
| `getHpBar()` / `getHpFields()` | Return the selected NPC bar and its Roll20 current, maximum, and link field names. |
| `readToken(tokenOrId)` | Return an immutable supported linked-PC or selected-bar linked-NPC snapshot or `null`. |
| `setHpBar(bar)` / `configureNpcToken(token, options)` | Change the shared NPC bar or deliberately copy/link one qualifying NPC token through validated service controls. |
| `writeCharacter(request)` / `writeToken(request)` | Apply and verify a bounded producer/operation-identified write; repeating the same operation is idempotent. |
| `observe(callback, options)` | Subscribe through SemanticEvents to immutable `health.transition` envelopes. |
| `getRecent(limit)` | Return bounded in-memory evidence from the current sandbox lifecycle; nothing is persisted or replayed. |

Declared classifications are `damage`, `healing`, `initialization`, `synchronization`, `clearing`, `invalid`, and `unknown`. A producer may declare a cause only for its own verified write. An unexplained direct Roll20 or third-party change remains `unknown` even when the direction is clearly an increase or decrease. Consumers must keep manual paths and must not treat HealthService as an attacker, resistance, temporary-HP, or causal combat ledger.

### 10.15 ConcentrationAssist

`GameAssist.ConcentrationAssist` version `0.6.0` retains its marker and lifecycle methods and adds a bounded optional HealthService offer contract. Its roll path accepts verified official-2014 save data and explicitly refuses unsupported or unreadable sheet contracts instead of guessing a bonus:

```js
const concentration = GameAssist.ConcentrationAssist;

concentration.isConcentrating(tokenId);
concentration.set(tokenId, true, { actor: 'MyModule', reason: 'established' });
concentration.observe(event => {
    // concentration.established, concentration.failed, concentration.ended
}, { owner: 'MyModule' });

concentration.getHealthOfferStatus();
```

Generated `!Con-Check` buttons are private UI capabilities rather than durable automation commands. ConcentrationAssist binds each one to one HealthService event and rechecks freshness, HP, concentration, token identity, controller authorization, and the clicking player's visible page before calling its shared roll path. Consumers should use the public `roll(...)`, `set(...)`, and `observe(...)` methods instead of fabricating offer IDs or reading private module state.

### 10.16 EffectAssist

`GameAssist.EffectAssist` is created when EffectAssist is first enabled:

```js
const effects = GameAssist.EffectAssist;
const result = effects.apply({
    definitionId: 'bless',
    sourceTokenId,
    targetTokenIds,
    createdBy: 'MyModule',
    requestId
});
```

| Method / Field | Result |
| --- | --- |
| `version` / `stateSchemaVersion` / `castProposalSchemaVersion` | EffectAssist module, durable-state, and sandbox-local cast-proposal contract versions. |
| `isAvailable()` | Reports the saved module enablement state. |
| `getDefinitions()` | Returns defensive copies of built-in and campaign effect definitions. |
| `getActiveInstances()` / `getHistory()` | Returns defensive copies of active and bounded ended records. |
| `getCastProposals()` | Returns defensive copies of unexpired GM cast proposals; proposals are sandbox-local and never contain inferred recipient token IDs. |
| `getDurationCandidates()` | Returns defensive copies of open and dismissed duration review evidence associated with active instances. |
| `apply(request)` | Atomically validates source and targets, records one semantic instance, and applies every supported projection or rolls the operation back. |
| `end(instanceId, actor)` | Ends one source instance idempotently and removes only unneeded EffectAssist-owned projections. |
| `reconcileDurations()` | Compares saved provider anchors against current verified provider state once and returns newly created review candidates; it never ends an effect. |
| `audit()` | Returns a defensive read-only comparison of records, ownership, marker/condition state, concentration, and 2014-sheet rows. |
| `observe(callback, options)` | Filters SemanticEvents to `effect.lifecycle.changed`. |
| `clearObservers(owner)` | Clears semantic observers registered under the exact owner. |
| `registerProjectionAdapter(name, adapter)` | Adds a validated projection adapter without changing the stored effect identity. Built-ins cover MarkerService, ConditionAssist, record-only, and verified 2014 repeating modifiers. |

A script-provided `requestId` is bounded and idempotent for the retained runtime window. A reused ID with a different intent is refused. Apply is transactional across its supported projections; a partial write is rolled back. Cleanup uses exact ownership evidence, preserves pre-existing state, and leaves externally edited sheet rows in place for GM review. Recognized spell cards create transient review proposals and still enter this same application contract only after the GM selects recipients. Duration observations publish ordinary `effect.lifecycle.changed` transitions such as candidate creation, dismissal, and restoration; confirmed ending still uses the established `ended` transition.

### 10.17 HealAssist

`GameAssist.HealAssist` exists while HealAssist is running:

```js
const healing = GameAssist.HealAssist;
const status = healing.getStatus();
const actions = healing.getActions();
```

| Method / Field | Result |
| --- | --- |
| `version` / `interactionSchemaVersion` | HealAssist module and sandbox-local interaction contract versions. |
| `getStatus()` | Returns a defensive summary of HealthService availability, player permission, result audience, and pending transient workflow counts. |
| `getActions()` | Returns defensive copies of the supported action identifiers, names, groups, and recipient counts. |

The public object is intentionally observational. External modules cannot fabricate HealAssist confirmations or call an HP mutation method through it. Cross-module HP writes belong directly to `GameAssist.HealthService` with the caller's own producer and operation identifiers. HealAssist source choices, retained placement requests, rolled proposals, and confirmation capabilities expire in memory and are cleared on module teardown or sandbox restart.

### 10.18 AttackAssist

`GameAssist.AttackAssist` exists while AttackAssist is running:

```js
const attacks = GameAssist.AttackAssist;
const status = attacks.getStatus();
const rows = attacks.listAttacks(characterId);
```

| Method / Field | Result |
| --- | --- |
| `version` / `interactionSchemaVersion` | AttackAssist module and sandbox-local interaction contract versions. |
| `getStatus()` | Returns a defensive summary of module enablement, player permission, and pending transient flow, request, and submission counts. |
| `listAttacks(characterId)` | Returns defensive row IDs, names, numbered labels, ranges, and bonuses for verified official-2014 repeating attacks. Unsupported characters return an empty list. |

The public object is observational. Other modules cannot fabricate target choices or submit a roll through it. Source choices, placement requests, and reviewed submissions are memory-only capabilities that expire, are bound to the initiating player, and are cleared on teardown or sandbox restart. AttackAssist submits an accepted roll as the acting character so the official template remains familiar and CritAssist can observe a natural 1 through its established path.

### 10.19 AlmanacAssist

`GameAssist.AlmanacAssist` is created when AlmanacAssist initializes. AlmanacAssist 2.0.6 is in **Alpha Testing**; integrations should check availability and keep their manual fallback:

```js
const almanac = GameAssist.AlmanacAssist;
if (almanac.isAvailable() && almanac.isTimeAvailable()) {
    const moment = almanac.getTime();
    const weather = almanac.getWeather();
}
```

| Method / Field | Result |
| --- | --- |
| `version` | AlmanacAssist module version. |
| `timeStateSchemaVersion`, `wayfarerDraftSchemaVersion`, `climateStateSchemaVersion`, `astronomyStateSchemaVersion`, `weatherStateSchemaVersion`, `environmentStateSchemaVersion`, `restStateSchemaVersion` | Exact durable subsystem schema versions. |
| `worldStateSchemaVersion`, `sceneSchemaVersion`, `worldPackSchemaVersion`, `temporalContextSchemaVersion`, `wayfarerHandoutSchemaVersion` | Exact world-engine, scene, transfer, local-time, and advanced-calendar schema versions. |
| `isAvailable()` | Reports whether the AlmanacAssist module is enabled and running. |
| `isTimeAvailable()` | Separately reports whether TimeAlmanac can currently provide fictional time. |
| `getTime()` / `getClimate()` / `getAstronomy()` | Return defensive copies of available calendar, regional climate, and celestial context. |
| `getWeather()` / `getEnvironment()` | Return defensive copies of committed weather and environmental context, or `null` while the corresponding system is off. |
| `getSubmoduleStatus()` | Returns legacy top-level configured flags plus explicit `parentEnabled`, `configured`, and effective six-system maps. |
| `getScene(location?)` | Returns one defensive authoritative scene snapshot with provenance, warnings, active phenomena, and coherent current conditions. |
| `getWorld()` / `getTemporalContexts()` | Return defensive copies of normalized campaign-world and local-time definitions. |
| `getRestHistory()` | Returns a defensive copy of bounded completed-rest evidence. |
| `observe(callback, options)` | Filters SemanticEvents to AlmanacAssist events for optional consumers. |

Availability is explicit. Consumers must not assume that enabling AlmanacAssist also enables every internal system, and they must treat `null` context as a supported state rather than a failure.

### 10.20 MECHSUITS Contribution Contract

The executable file follows MECHSUITS v1.5.2 conventions:

* Preserve literal codename and tags: `GAMEASSIST`.
* Keep the file-scoped `canonical_tree` synchronized with actual tags.
* Maintain proper parent/child nesting and paired `BEGIN`/`END` tags.
* Update the narrowest complete framed section whose behavior or contract changes.
* Apply the Meaningful Change Rule to `last_updated_version` and the section footer.
* Preserve prior notes instead of silently deleting project history.
* Do not claim full MECHSUITS compliance without checking the complete v1.5.2 checklist.

---

## 11 · Roll-Table Cookbook <a id="11-roll-table-cookbook"></a>

CritAssist expects these exact Roll20 rollable-table names:

| Table | Intended Use |
| --- | --- |
| `CF-Melee` | Melee weapon fumbles. |
| `CF-Ranged` | Ranged weapon fumbles. |
| `CF-Thrown` | Thrown weapon fumbles. |
| `CF-Spell` | Spell attack fumbles. |
| `CF-Natural` | Natural weapon/unarmed fumbles. |
| `Confirm-Crit-Martial` | Martial critical confirmation/flavor. |
| `Confirm-Crit-Magic` | Magic critical confirmation/flavor. |

Table names must match exactly. GameAssist supplies the roll; you own the entries, weights, and campaign tone.

### 11.1 Sample `CF-Melee` Table

| Entry | Weight | Example Effect |
| --- | ---: | --- |
| **Sweaty Grip** | 1 | Disadvantage on your next attack. |
| **Weapon Twists** | 3 | The attack deals half damage. |
| **Off-Balance** | 2 | You fall prone. |
| **Lost Grip** | 1 | Your weapon falls at the opponent’s feet. |
| **Double Trouble** | 1 | Roll twice; both effects apply. |

### 11.2 Sample Confirmation Tables

| Table | Example Entry | Weight |
| --- | --- | ---: |
| `Confirm-Crit-Martial` | “Perfect opening—describe the decisive strike.” | 1 |
| `Confirm-Crit-Magic` | “Arcane resonance—describe how the spell intensifies.” | 1 |

> **Content note:** Sample effects are suggestions, not enforced mechanics. Adjust them for your system, tone, and player expectations.

---

## 12 · Macro Recipes <a id="12-macro-recipes"></a>

### 12.1 GM Health Dashboard

```roll20chat
!ga-status
!ga-config modules
!ga-metrics
```

### 12.2 GM Panic – Disable Every Bundled Module

```roll20chat
!ga-disable MarkerService
!ga-disable TurnTrackerService
!ga-disable ConfigUI
!ga-disable CritAssist
!ga-disable HPAssist
```

Disabling MarkerService also turns off ConditionAssist, TokenAssist, ConcentrationAssist, NPCAssist, and DebugTools. Core admin commands remain available. NPCAssist's configured marker may be cleared from current-page tokens, but its saved death-history and Arc records are retained.

Disabling TurnTrackerService also turns off InitiativeAssist and CombatAssist and leaves the current native Turn Tracker unchanged.

### 12.3 Restore Normal Bundled Modules

```roll20chat
!ga-enable MarkerService
!ga-enable TurnTrackerService
!ga-enable ConfigUI
!ga-enable CritAssist
!ga-enable ConditionAssist
!ga-enable TokenAssist
!ga-enable ConcentrationAssist
!ga-enable NPCAssist
!ga-enable HPAssist
```

Leave InitiativeAssist, CombatAssist, WelcomeAssist, and DebugTools disabled until they are deliberately wanted.

### 12.4 Concentration Check Prompt

```roll20chat
!concentration --damage ?{Damage Taken|10} --mode ?{Mode|normal|adv|dis}
```

### 12.5 NPC Death Controls

```roll20chat
!npc-death-report
!npc-death-report --scope campaign
!npc-death-buckets
!NPC-WR
!npc-death-audit
!npc-death-report --recent
!npc-death-clear --scope session
!npc-death-clear --scope session --confirm
!npc-death-clear --scope section --nested --confirm
!npc-death-arc
```

### 12.6 NPC HP Setup

```roll20chat
!HP-Selected
```

Select the desired linked NPC tokens before running the macro.

### 12.7 Safe Marker Debug

```roll20chat
!ga-enable DebugTools
!ga-debug marker --marker dead --state toggle
```

The first run is a dry run. Add `--apply` only after checking the preview.

### 12.8 TokenAssist Selected-Token Controls

```roll20chat
!token-assist help
!ta-on showname
!ta-set bar1_value|-5
!ta-set aura1_radius|5 aura1_color|336699 aura1_options|circle
!ta-set statusmarkers|!red
```

Select disposable tokens first. The first command opens the guide; the remaining examples show a nameplate, subtract 5 from bar 1, create a visible circular aura, and toggle the red marker through MarkerService.

### 12.9 InitiativeAssist Encounter Controls

```roll20chat
!ga-enable InitiativeAssist
!Init-Go
!Init-GM
!Init-Roll-Selected
!Init-RR
!Init-RR-Menu
!Init-Audit
```

Use these only after opening Roll20's Turn Tracker on the encounter page. `!Init-GM` opens the neutral controls and roster privately when no public invitation is wanted. `!Init-Roll-Selected` adds or updates the selected controlled characters even when they are not yet in the tracker. `!Init-RR` rerolls PCs and living NPCs already in that tracker, whispers the result list to the GM, and does not add every page token or change custom counters.

`!Init-Help` opens instructions, `!Init-Menu` opens the action-focused Control Center, `!Init-Status` gives a quick chat summary, and `!Init-Audit` whispers the detailed read-only review without creating a handout.

### 12.10 CombatAssist Encounter Controls

```roll20chat
!ga-enable CombatAssist
!Combat-Start
!Combat-Next
!Combat-Prev
!Combat-Adopt
!Combat-Restore
!Combat-Pause
!Combat-Resume
!Combat-Status
!Combat-Timer
!Combat-Cue
!Combat-End
```

Establish initiative first. Start CombatAssist only when the encounter actually begins. Roll20's native arrows remain the normal tracker controls; Next and Previous are guarded alternatives. A single custom **Round Counter** row with value `1` and calculation `+1` can supply the round boundary and number. Adding or removing combatants, manually reordering the tracker, and using `!Init-RR` preserve the round and establish a fresh cycle from the current first entry. Pause is optional when making several edits. Restore previews one saved tracker checkpoint; `!Combat-End` asks for confirmation and leaves the native tracker intact.

### 12.11 WelcomeAssist Setup

```roll20chat
!ga-enable WelcomeAssist
!Welcome
!Welcome-Custom add Dovie'andi se tovya sagain
!Welcome-Mode mixed
!Welcome-Preview
```

Preview privately, then reload the sandbox when the greeting is ready. Use `!Welcome-Announce` only when an immediate public greeting is intended.

---

## 13 · Performance Benchmarks <a id="13-performance-benchmarks"></a>

> **Historical reference only:** The following numbers were recorded for an earlier v0.1.3-era build and have **not** been revalidated for v0.1.5.x. Roll20 sandbox load, campaign size, browser state, network conditions, token formulas, and other Mods can materially change results. Do not treat this table as a current performance guarantee.

| Environment Item | Historical Test Environment |
| --- | --- |
| CPU / RAM | Ryzen 7 7735HS @ 3.2 GHz · 16 GB DDR5-4800 |
| OS / Browser | Windows 11 Home 24H2 · Chrome 137 |
| Roll20 sandbox | Experimental channel, April 2025-era build |
| Dataset | 25 NPC tokens on one page |

**Historical `!HP-All` timing**

| Run Group | Samples | Mean | Median | Standard Deviation | Min–Max |
| --- | ---: | ---: | ---: | ---: | ---: |
| Warm sandbox | 24 | 280 ms | 268 ms | 24 ms | 253–337 ms |
| Fresh sandbox | 10 | 355 ms | 350 ms | 18 ms | 330–387 ms |
| **Combined** | **34** | **298 ms** | **300 ms** | **39 ms** | **253–387 ms** |

### 13.1 Repeatable Benchmarking for v0.1.5.x

1. Duplicate the campaign or use a test game.
2. Record token count, active Mods, formulas, and sandbox channel.
3. Run both fresh-sandbox and warm-sandbox samples.
4. Test visible user behavior, not only queue metrics.
5. Remember that `!ga-metrics` queue durations describe explicit queued work; direct event-handler work is not automatically represented as a queue duration.

---

## 14 · Troubleshooting <a id="14-troubleshooting"></a>

### 14.1 GameAssist Appears Unresponsive

Run:

```roll20chat
!ga-status
!ga-config modules
!ga-metrics
```

Start with the default `!ga-status` system check. A separate **GameAssist Actions** whisper immediately below the table provides **Troubleshooting Details**, **Modules & Services**, and **Open Settings** buttons. The detailed view uses a separate **Troubleshooting Actions** strip for **Refresh Details**, **Simple View**, **Modules & Services**, and **Metrics**. The details table keeps session counters, queue information, the last recorded activity, and GameAssist's internal event-hook count separate from the health result.

### 14.2 A Module Is Configured but Not Running

Use:

```roll20chat
!ga-config modules
```

The output distinguishes:

* **Configured** – stored `enabled` preference.
* **Running** – initialized and active in the current sandbox.
* **Dependency-skipped** – not running because a dependency is confirmed missing.
* **Unverifiable dependency** – GameAssist could not confirm the dependency and proceeded with a warning.

Then try:

```roll20chat
!ga-enable <ModuleOrService>
```

For ordinary module control, open `!ga-nav`, choose the module, and use its direct **Enable** or **Disable** button. This is the quickest way to turn off CritAssist or another running feature without remembering its exact configuration command.

### 14.3 MarkerService and Other Marker Mods

ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, and DebugTools use `GameAssist.MarkerService`; they should report `deps confirmed` without standalone TokenMod or StatusInfo.

Run:

```roll20chat
!ga-status --details
!ga-config modules
```

The details panel should report MarkerService as enabled. ConditionAssist and TokenAssist should appear enabled and running after standalone StatusInfo and TokenMod are removed. If a standalone script is detected, the details explain which overlapping command handler is suspended.

If another Mod must own marker behavior, use `!ga-disable MarkerService`. GameAssist disables ConditionAssist, TokenAssist, NPCAssist, ConcentrationAssist, and DebugTools first, then turns off MarkerService. The chat notice identifies the affected features; unrelated GameAssist modules remain available. Re-enable MarkerService before re-enabling any dependent module.

### 14.4 TokenAssist Does Not Respond or a Token Does Not Change

Run:

```roll20chat
!ga-config modules
!ga-status --details
!token-assist help
```

TokenAssist and MarkerService must both be running. If troubleshooting details report standalone TokenMod, remove that script and restart the sandbox. While the collision exists, TokenAssist leaves only the deprecated `!token-mod` alias to the standalone handler; the `!token-assist`, `!ta`, and `!ta-*` commands remain available.

Select a disposable token and try:

```roll20chat
!ta-on showname
!ta-set name|"TokenAssist Test"
!ta-set aura1_radius|5 aura1_color|336699 aura1_options|circle
```

Values containing spaces must be quoted. Players may use selected-token commands, but `--ids` remains restricted unless the GM enables it through `!token-assist --config players-can-ids|on` or `!ta-config players-can-ids|on`. TokenAssist 1.3.1 includes computed attribute reports, controller-list editing, color arithmetic, multi-sided-token selection, and advanced MarkerService expressions. Image-side stack editing, default-token writes, TokenMod's exact help-handout rebuilding, and a global TokenMod compatibility object remain outside its boundary and should produce a clear warning rather than a partial mutation.

### 14.5 ConditionAssist Does Not Respond, Shows the Wrong Wording, or Uses the Wrong Marker

Run:

```roll20chat
!ga-config modules
!condition help
!condition config
!cond-prone
!condition status
```

Confirm MarkerService and ConditionAssist are running, and remove standalone StatusInfo if both tools are responding. The Settings panel identifies the active **2014 SRD**, **2024 SRD**, or **Campaign Custom** wording source. Use the profile buttons to restore an official set, or open **Manage Conditions** to edit one description or check its marker. Built-in ids, custom display names, exact `Name::id` tags, and numbered markers such as `red@3` are supported. `!condition status` separates markers that match configured conditions from other active markers so the GM can tell whether the marker exists but lacks a ConditionAssist definition. Use the validated ConditionAssist importer for definition maps; generic `!ga-config set ConditionAssist conditions=...` is intentionally refused.

When a marker action fails, first verify the configured marker and target token rather than changing TokenMod permissions:

```roll20chat
!ga-config get NPCAssist deadMarker
!ga-config get ConcentrationAssist marker
!npc-death-audit
!concentration --status
```

For an exact custom marker, configure either its display name or stored `Name::id` tag. A valid exact stored tag remains usable even when Roll20's campaign marker registry cannot be parsed.

### 14.6 Startup Messages Are Missing

This is normally expected. `GameAssist.flags.QUIET_STARTUP` defaults to `true`, suppressing module-specific startup whispers. The core ready message remains visible.

Use `!ga-status` and `!ga-config modules` instead of relying on one whisper per module.

### 14.7 State Repair or Unknown-Branch Warnings

Known module branches with malformed/missing `config` or `runtime` containers are repaired conservatively at startup. Valid existing config is preserved.

Unknown branches are not deleted automatically. Review the warning, then explicitly remove orphaned branches only when you are certain:

```roll20chat
!ga-config cleanup
```

### 14.8 `!ga-config list` Is Not a Full Backup

The `GameAssist Config` handout contains flags, global config, and module config only. It excludes runtime caches, metrics, and unknown state branches. v2.0.0 cannot import the snapshot.

Use it for configuration review and upgrade comparison—not as a full restore mechanism.

### 14.9 CritAssist Menu or Table Roll Fails

Confirm all seven table names exist exactly:

```text
CF-Melee
CF-Ranged
CF-Thrown
CF-Spell
CF-Natural
Confirm-Crit-Martial
Confirm-Crit-Magic
```

Then run:

```roll20chat
!critfumble menu
!critfumble help
!critfumble-melee
!confirm-crit-martial
```

### 14.10 NPC Death Marker Does Not Match HP

Run:

```roll20chat
!ga-config get NPCAssist deadMarker
!npc-death-audit
!npc-death-repair
```

Confirm the token:

* is on the Objects layer,
* represents a character,
* has character attribute `npc=1`,
* uses `bar1_value` for HP,
* and has a valid configured marker.

`!npc-death-audit` whispers a bounded list of the specific tokens needing a marker added or removed, and writes the complete mismatch list to the `GameAssist NPC Death Audit` handout. Player characters are intentionally excluded from this audit.

The audit does not change markers. Use its **Review Marker Repairs** button or run `!npc-death-repair` to preview corrections. Read the proposed changes before confirming: repair follows current selected-bar HP, so a token whose HP is wrong should be corrected manually first. `!npc-death-repair --confirm` re-scans the page, changes only the configured death marker, and leaves HP and history untouched.

`!npc-death-report` shows recorded bucket history in summary/detail views; it does not audit the page.

### 14.11 Concentration Marker Does Not Clear

Select the affected token and run:

```roll20chat
!ga-config get ConcentrationAssist marker
!concentration --off
!concentration --status
```

`!concentration --status` reads through MarkerService and should always respond while ConcentrationAssist is running. If it reports that the configured marker cannot be recognized, open:

```roll20chat
!concentration settings
!concentration markers
```

Choose **Use Stopwatch** for the portable built-in default, or choose a registered custom campaign marker. The direct `!concentration marker --value <name-or-tag>` command remains available when needed.

### 14.12 NPC HP Does Not Roll

Confirm the token:

* is linked to a character,
* represents an NPC with `npc=1`,
* has a valid `npc_hpformula` such as `4d8+8`,
* and is on the correct page or selected for the command.

HPAssist does not require TokenMod.

### 14.13 Debug Command Does Nothing

Enable DebugTools first:

```roll20chat
!ga-enable DebugTools
```

DebugTools performs a dry run unless `--apply` is supplied. To use selected tokens, omit `--token`; do not write `--token select`.

### 14.14 InitiativeAssist Does Not Roll or Preserves a Row

Run:

```roll20chat
!ga-config modules
!Init-Status
!Init-Audit
```

Confirm Roll20's Turn Tracker is open on the intended encounter page and InitiativeAssist is enabled in **Manager** mode. A character does not need an existing tracker row for **Roll Initiative**, **Roll Selected**, or **Roll Options**; it needs an object-layer token on the tracker page, a linked character sheet, and control assigned to the clicking player. The GM may also roll linked living NPCs from the GM layer through the private roster. If the player is on another page or control/linkage is missing, InitiativeAssist names that setup problem directly.

Use `!Init-GM` when the GM needs the neutral initiative controls and complete roster without posting the player invitation publicly. If it produces no panel, confirm InitiativeAssist is running in Manager mode and the Turn Tracker is open on the encounter page.

TurnTrackerService accepts both the normal Roll20 tracker page id and the open-tracker boolean used by some campaign sessions. With an empty tracker it uses the Player Ribbon page; with existing turns it identifies the single page containing those token rows. It refuses to guess if tracker tokens genuinely span multiple pages.

The detailed Initiative Review separates current Turn Tracker rows from linked characters found on the tracker page and whispers the result to the GM without creating a handout. It explains rows skipped because they are custom entries, objects, dead NPCs, off-page tokens, stale references, unsupported sheet data, HP/death-marker mismatches, or characters whose initiative data cannot be read. InitiativeAssist also probes compatible 2014 attributes or 2024 Beacon data when Roll20 omits or changes the character's sheet label. GameAssist-created turns include Roll20's encounter-page field and are checked before success is reported; if a completed result is ever absent from Turn Order, record the exact result and current page for troubleshooting.

For D&D 2024 characters, use Roll20's supported Experimental Mod API server when Beacon computed data is unavailable. InitiativeAssist deliberately leaves an unreadable 2024 row unchanged rather than rolling with zero. For coexistence with another initiative roller, use `!Init-Mode observer` and let only one tool write initiative values.

### 14.15 CombatAssist Stops Counting

Run:

```roll20chat
!ga-config modules
!Combat-Status
!Combat-Menu
```

CombatAssist reports **attention** when the tracker is not trustworthy enough to follow. Common causes are a closed tracker, a page change, malformed tracker data, a stale token reference, duplicate identities, or native movement with exactly two entries where Roll20 does not reveal the direction. Valid additions, removals, rerolls, priority changes, and manual reordering preserve the round and rebaseline automatically.

Use **Use Current Tracker** when the visible order is correct. Use **Restore Last Safe Tracker** or **Undo Last Tracker Change** when the preceding saved order should return; restoration always previews its effect and refuses to continue if the tracker changed after that preview. Use **Restart at Round 1** only when the GM deliberately wants a new encounter baseline.

With exactly two rows, use `!Combat-Next` or `!Combat-Prev`. Roll20 exposes the same two-row result for its native forward and backward arrows, so CombatAssist refuses to guess the direction.

If a player cannot use **End My Turn**, confirm announcement mode is `whispers`, the button came from the newest turn message, and the linked character still names that player as a controller. Character control is authoritative when a token is linked. A successful click receives a private Turn Complete message; an older button receives a friendly notice that the tracker already advanced.

If a native custom **Round Counter** does not advance through `!Combat-Next`, confirm it has one of the documented whole-label names, a positive whole-number current value, and a simple signed whole-number Round Calculation such as `+1`. CombatAssist refuses multiple plausible counters rather than choosing one silently. Native Roll20 arrow movement normally evaluates the calculation itself; CombatAssist evaluates the same simple calculation on its own guarded forward movement.

If a turn reminder appears late, record whether initiative was advanced through Roll20, CombatAssist, InitiativeAssist, or another Mod. GameAssist binds each callback to the exact encounter, round, current token, tracker revision, and deadline; a callback from an older turn should produce no message. `!Combat-Timer` shows the live configuration. `!Combat-Cue` shows the current ping audience; hidden and GM-layer turns are always restricted to the GM.

If another Mod also advances turns, manages rounds, rewrites tracker rows, or inserts and updates counters, use only one encounter-flow owner. Disabling CombatAssist leaves InitiativeAssist and the native tracker available.

### 14.16 WelcomeAssist Does Not Greet the Table

Run:

```roll20chat
!ga-config modules
!Welcome-Status
!Welcome-Preview
```

WelcomeAssist starts disabled. Enable it, configure and preview it, then reload the Mod sandbox; enabling it during a running sandbox intentionally does not announce. The automatic greeting waits 1-60 seconds, runs at most once per sandbox lifecycle, and is skipped when another configured GameAssist component remains inactive. In that case, the GM warning names the blocking component.

`!Welcome-Preview` is private. `!Welcome-Announce` is public and consumes the automatic greeting opportunity for the current sandbox so the table does not receive a duplicate after the timer fires. Custom mode falls back to the professional greeting when its campaign list is empty. Existing `!welcome-assist` macros remain accepted.

### 14.17 EffectAssist Reports a Pending or Mismatched Projection

1. Confirm EffectAssist is enabled with `!ga-config modules`.
2. Open `!Effect-Status`, then run `!Effect-Audit`.
3. A **pending** projection means the semantic effect record is safe but a required marker, condition, concentration, or sheet adapter could not complete.
4. A **missing or changed projection** means the effect record and ownership ledger still exist, but a marker, condition, concentration state, or exact 2014-sheet row changed.
5. A **token identity change** means the exact token now represents a different character. EffectAssist refuses automatic cleanup or repair on that token.
6. If an EffectAssist-created sheet row was edited, keep it or remove it manually after reviewing the character; EffectAssist intentionally will not delete an edited row.
7. Use the audit's generated confirmation button only when the displayed repair matches the GM's intent. A stale, expired, or different-GM confirmation is refused.

If a player caster button or recipient button is old, reused, or belongs to another player, EffectAssist displays **Start Again** instead of failing silently. Use `!effect` to begin again. If a player used **Ask the GM**, open `!Effect-Requests`; valid requests remain available for ten minutes, while requests whose source control or player-casting permission changed remain visible as needing attention until dismissed or expired.

Disabling EffectAssist preserves valid records and projections. Re-enable it and audit before ending or repairing effects. A marker that existed before EffectAssist applied the first source is intentionally preserved after the final source ends.

### 14.18 HealAssist Refuses or Defers a Healing Action

Run:

```roll20chat
!ga-config modules
!Heal-Status
!Heal-Audit
```

HealAssist starts disabled and requires HealthService. If HealthService is disabled, HealAssist is also disabled without affecting unrelated modules. Re-enable HealthService first, then HealAssist.

An old confirmation is refused when it expired, was already used, belongs to another player, or when the source, recipient, control, page, HP, or maximum HP changed after review. Start a fresh action; HealAssist does not reuse the old roll against different HP evidence. A player request may also need GM review because the recipient is an NPC, hidden, on the GM layer, or off the player's current page. Open `!Heal-Requests` instead of granting the player direct access to that HP.

If a multi-recipient write fails, inspect every listed recipient before retrying. HealAssist attempts verified rollback of earlier recipients, but reports the transaction as failed rather than assuming restoration succeeded. Spell slots, potions, and class resources remain manual in every result.

### 14.19 AttackAssist Refuses or Does Not Roll

Run:

```roll20chat
!ga-config modules
!Attack-Status
!Attack-Audit
```

AttackAssist starts disabled and supports repeating attacks on the official D&D 5E by Roll20 2014 PC sheet. A selected 2024, NPC, unlinked, hidden, off-page, or uncontrolled attacker produces a specific refusal; its native sheet buttons remain available. If the repeating attack was renamed, removed, or structurally changed after the menu opened, start again so AttackAssist can read the current stable row.

If a row contains a custom Roll20 `?{...}` query, AttackAssist stops before rolling and names the saved field when possible. Use the native sheet attack for that row; this refusal prevents an unanswered client prompt from reaching Roll20's API dice parser and disabling every Mod in the sandbox.

A visible target can be chosen even when the player does not control it. Hidden, GM-layer, and off-page targets stay in a private GM request. Old, reused, or another player's buttons do not roll again. AttackAssist never applies damage, spends ammunition or spell slots, changes HP or markers, or advances combat; resolve those table decisions after the familiar attack card appears.

If both AttackAssist and another Mod submit the same sheet attack or announce the same attacker and target, choose one guided attack workflow to avoid duplicate rolls or messages. A natural 1 should reach CritAssist once from the character's attack card.

### 14.20 AlmanacAssist Context or Rest Needs Attention

Run:

```roll20chat
!Almanac-Status
!Almanac-Audit
!Almanac-Systems
```

The audit is read-only and names the affected internal system. A missing optional context source is not automatically a failure: Weather can use its fallback context, Astronomy can use its manual day and season, Environment can use a manual preset or override, and Rest can proceed without changing fictional time.

If a rest preview expires or reports that a token, controller, represented character, sheet field, or TimeAlmanac decision changed, prepare a new preview. Do not retry an old confirmation button. AlmanacAssist refuses the transaction before writing rather than mixing an old preview with current sheet state.

Fictional TimeAlmanac dates are separate from GameAssist's table timezone and NPCAssist's real-world Session rollover. Changing one does not change the other.

### 14.21 Compatibility Hints

Compatibility scanning is debug-only:

```js
GameAssist.flags.DEBUG_COMPAT = true;
```

Reload, inspect the output, then return it to `false` to avoid noise. If another Mod processes the same natural-1 attack rolls, concentration markers, NPC death events, NPC HP/bar 1 changes, initiative values, custom tracker rows, rounds, or turn advancement, choose one tool to own that responsibility. InitiativeAssist Observer mode prevents its initiative writes; disabling CombatAssist prevents its encounter-flow controls while leaving the native tracker unchanged.

The **5th Edition OGL by Roll20 Companion** overlaps GameAssist primarily through NPC HP initialization and token-bar ownership. Its `!npchp` and automatic NPC-token behavior can write the same HP bars used by HPAssist, HealthService, and NPCAssist, so enable only one automatic NPC HP owner. The Companion's supplied legacy handler deliberately ignores API-originated attack templates; AttackAssist rolls therefore should not trigger its ammunition or spell-slot processing, while normal player clicks from the Classic sheet still can. Prove both expectations once with disposable HP and attack tests after changing either script.

### 14.22 Still Stuck?

Capture:

1. Exact GameAssist version.
2. `!ga-status` output.
3. `!ga-config modules` output.
4. Exact command/action that failed.
5. Exact API sandbox error text.
6. Which other Mods can change the same token bars, markers, attack-roll messages, initiative values, or Turn Tracker rows.

These details help maintainers reproduce the campaign conditions and focus the investigation quickly.

---

## 15 · Upgrade Paths <a id="15-upgrade-paths"></a>

### 15.1 Recommended Upgrade: v1.8.2 → v2.0.0

I. **Record the Working Campaign**

1. Keep a copy of the complete v1.8.2 script.
2. Run `!ga-config list` for a configuration-only comparison snapshot.
3. Record `!ga-config modules`, active NPC reporting scopes, and any non-default marker names.

> The snapshot is not a full-state backup and cannot be imported automatically. NPC history, Arc records, runtime caches, and future EffectAssist instances are intentionally outside it.

II. **Replace the Complete Script**

1. Replace v1.8.2 with the complete GameAssist v2.0.0 file.
2. Save or restart the Mod sandbox.
3. Do not combine framed sections from different releases.

III. **Confirm Existing Modules First**

```roll20chat
!ga-status
!ga-status --details
!ga-config modules
!NPC-Status
!Con-Status
!HP-Status
```

EffectAssist, HealAssist, AttackAssist, and AlmanacAssist should appear configured off and paused on first installation. Existing canonical module settings, NPC records, and established command aliases remain available.

IV. **Enable and Prove EffectAssist Deliberately**

```roll20chat
!ga-enable EffectAssist
!Effect-GM
!Effect-Status
!Effect-Audit
```

Use disposable linked 2014 PC tokens for one complete Bless lifecycle, two overlapping Bless sources, one final cleanup, one pre-existing-marker preservation check, and one manual marker-removal audit/repair cycle. Confirm that Bless creates compact `Bless (GA)` rows in the target's global attack and saving-throw modifiers, establishes concentration on the source, and removes only owned state when concentration ends. Other Mods that create, edit, or remove global attack, saving-throw, or AC modifier rows can overlap EffectAssist's Bless, Warding Bond, or Haste projections; let one tool own each effect row and audit after testing overlapping automation.

V. **Enable and Prove HealAssist Deliberately**

```roll20chat
!ga-enable HealAssist
!Heal-GM
!Heal-Status
!Heal-Audit
```

Note the saved application mode. Damage a disposable linked 2014 PC, run `!Heal-Auto on`, and complete one supported spell or potion action. Confirm that HP changes once without a review screen. Run `!Heal-Auto off` and repeat: the roll review must show current, proposed, maximum, and actual restored HP; no HP changes before confirmation; and the confirmation cannot be used twice. Repeat with a player targeting a visible PC they do not control, then with an NPC routed through the retained GM request. Confirm NPC HP never appears publicly. Test one stale confirmation by changing the target's HP after review, then restore your preferred application mode.

VI. **Enable and Prove AttackAssist Deliberately**

```roll20chat
!ga-enable AttackAssist
!Attack-GM
!Attack-Status
!Attack-Audit
```

Select a controlled official-2014 PC with at least two repeating attacks and choose a visible target the player does not control. Complete one Normal or Advantage roll and confirm the familiar attack card appears once, the attacker and target announcement follows it, and no target HP, marker, effect, condition, Turn Tracker row, or resource changes. Test one natural 1 with CritAssist enabled and confirm its workflow appears once. Reuse the old roll button and change or remove a selected attack row before using an older menu; both stale paths should refuse a second roll. With a separate player login, send one hidden or off-page target request to the GM and confirm the target identity never appears in the player's whisper.

VII. **Enable and Prove the Complete Almanac Deliberately**

```roll20chat
!ga-enable AlmanacAssist
!aa-gm
!Almanac-Status
!Almanac-Audit
```

AlmanacAssist 2.0.6 is in **Alpha Testing**. Begin with `!aa-gm`, **Current Settings**, weather generation, named-location save/recall, and internal-system toggles. Confirm a sandbox reload preserves valid settings and leaves unrelated module data unchanged. For expanded alpha coverage, use **More Tools** to reach Worldbuilding Mode: create a disposable geography/biome/ecoregion/location chain, preview then confirm a destination, conduct a reviewed journey, apply and end a phenomenon, preview a local temporal context, and inspect scene details. Verify the saved Wayfarer calendar's 20-hour/75-minute bounds before trying a stale and a valid advanced handout import. Test WorldPack transfer without changing chronology or character state, and use a disposable linked 2014 PC for rest checks. The [Almanac smoke track](Smoketest.md#focused-v200-complete-almanacassist-acceptance) separates the alpha baseline from broader graduation coverage; record untested cases rather than implying full acceptance.

VIII. **Run the Release Smoke Test**

Use [§4.1 Minimum Smoke Test](#41-minimum-smoke-test), the focused v2.0.0 EffectAssist, HealAssist, AttackAssist, and complete AlmanacAssist tracks, and the retained v1.8.2 regression in `Smoketest.md`. Include the ordinary death/revival, concentration, HP, condition, initiative, combat, welcome, and module lifecycle checks used by the campaign.

### 15.2 Rollback

If v2.0.0 fails its smoke test:

1. Replace it with your complete previous working script.
2. Save/reload.
3. Run `!ga-status` and the smallest relevant module checks.
4. Remember that rolling back code does not automatically roll back persistent state.
5. Do not attempt manual state import unless you have a separately validated process.

### 15.3 Upgrade Discipline

> **Copy → Save → Inspect → Smoke Test → Keep or Roll Back**

Do not make a live-session release decision from syntax checks alone. The Roll20 API sandbox remains the final compatibility test.

---

### 15.4 Choosing a Previous Version

The v2.0.0 One-Click package retains selected legacy milestones as well as the previously published releases:

| Version | Historical feature set |
| --- | --- |
| **1.8.2** | Final pre-v2 baseline: canonical module names, NPC Bloodied alerts, and progressive NPC naming. |
| **0.1.7.0** | CombatAssist with native round counters, timers, and turn controls. |
| **0.1.6.1** | InitiativeAssist and WelcomeAssist. |
| **0.1.5.1** | Integrated token/condition tools and configurable table timezones. |
| **0.1.4.7** | Standalone TokenMod-era workflows; TokenMod remains required for its marker changes and StatusInfo is a separate optional companion. |
| **0.1.1.2, 0.1.1.1, 0.1.1.0** | Earlier published releases, retained for existing campaigns. |

The older `0.1.*` version numbers are intentional; they are not renamed to `1.*`. Use the archived version's own commands and requirements rather than assuming the v2.0.0 guide applies to it. Intermediate unpublished patches remain in repository history without adding another One-Click selection.

**A previous script version is not a campaign-data restore.** Test upgrades or version changes in a separate campaign copy. `!ga-config list` exports configuration only; it does not preserve all runtime history or provide a full-state restore.

---

## 16 · Contributing <a id="16-contributing"></a>

Thank you for helping improve GameAssist. Contributions should remain narrow, testable, and explicit about Roll20 limitations.

### 16.1 Reporting Issues

Include:

1. A clear title and exact GameAssist version.
2. Reproduction steps in a minimal test game when possible.
3. Relevant commands, token setup, and character attributes.
4. Exact API sandbox errors and GameAssist whispers.
5. `!ga-status` and `!ga-config modules` results.
6. Whether dependencies were confirmed, missing, or unverifiable.

### 16.2 Coding Style

* Use the existing JavaScript style and Roll20-compatible runtime features.
* Preserve literal identifiers, public commands, module names, tags, and codename `GAMEASSIST`.
* Prefer shared helpers when behavior is genuinely shared.
* Validate and normalize at input edges.
* Keep ordinary handlers direct; use `GameAssist.enqueue(...)` only for work that requires serialization.
* Do not override Roll20’s global `on` or invent an `off` lifecycle that Roll20 does not provide.
* Never claim that a timeout cancels an underlying Roll20 operation.

### 16.3 MECHSUITS Update Workflow

For executable code changes:

1. Identify the narrowest framed section whose code or contract changes.
2. Return or replace the complete `BEGIN` through `END` section.
3. Replace ancestors only when their declared contract becomes inaccurate.
4. Keep the canonical tree synchronized if tags change.
5. Apply the Meaningful Change Rule:
   * meaningful behavior/contract/operational change → update `last_updated_version` and add `Changed (...)`;
   * comment-only or proven behavior-preserving change → keep `last_updated_version` and add `Maintenance (...)`.
6. Preserve prior commentary under `Prior notes`.
7. Verify the full v1.5.2 checklist before calling the file MECHSUITS-compliant.

### 16.4 Testing Expectations

At minimum:

* Run a JavaScript syntax check.
* Audit MECHSUITS tag pairing, nesting, tree consistency, section metadata, and footers.
* Run the Roll20 smoke test.
* Test each changed command or event with real Roll20 objects.
* Test dependency states affected by the change.
* Test module disable/re-enable when lifecycle behavior changes.
* Confirm no unrelated module behavior changed.

### 16.5 Documentation Expectations

Update the relevant README surfaces whenever you change:

* commands → Command Matrix and Module Guide;
* configuration → Configuration Keys;
* roll-table names → Roll-Table Cookbook;
* public helpers → Developer API;
* operational limitations → Architecture and Troubleshooting;
* release behavior → Changelog and Upgrade Paths.

---

## 17 · Roadmap <a id="17-roadmap"></a>

The roadmap is directional, not a promise. Items are labeled so implemented features are not mistaken for future work and future ideas are not mistaken for current behavior.

### 17.1 Current Status

| Item | Status in v2.0.0 | Notes |
| --- | --- | --- |
| MarkerService | **Implemented and accepted** | One toggleable service owns GameAssist marker resolution, mutation, preservation, and observation. Disabling it turns off dependent modules without disabling unrelated features. |
| Bundled marker consumers | **Migrated** | NPCAssist 1.5.0, ConcentrationAssist 0.6.0, and DebugTools 0.3.1 no longer require standalone TokenMod. ConcentrationAssist supplies a portable built-in default, guided marker controls, the lifecycle contract used by EffectAssist, and optional private HealthService check offers; it accepts verified official-2014 save data and refuses unsupported or unreadable contracts instead of guessing `+0`. Equivalent linked sheet/token evidence no longer invalidates an otherwise current offer, while a real second HP change still does. Supported applied DebugTools damage supplies verified test evidence. |
| ConditionAssist 1.0.5 | **Implemented and accepted** | Condition references with `!condition`, full-name aliases, and case-insensitive `!cond-<condition>` commands, accurate selected-token recognition, current-page condition/marker status, selectable 2014/2024 SRD wording, campaign edits, marker artwork, verified marker-toggling announcements, validated legacy import, MarkerService synchronization, compact navigation, GM/DM control aliases, and the shared Roll20 default-template presentation. |
| TokenAssist 1.3.1 | **Implemented; expanded verification pending** | General token controls with bare `!token`, full-name `!tokenassist`, `!token-assist`, and `!ta` commands, longest-name-first alias routing, temporary support for older `!token-mod` macros, MarkerService-backed advanced expressions, controller/report routing, computed-value reports, relative color and lighting controls, multi-sided-token selection, duplicate-install protection, a compact action-focused GM/DM screen, an organized extended action library, a stable manual, and the shared Roll20 default-template presentation. |
| Integrated architecture stabilization | **Complete** | Upgrade, migration, lifecycle, command, marker, documentation, and Roll20 sandbox checks passed under Issues #28 and #29. |
| DM-configurable timezone | **Implemented; focused acceptance passed** | One validated table timezone controls readable timestamps and date-managed NPC Sessions while stored event instants remain absolute. The complete live module suite was not rerun for v0.1.5.1. |
| TurnTrackerService 1.0.0 | **Implemented; live foundation passed** | Toggleable native-tracker snapshots, structural row classification, guarded lossless writes, observations, dependency cascading, and visible page-owned row creation passed the focused Roll20 checkpoint. |
| SemanticEvents 1 | **Implemented; local contract checks passed** | Immutable, versioned, direct-delivery domain events let optional modules interoperate without hard dependencies, persistence, replay, or implicit queueing. |
| SheetCapabilities 1.0.0 | **Implemented; read-only contract** | Always-on per-character and per-operation evidence for supported 2014, supported 2024/Beacon, and unknown sheet surfaces. `!ga-sheets` audits capability status without changing characters. |
| EffectAssist 2.5.4 | **v2.0.0 sandbox candidate** | Applies supported 2014-sheet rows through sheet workers, separates player caster selection from recipient count, keeps ordinary caster choices compact while disambiguating duplicate labels, offers Bless totals of 1-3 plus a higher-level 4-11 menu, identifies invalid recipients precisely, binds concentration to the chosen source token, and retains the established player, audit, repair, cast-proposal, and provider-specific duration workflows. Live Roll20 acceptance remains required. |
| HealAssist 1.2.2 | **v2.0.0 sandbox candidate** | Disabled-by-default guided official-2014 healing includes direct target selection for one-recipient actions, recipient-count choices for multi-target actions, normal and maximum catalogs, default automatic verified application or optional review, private automatic-failure diagnostics, authorized sources, visible-PC targeting, retained private placement requests, and safe module-speaker fallback for public results. |
| AttackAssist 1.1.0 | **v2.0.0 sandbox candidate** | Disabled-by-default official-2014 repeating-attack guidance includes stable row identity, compact direct native targeting, immediate sheet-setting submission by default, optional sheet/normal/advantage/disadvantage review, complete prompt-safe Classic-sheet formula materialization, visible native sheet roll cards, preflight refusal for unresolved prompts, incomplete fields, and unsafe dice expressions, one-use rolls, and no damage or combat-state writes. |
| AlmanacAssist 2.0.6 | **Alpha Testing** | Includes layered Climate/Biome and local-detail setup, seasonal weather, saved-location recall, calendars, moons, reviewed travel, environments, and single-use transactional 2014-sheet rests. Focused live Roll20 use was reported on 2026-08-27, and the grouped local regression sweep passed. Expanded campaign and upgrade testing continues; this is not a claim that every live acceptance case has passed. |
| InitiativeAssist 1.0.8 | **Implemented** | Mixed 2014/2024 initiative, full-name and short command aliases, public and private GM/DM start pages, private NPC evidence, shared NPC HP-bar eligibility, GM-layer NPC batches, selected-character batches, roll options, selective rerolls, encounter groups, status, audit, compact navigation, and a stable manual through the case-insensitive `!Init-` namespace. |
| CombatAssist 1.2.2 | **v2.0.0 integration candidate** | The accepted optional native-tracker layer opens its control center from bare `!combat` or `!combatassist` and retains native round-counter authority, conservative fallback rounds, preserved-round roster/reroll adoption, recovery, guarded movement, timers, pings, Ready/Delay records, bounded health evidence, optional NPCAssist handoff, and GM/DM controls. TurnTrackerService remains its only baseline prerequisite. |
| WelcomeAssist 0.1.6 | **Implemented and accepted** | Disabled-by-default post-bootstrap greeting with professional, built-in, campaign-custom, and mixed modes; private preview/configuration; bounded custom text; health-gated one-per-sandbox automatic output; shared Roll20-template controls; GM/DM status controls; a stable manual; short and full-name commands; and retained `!welcome-assist` compatibility. The public greeting card remains intentionally distinct from private controls. |
| GM-private PC health alerts | **v2.0.0 sandbox candidate** | Optional HealthService consumer with 50%, 25%, and 10% downward-crossing controls, combined notices, hidden-by-default exact HP, and no NPC overlap. |
| Configuration export | **Implemented, partial** | Versioned configuration-only snapshot; no import/restore. |
| State self-healing | **Implemented, conservative** | Repairs known containers; does not auto-delete unknown branches. |
| Public queue API | **Implemented, opt-in** | Does not route every event through the queue. |
| NPC death history | **Implemented** | Page-local progressive NPC names, four-level handouts, Arc management, report writer, date-managed Sessions, MarkerService-backed death markers, and optional GM-private Bloodied threshold notices. |
| Native Mord character-sheet support | **Deferred** | Outside v2.0.0; the next platform phase is the Foundry edition after the Roll20 baseline is established. |

### 17.2 Current Candidate: v2.0.0 Gameplay and Campaign Foundations

The v2.0.0 candidate keeps four disabled-by-default modules on one development line. EffectAssist 2.5.4 supplies source-aware 2014-sheet effects, compact caster choices with duplicate disambiguation, Bless support through eleven recipients, exact-token concentration ownership, compact `(GA)` owned rows, direct application with optional review, worker-safe projection cleanup, bounded Bless proposals, guarded Guidance consumption, provider-specific duration candidates, retained GM requests, and a direct GM casting surface. HealAssist 1.2.2 adds direct one-recipient targeting plus normal or maximum healing with default automatic verified application or optional review and safe public-result fallback. AttackAssist 1.1.0 adds stable official-2014 repeating-attack selection, immediate sheet-setting submission by default, optional roll-mode review, complete prompt-safe Classic-sheet formula materialization, crash-safe final dice-expression validation, and visible native sheet roll cards without resolving damage. AlmanacAssist 2.0.6 adds layered natural-world profiles, season-aware weather, reviewed travel, and single-use rest confirmations as an optional **Alpha Testing** module. Its alpha designation permits inclusion in v2.0.0 while broader campaign testing continues; it does not waive privacy, data-preservation, or safe sheet-write checks.

The six Almanac systems are independently toggleable and remain useful without hidden prerequisites. They exchange optional context through explicit APIs and semantic events, preserve valid settings while disabled, and keep fictional chronology separate from real-world GameAssist timestamps. RestAlmanac is the only initial Almanac sheet writer and supports verified official 2014 PC fields through preview, revalidation, confirmation, and rollback safeguards.

### 17.3 Later Candidate: Compatibility-First Bridge Character Sheet

Bridge character-sheet work remains deferred behind the Roll20 v2.0.0 baseline and the subsequent Foundry edition. If resumed, the separate sheet project should:

* preserves existing GameAssist command behavior,
* exposes reliable attributes for linked-token modules,
* defines clear NPC, HP-formula, save-bonus, and roll-template contracts,
* avoids requiring another broad GameAssist kernel rewrite.

This is a separate project and is not implemented in v2.0.0.

### 17.4 Planned GameAssist Work

1. **v1.8.0 — Module Identity Migration:** completed through Issue #60 and PR #63 with canonical CritAssist, NPCAssist, ConcentrationAssist, and HPAssist names, migration-safe state and handout handling, and retained command aliases.
2. **v1.8.1 — NPCAssist Bloodied Alerts:** completed through Issue #64 and PR #73 with a GM-private crossing notification and one-click Control Center toggle.
3. **v1.8.2 — Progressive NPC Naming:** completed through Issue #65 and PR #74 with page-local duplicate avoidance based on the tokens present when a new eligible NPC is added.
4. **v2.0.0 — EffectAssist, HealAssist, AttackAssist, AlmanacAssist Alpha, and Shared Health Integrations:** release preparation in PR #81. EffectAssist includes the source-aware 2014-sheet foundation and the Issue #88 player-casting/GM-workflow repair checkpoint. Issue #84 adds guarded healing through HealthService, and Issue #87 adds guided official-2014 repeating attacks without damage automation. AlmanacAssist includes Time, Climate, Astronomy, Weather, Environment, and Rest together under **Alpha Testing**. Issue #86 adds optional GM-private PC threshold notices through HealthService. Release checks distinguish accepted workflows, alpha findings, and untested cases.
5. **Post-v2.0.0 Deferred Backlog:** revisit EffectAssist refinements, older TokenAssist parity work, CombatAssist integrations, and other deferred features after the combined release is stable.

The public [development roadmap](ROADMAP.md) carries the detailed gates and issue links. Planned release labels describe sequence, not promised dates.

### 17.5 Explicit Non-Goals for v2.0.0

* No implicit queueing of every command or event.
* No claim that the watchdog can kill running work.
* No automatic deletion of unexpected state branches.
* No guaranteed external dependency discovery.
* No complete state import/restore.
* No 2024-sheet or third-party-sheet modifier writes.
* No automatic effect application, concentration change, or recipient inference from spell-card text; supported official 2014 Bless cards create private GM proposals only.
* No automatic concentration roll or concentration-ending decision inferred from HP loss; supported decreases may offer a private check that an authorized player or GM must choose.
* No automatic effect expiration from rounds, turns, real time, or fictional TimeAlmanac advancement; verified CombatAssist and TimeAlmanac boundaries create GM review candidates only.
* No 2024 native Effect writes without a documented Roll20 contract.
* No WildShape or token-representation interoperability guesswork.
* No automatic environmental penalties, weather-driven marker changes, or unverified class-resource rest writes.
* No automatic attack damage, HP changes, resource spending, effect or condition changes, or Turn Tracker movement from AttackAssist.
* No 2024-sheet or NPC-action AttackAssist adapter until Roll20's corresponding attack contracts are separately documented and tested.
* No plugin loader or native Mord-sheet implementation.

---

## 18 · Changelog <a id="18-changelog"></a>

### v2.0.0 – Gameplay and Campaign Foundations

* AlmanacAssist 2.0.6 is designated **Alpha Testing** across its six included systems. The module remains optional and disabled by default; expanded campaign verification continues separately from GameAssist's release preparation.

* Advanced disabled-by-default EffectAssist to 2.4.2 with a focused six-effect launch catalog, direct GM casting, opaque short-lived player choices, direct recipient choices beneath each controlled caster, retained GM requests, player lockout, source and target records, dependencies, stacking, lifecycle, bounded history, bounded official 2014 Bless proposals, optional GM-reviewed duration candidates, and exact-evidence Guidance consumption with a retained manual path.
* Added `!GA-GM` / `!GA-DM`, `!ga-help`, and layered `!ga-nav` suite navigation; every module's primary Game Master screen now returns to the suite control center.
* Bless now coordinates its target marker, 2014-sheet `1d4` attack and save modifier rows, source concentration, overlap, and dependent cleanup.
* Warding Bond and Haste add their verified AC/save rows; all catalog entries distinguish automatic mechanics from assisted table steps.
* Preserves non-stacking projections across overlapping sources and removes only final EffectAssist-owned markers, conditions, concentration, and unedited sheet rows.
* Adds read-only audit, GM-bound one-use repair confirmation, identity-drift refusal, external-edit preservation, and post-write verification.
* Added disabled-by-default HealAssist 1.0.0 for supported official-2014 healing with exact roll and HP review, one-use confirmation, retained private placement requests, and verified HealthService writes.
* Advanced disabled-by-default AttackAssist to 1.0.1 for authorized official-2014 repeating attacks with stable row identity, direct native target choices beside each attack, private hidden-target requests, explicit roll modes, familiar character-attributed templates, and no automatic damage or combat-state changes.
* Added CORE:SEMANTICEVENTS for immutable versioned optional-integration contracts without persistence, replay, or implicit queueing.
* Advanced CombatAssist to 1.1.0 with immutable accepted encounter and turn-progression events, and added formal EffectAssist duration rules that consume those events or committed Almanac time without ending effects automatically.
* Added disabled-by-default AlmanacAssist 1.0.0 with independently controlled Time, Climate, Astronomy, Weather, Environment, and Rest systems in the same release candidate.
* Added four calendar profiles, editable Wayfarer calendars and holidays, regional climate inheritance, configurable moons and celestial events, continuity-aware weather, structured environment context, and transactional 2014-sheet rest previews.
* Advanced AlmanacAssist to 1.1.0 with persistent Wayfarer drafts, guided setup and preview, profile duplication, atomic activation, elapsed-time preservation, and one deliberate rollback point.
* Advanced AlmanacAssist to 1.1.1 by rejecting cancelled Roll20 queries, repairing profile-specific clocks, supporting feast periods that do not advance weekdays, restoring exact holidays and range-based seasons, and invalidating dependent dates when complete period replacement makes their old indexes unsafe.
* Advanced AlmanacAssist to 1.1.2 with the campaign's exact 460-day Wayfarer default: twelve named months, five intercalary festivals, the documented daily rhythm, and exact-match migration that preserves campaign-edited definitions.
* Advanced AlmanacAssist to 1.2.0 with a direct component manager, editable seasonal ranges, visible moon phases, focused role/help/status/audit aliases, clearer display-change confirmation, and a command-only reset that restores the saved draft without changing the active calendar or fictional time.
* Advanced AlmanacAssist to 1.3.0 with an action-first GM dashboard, direct advance and exact-date controls, announcement preview/audience/detail settings, one-step saved-Wayfarer selection, focused edit/copy/detail/recovery screens, and technical examples moved behind optional help.
* Advanced AlmanacAssist to 1.4.0 with ordinal Wayfarer Hours and named daily periods instead of AM/PM, announcement audience/heading/preset/field controls, an at-a-glance Climate screen, and compact Environment quick choices with focused customization and on-demand details.
* Advanced AlmanacAssist to 1.5.0 with Off/Descriptive/Detailed/Technical presentation, weather-owned current temperature, daylight/cloud-aware moon visibility, working deferred Wayfarer and Astronomy prompts, atomic calendar identity changes, valid clock resizing, and Standard/Heroic/Gritty/Custom rest-rule controls.
* Advanced ConfigUI to 0.2.5 with alphabetized service/module groups, compact human-readable nested configuration summaries, and wrapping controls while preserving complete configuration evidence in the versioned snapshot handout.
* Added optional GM-private PC health alerts that consume deduplicated HealthService events, combine enabled 50%, 25%, and 10% downward crossings, hide exact HP by default, and leave NPC policy with NPCAssist.
* Keeps every Almanac system useful through explicit fallbacks, preserves valid state while disabled, and separates fictional world time from real-world table timestamps and NPCAssist Session dates.

### v1.8.2 – Page-Local Progressive NPC Names

* Added `autoNumberNpcTokens`, enabled by default, for newly added linked NPC tokens on the Objects or GM layer.
* Keeps the unsuffixed represented-character name when available; otherwise uses the lowest available positive page-local suffix.
* Never renames existing tokens or represented characters and stores no sequence counter.
* Adds a one-click Control Center toggle, status visibility, configuration reference, and focused Roll20 tests.

### v1.8.1 – Private NPCAssist Bloodied Alerts

* Added `notifyBloodied`, enabled by default, to privately notify the GM when an eligible living object-layer NPC crosses from above half HP to half HP or below.
* Uses Roll20's previous/current HP transition as the complete rearm rule: remaining below half does not repeat, while healing above half permits a later crossing notice.
* Requires numeric HP and a valid positive maximum on the selected shared NPC HP bar; PCs, unlinked tokens, GM-layer tokens, deaths, invalid maxima, and HPAssist initialization transitions remain silent.
* Keeps Bloodied notices out of markers, death history, report buckets, Arc records, and public chat.

### v1.8.0 – Canonical Module Names and Migration Safety

* Renamed CritFumble to CritAssist, NPCManager to NPCAssist, ConcentrationTracker to ConcentrationAssist, and NPCHPRoller to HPAssist across runtime registration, state ownership, diagnostics, MECHSUITS tags, guide handouts, configuration, documentation, and One-Click metadata.
* Migrates valid saved branches to their canonical names before startup auditing while preserving valid destination values. Unknown or malformed legacy branches remain available for diagnosis.
* Preserves established commands, compatibility access, NPC history and Arc records, enabled settings, marker ownership, and one existing guide handout per renamed module.
* Adopts three-part project release numbering beginning with v1.8.0. Historical release identifiers and independent module versions remain unchanged.

### v0.1.7.0 – CombatAssist Encounter Flow

* Added disabled-by-default CombatAssist `1.0.5` as an optional layer over the native Turn Tracker, with deliberate lifecycle, guarded next/previous controls, authorized player End My Turn prompts, privacy-safe next-initiative confirmations, native round-counter support, turn timers, current-turn pings, and equal GM/DM control aliases.
* Added native round authority from one clearly named custom Round Counter, including conservative `+1` evaluation when CombatAssist moves that row to the top. Without a counter, exact one-row movement retains conservative complete-cycle counting; valid combatant additions, removals, initiative rerolls, and manual reordering preserve the current round and establish a fresh cycle.
* Added one-step recovery through a complete saved tracker checkpoint, revision-matched restore confirmation, and deliberate acceptance of the current native tracker without forcing a round-1 restart.
* Added GM-only setup and diagnostics plus configurable GM, public, GM-and-current-player whispers, or disabled turn announcements. Optional stale-safe timers support a bounded duration, deadline recipient, and up to five early reminders without advancing initiative. Optional native pings can identify the current token without recentering a map or changing token state, and hidden turns remain GM-only.
* Refined all eleven modules with compact navigation through their established prefixes, explicit read-only audits, and friendly unknown-command recovery. Substantial modules create or update one stable user-manual handout; brief modules keep complete guidance in chat.
* Advanced the module interaction contract so GM and DM role aliases open each module's actual Game Master screen; InitiativeAssist is `1.0.4`, CombatAssist is `1.0.5`, and WelcomeAssist is `0.1.4`.
* Preserved all existing tracker rows and fields; unreadable, stale, duplicate, off-page, closed, or malformed states stop with recovery choices instead of guessing.

### v0.1.6.1 – Private Initiative and WelcomeAssist

* Advanced InitiativeAssist to `1.0.1` and added case-insensitive `!Init-GM`, which presents the neutral roll controls and complete encounter roster only to the GM.
* Added disabled-by-default WelcomeAssist `0.1.0` with one health-gated automatic greeting per sandbox lifecycle, private preview/configuration, explicit public announcement, professional/built-in/custom/mixed modes, an included built-in greeting library, and up to ten double-weighted campaign greetings.
* Added bounded delay, header, default-text, and custom-list controls with HTML escaping and Roll20 chat-directive neutralization.
* Added deterministic InitiativeAssist and WelcomeAssist coverage; the focused Roll20 acceptance pass confirmed private `!Init-GM` delivery and WelcomeAssist startup behavior.

### v0.1.6.0 – Native Initiative Foundation

* Added toggleable `TurnTrackerService 1.0.0` as the single GameAssist authority for native Turn Tracker snapshots, compatibility page resolution, structural row classification, guarded writes, and observations.
* Added disabled-by-default `InitiativeAssist 1.0.0` with the case-insensitive `!Init-` namespace, mixed D&D 5E 2014/2024 modifier adapters, public player invitations, private-by-default NPC evidence, GM-layer NPC batches, selected-character rolling, a GM encounter roster with individual and batch controls, pre-tracker controlled-token discovery, player-specific choices, normal/advantage/disadvantage and bonus-die options, selective rerolls, encounter groups, and distinct Guide, Control Center, Status Summary, and detailed chat Review surfaces.
* Added `!Init-RR` to reroll each unique eligible PC and living NPC once while retaining custom rows, counters, objects, dead NPCs, mismatches, stale references, off-page rows, duplicate metadata, and unknown fields.
* Added Manager and Observer modes for deliberate coexistence with other initiative or combat tools.
* Kept round counting, turn advancement, timers, durations, current-turn visuals, and encounter lifecycle outside InitiativeAssist and deferred them to CombatAssist.
* Added compatibility diagnostics and a dedicated mixed-sheet local harness. The native tracker foundation passed its live checkpoint; the newest NPC-privacy, GM-layer, and selected-character additions remain in focused sandbox verification.

### v0.1.5.1 – DM-Configurable Table Time

* Added the GM-only `!ga-timezone` menu and `!ga-config timezone` entry point with common region buttons, validated custom IANA names, and a sandbox-default option.
* Added timezone visibility to `!ga-status` and ConfigUI.
* Applied the selected timezone to human-facing logs, status panels, configuration output, handout update times, concentration records, NPC death/revival history, bucket reports, Arc reports, and date-managed Session names.
* Advanced NPCManager to `1.3.0` and ConfigUI to `0.2.0`.
* Preserved absolute ISO event timestamps; changing the timezone changes presentation and future date boundaries without rewriting recorded instants.
* Added DST, midnight-boundary, reload-persistence, invalid-input, historical-rendering, and custom-Session retention tests.

### v0.1.5.0 – Integrated Token and Condition Architecture

* Added `[GAMEASSIST:CORE:MARKERSERVICE]` and exposed `GameAssist.MarkerService` as a toggleable core service.
* Centralized built-in/custom marker resolution, exact stored-tag fallback, structured reads, add/remove/toggle/set operations, numbered markers, duplicate handling, and observations.
* Migrated NPCManager, ConcentrationTracker, and DebugTools away from chat-generated TokenMod requests.
* Removed standalone TokenMod dependency gating from bundled marker consumers.
* Added service dependency safeguards: disabling MarkerService first disables its dependent modules and leaves unrelated GameAssist modules available.
* Added `[GAMEASSIST:MODULES:CONDITIONASSIST]` and advanced the unreleased `GameAssist.ConditionAssist` to 1.0.1 with guided `!condition` menus, accurate active-condition recognition, a GM current-page condition/marker status roster, case-insensitive `!cond-<condition>` quick references, 2014/2024 SRD wording profiles, campaign-custom descriptions, built-in/custom marker artwork, verified marker-toggling public/player-whisper announcements, add/remove/toggle actions, configurable definitions, and guarded player permissions.
* Added validated, non-destructive migration from `state.STATUSINFO`, bounded ConditionAssist import/export, protected configuration maps, standalone StatusInfo warnings, and numbered/custom marker support through MarkerService.
* Added `[GAMEASSIST:MODULES:TOKENASSIST]` and exposed `GameAssist.TokenAssist` 1.0.1 with `!token-assist` and `!ta`/`!ta-*` commands, common token/bar/aura/vision/light/movement/report operations, explicit-ID authorization, legacy configuration import, and token-change observation.
* Pinned TokenAssist's TokenMod reference to release `0.8.88`, Roll20 repository commit `9d634d3149985dcf10333920b3f4c41f215f39fc`, and blob `fc6c9cb45ec2f2ee254a24f849e089507a0e610a`; preserved the applicable MIT notice and no-endorsement boundary.
* Routed every TokenAssist status-marker command through MarkerService; kept older `!token-mod` syntax temporarily during v0.1.x, left that syntax to standalone TokenMod when detected, and kept TokenAssist commands available.
* Fixed aura acceptance examples to set a visible radius, color, and circle shape; normalized aura option aliases and prevented movement trails from reconnecting to stale pre-command origins.
* Preserved compatible settings from earlier v0.1.5.0 development builds while leaving malformed or unrelated unknown state available for the warning-only auditor.
* Advanced NPCManager to `1.2.1`, adding a separate preview/confirm marker-repair command while keeping audits read-only; ConcentrationTracker and DebugTools remain at `0.2.0`.
* Preserved existing module commands, configuration keys, death history, concentration runtime data, and unrelated token markers.
* Completed integrated-architecture stabilization, upgrade verification, documentation review, artifact verification, and final Roll20 sandbox acceptance under Issues #28 and #29.

### v0.1.4.7 – Standalone TokenMod and StatusInfo Interoperability

* Added contract-aware TokenMod detection using its public observer interface and `API_Meta` version record before falling back to Roll20's script list.
* Routed NPCManager and ConcentrationTracker marker requests through TokenMod's documented `--api-as` path, removing any GameAssist requirement for `players-can-ids`.
* Added delayed marker-result verification with an actionable direct TokenMod command when the requested state is not reached.
* Preserved mutation through standalone TokenMod so StatusInfo continues receiving TokenMod observer notifications.
* Added TokenMod and optional StatusInfo version/configuration evidence to `!ga-status --details`.
* Advanced NPCManager to `1.1.1` and ConcentrationTracker to `0.1.0.6`.
* Prevented NPCHPRoller auto-roll-on-add token setup from creating a false NPC death/revival pair while preserving later genuine HP transitions.

### v0.1.4.6 – DM-Readable System Status

* Rebuilt `!ga-status` around overall health, enabled-module posture, current-sandbox errors, and plain-language dependency guidance.
* Added `!ga-status --details` for session counters, queue state, average queued-task time, last activity, and the qualified internal event-hook count.
* Removed the malformed `N/Ams` duration display; unavailable duration now appears as `N/A` with an explanation.
* Added direct buttons for troubleshooting details, module status, metrics, and settings.
* Kept `unverifiable` dependencies non-fatal and explained the appropriate manual marker check.

### v0.1.4.5 – NPCManager Death History and Report Management

* Added Campaign, Chapter, Section, and Session death-history buckets with one handout per named bucket.
* Advanced NPCManager to `1.1.0` with default Arc deduplication, deliberate duplicate override, removal controls, and last-addition undo.
* Added selected-only and nested hierarchical clear choices.
* Added date-managed Session rollover before NPCManager activity.
* Added the `!NPC-WR` report writer and “new Section from current Session” workflow.
* Rebuilt `!npc-death-report --help` as the central NPCManager guide.

### v0.1.4.4 – DM-Facing Help and Audit Readability

* Separated the CritFumble quick reference, guided Natural 1 menu, and player picker.
* Grouped NPC death-audit results, stated audit scope and PC exclusion, and moved detailed mismatch rows to a handout.

### v0.1.4.3 – Concentration Marker Recognition

* Resolved custom marker display names to the exact tags Roll20 stores on tokens.
* Preserved literal lowercase built-in marker ids such as `dead`.
* Made `!concentration --status` report unrecognized marker configuration clearly.
* Sent resolved marker tags to TokenMod for concentration add/remove/teardown requests.
* Preserved standalone TokenMod as the v0.1.4.x marker-mutation dependency.
* Added focused concentration-marker checks to `Smoketest.md`.

### v0.1.4.2 – Diagnostic and Migration Readiness

* Added conservative state self-healing for known module branches.
* Preserved valid existing configuration during repairs.
* Kept unknown state branches warning-only; added explicit `!ga-config cleanup`.
* Added public opt-in `GameAssist.enqueue(task, options)`.
* Clarified queue timeout and watchdog limits.
* Added confirmed/missing/unverifiable dependency reporting.
* Added versioned configuration-only snapshots through `!ga-config list`.
* Expanded `!ga-status` with configured/running/skipped counts and dependency warnings.
* Documented `!npc-death-clear`, `!npc-death-audit`, `autoHide`, `hideLayer`, `dependsOn`, and command matching options.
* Preserved normal direct event execution and the six bundled module implementations.

### v0.1.4.1 – MECHSUITS and Stability Foundation

* Established v0.1.4 as the behavioral baseline for the stability release.
* Incorporated selected fixes from unreleased v0.1.5 development.
* Hardened shared utilities, marker handling, timestamps, state/runtime helpers, and lifecycle behavior.
* Preserved Roll20’s captured native `on` strategy.
* Structured the executable file around MECHSUITS v1.5.2 requirements.

For the current verification checklist, see `Smoketest.md`.

---

## 19 · Glossary <a id="19-glossary"></a>

* **API Command**
  A chat message beginning with `!` that a Roll20 Mod/API script can handle, such as `!ga-status`.

* **Command Boundary**
  The rule that a command must end or be followed by whitespace. It prevents `!ga-status-extra` from accidentally matching `!ga-status`.

* **Command Handler**
  A function registered through `GameAssist.onCommand(...)` to respond to an API command.

* **CombatAssist**
  GameAssist's optional encounter-flow module. It deliberately starts, pauses, resumes, observes, advances, and ends round tracking without replacing Roll20's native Turn Tracker.

* **Configured Module**
  A module whose stored `enabled` configuration is not false. It may still be stopped if initialization failed or a dependency is missing.

* **Confirmed Dependency**
  A dependency GameAssist could positively identify as available.

* **Configuration-Only Snapshot**
  The versioned handout produced by `!ga-config list`. It excludes runtime caches and metrics and cannot currently be imported.

* **Direct Handler**
  A normal command/event handler that runs immediately rather than being placed on the explicit queue.

* **Event Handler**
  A function registered through `GameAssist.onEvent(...)` that responds to a Roll20 event, such as a token HP change.

* **Explicit Queue**
  The serialized task queue used only when code calls `GameAssist.enqueue(...)` or performs a module lifecycle transition.

* **Kernel**
  The shared GameAssist core that manages registration, lifecycle controls, metrics, state helpers, dependency diagnostics, logging, and the explicit queue.

* **Marker**
  A Roll20 token status icon or named status entry, such as `dead` or `Concentrating`.

* **MECHSUITS**
  The project’s human-readable, assistant-ready code-structure standard. It governs banners, framed sections, nesting, contracts, update notes, and whole-section replacement.

* **Missing Dependency**
  A dependency GameAssist could confirm is absent. Dependent modules are skipped or refused enablement.

* **Module**
  A self-contained GameAssist feature registered with a unique name, initializer, metadata, and optional teardown.

* **Persistent State**
  Data under `state.GameAssist` that survives API sandbox reloads.

* **Roll-Table / Rollable Table**
  A Roll20 table containing weighted outcomes. CritFumble rolls named tables to produce results.

* **Running Module**
  A module that is initialized and active in the current sandbox.

* **Runtime Cache**
  Module-owned operational data stored under `state.GameAssist.<Module>.runtime`. Runtime data is excluded from configuration snapshots.

* **State Self-Healing**
  Conservative repair of missing or malformed containers for known module branches. It does not delete unknown branches or infer arbitrary data.

* **Teardown Function**
  An optional function called during module disablement to perform module-specific cleanup.

* **TokenAssist**
  GameAssist's general token-control module. It uses `!token-assist` and `!ta`/`!ta-*` commands and delegates status-marker behavior to MarkerService.

* **TurnTrackerService**
  GameAssist's shared authority for reading, observing, and guardedly writing Roll20's native Turn Tracker while preserving rows and fields it does not own.

* **Unverifiable Dependency**
  A dependency whose presence GameAssist could not confirm because Roll20 did not expose enough metadata. GameAssist warns and proceeds.

* **Watchdog**
  A periodic observer for the explicit queue. It can release stalled queue state but cannot terminate running JavaScript or Roll20 operations.


---

## 20 · Licensing and Attribution <a id="20-licensing-and-attribution"></a>

Original GameAssist code is developed and maintained by Mord Eagle under the MIT License in [`LICENSE`](LICENSE). Third-party credits, source references, and required license notices are preserved in [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) and the executable source.

### MarkerService

`GameAssist.MarkerService` provides the shared marker mechanics used by GameAssist. Its compatibility goals were informed by TokenMod's established Roll20 marker behavior.

### Token and Condition Credits

**TokenAssist** builds on token-control concepts established by **TokenMod 0.8.88**, created by **The Aaron, Arcane Scriptomancer**. **ConditionAssist** builds on condition-menu and marker-description concepts established by **StatusInfo**, created by **Robin Kuiper**. GameAssist preserves the applicable MIT notices and exact source references in [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md).

ConditionAssist includes condition wording derived from SRD 5.1 for the 2014 profile and SRD 5.2.1 for the 2024 profile under the Creative Commons Attribution 4.0 International License. It does not reproduce non-SRD sourcebook text.

See [`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) for public acknowledgments, upstream links, license notices, and SRD guidance.

> **Tip:** After an update, use the current smoke test to confirm the enabled features in the campaign's own Roll20 sandbox.
