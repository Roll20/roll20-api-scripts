# Changelog

All notable changes to GameAssist are documented in this file.

This changelog is intentionally detailed. It records not only visible features, but also implementation locations, replaced behavior, design rationale, compatibility boundaries, state/migration effects, verification evidence, exclusions, and rollback posture. Line references describe the named release artifact and may move in later revisions; MECHSUITS section names are the more stable long-term locator.

---

## v2.0.0 Shared HP, Marker Arithmetic, And Rest Transaction Repairs - 2026-08-28

- **InitiativeAssist 1.0.8:** Reads NPC health from HealthService's current Bar 1, Bar 2, or Bar 3 selection for roster classification, individual initiative rolls, and rerolls. The configured field is re-read at execution time; PC eligibility, death-marker mismatches, custom tracker rows, and non-target priorities retain their prior behavior.
- **MarkerService 1.1.2:** Preserves the signed result of relative marker arithmetic before truncation and minimum/maximum clamping. Subtracting below zero now reaches the configured lower bound instead of becoming a positive count through absolute-value conversion.
- **AlmanacAssist 2.0.6:** Consumes a validated rest grant immediately before the first sheet write. Failed sheet or fictional-time transactions keep best-effort rollback, create no completion record, offer a fresh preview, and cannot reuse HealthService's cached apply operation to report an unapplied retry as successful.
- Adds focused local regression coverage for Bar 1/2/3 NPC classification and actual rerolls, signed marker expressions through MarkerService and TokenAssist, rest rollback, permission and stale-preview refusal, failed and successful one-use grants, restart preservation, and fresh-operation retries.
- Keeps GameAssist at v2.0.0. Existing commands, saved HP-bar settings, Almanac schemas, unrelated modules, One-Click metadata, and archived releases are unchanged.

---

## v2.0.0 Module Reactivation And Token Colors - 2026-08-28

- **CombatAssist 1.2.2:** Turning the module off and back on restores native turn tracking, combat HP history, its public API, and eligible turn timers without a sandbox restart. The saved encounter is checked against the current tracker before continuing; missed movement requires review rather than guessed turns or rounds.
- **InitiativeAssist 1.0.7:** Re-enabling restores its tracker observer while preserving saved groups. Both tracker modules also recover after TurnTrackerService is disabled and re-enabled in dependency order.
- **Module lifecycle:** Adds a dedicated reactivation callback for resources removed during shutdown. Existing chat and event handlers remain registered once, preventing duplicate behavior across repeated toggles.
- **TokenAssist 1.3.1:** Fixes relative tint and aura color changes that failed with `clamp is not defined`. Color channels remain bounded and existing alpha values are preserved.
- Updates the affected module versions, developer contracts, and focused smoke tests. The package remains v2.0.0; unrelated modules, commands, saved configuration, and archived releases are unchanged.

---

## v2.0.0 Launch Copy And Healing Defaults - 2026-08-28

### Testing Status And One-Click Presentation

- Designates **GameAssist v2.0.0 as Beta Testing**, with **AlmanacAssist 2.0.5 in Alpha Testing**. These current designations supersede the earlier Almanac-only beta disclosure; previous dated entries remain historical records.
- Rewrites the One-Click listing for prospective GMs. Removes already-satisfied access requirements, separate-player-install explanations, mandatory smoke-test steps, implementation-oriented safety summaries, generated-handout details, and legacy-macro migration prose. Reference and testing material remain in dedicated documentation.
- Describes module benefits without implying a shared existing Mod setup. Keeps practical overlap notes, the CritAssist table requirements, supported-effect distinctions, and AttackAssist's current limits.
- Removes the named Wayfarer template and unproven travel claims from the Almanac summary. Describes custom calendars and separately controlled systems without claiming complete travel acceptance.
- Clarifies that 2024 character support is limited and feature-dependent, with broader support planned. WelcomeAssist describes manual and startup greetings without promising detection of each new game session.
- Retains ASCII Markdown, all 622 command entries, the legacy-version selection, and attribution links. Corrects the report link and DebugTools emphasis and identifies DebugTools as intended for power users.

### HealAssist 1.2.2

- Changes `autoApply` from `false` to `true` for new configurations. After a supported action and recipients are selected, HealAssist rolls once and applies verified HP changes without requiring an additional review click.
- Retains the GM's **Require Review** option through the control screen or `!Heal-Auto off`. Existing saved boolean choices are preserved, including configurations that previously saved `false`; malformed saved values still use review-first behavior. `!Heal-Auto on` enables automatic application in an existing campaign.
- Keeps permission checks, private GM placement for hidden/NPC recipients, maximum-HP limits, stale-data rejection, one-use proposals, private failure notices, and verified rollback behavior unchanged. Automatic application does not spend spell slots, inventory items, or class resources.
- Updates the module contract, inline rationale, manual, current version references, and focused healing checks. Historical executable versions and unrelated runtime sections are unchanged.

---

## v2.0.0 One-Click Listing Layout - 2026-08-28

- Replaces the second introductory paragraph with a compact **At a Glance** summary of modular controls, integrated tools, native Turn Tracker use, and guided workflows.
- Highlights the home, help, and navigation commands in a short **Start here** callout. Command capitalization and space/hyphen guidance appears separately below it.
- Gives documentation, installation testing, and support links their own labeled lines for easier scanning.
- Preserves the AlmanacAssist Beta Testing notice, module descriptions, requirements, compatibility limits, all 622 commands, and legacy-version selection. The metadata remains ASCII-only; executable code and the GameAssist v2.0.0 version are unchanged.

---

## v2.0.0 One-Click Launch Metadata - 2026-08-28

### Listing And Compatibility

- Rebuilds the One-Click description around the fifteen current modules, a short installation path, practical examples, common commands, and module-specific sheet limits. The complete 622-entry command inventory remains in `script.json`.
- Uses 7-bit ASCII for the stored metadata and parsed description. Markdown headings, emphasis, links, lists, and callouts remain; raw emoji and typographic punctuation are removed from the One-Click surface to avoid the observed character-encoding corruption. The README retains its existing presentation.
- Prominently identifies AlmanacAssist 2.0.5 as **Beta Testing**, optional, and disabled by default. The notice covers its six systems without labeling the whole suite beta.
- Explains the integrated token/condition tools, supported 2014-sheet automation, limited 2024 initiative support, manual attack consequences, tracking-only effects, and practical overlap with other Mods.

### Selected Legacy Builds

- Adds the distinct historical milestones **0.1.5.1**, **0.1.6.1**, **0.1.7.0**, and **1.8.2** to the launch selection alongside already-published **0.1.4.7**, **0.1.1.2**, **0.1.1.1**, and **0.1.1.0**. Their original version identifiers are preserved.
- Omits unpublished intermediate patches **0.1.5.0**, **0.1.6.0**, **1.8.0**, and **1.8.1** from the One-Click selector; their archived files and release history remain unchanged in this repository.
- Documents version-directory packaging and exact source-copy verification. Existing Roll20 version directories must remain unchanged rather than being replaced with local historical copies.
- Warns that selecting older code does not roll back persistent campaign data and that configuration snapshots are not full-state backups. Historical releases retain their own commands and dependency requirements.

### Preservation

No executable, module version, default setting, saved-state contract, command identifier, authorship, or license term changes. The package remains GameAssist v2.0.0 with `GameAssist.js` as the uniform release filename. Local validation and preview remain distinct from the live One-Click display and Roll20 submission review.

---

## v2.0.0 Documentation Reconciliation - 2026-08-28

### AlmanacAssist Beta Testing

- Designates AlmanacAssist 2.0.5 as **Beta Testing** for inclusion in GameAssist v2.0.0. The designation covers Time, Climate, Astronomy, Weather, Environment, and Rest, including their calendar, location, travel, and world-setup interfaces. It applies to AlmanacAssist rather than labeling the entire suite beta.
- Places the notice at the beginning of the README, in the Almanac module guide and API reference, and in the roadmap and smoke-test sections. AlmanacAssist remains optional and disabled by default; no configuration or activation behavior changes.
- Separates the beta baseline from the expanded graduation track. Broader campaign and upgrade coverage continues without requiring every beta workflow to be declared complete before inclusion. Privacy leaks, sandbox crashes, data loss, and unsafe writes remain release blockers.
- Records the 2026-08-27 live-use report as support for beta testing, not as a completed case-by-case full acceptance inventory. The grouped local sweep passed 18 runs, including the focused Almanac checks and cross-module interactions; these results remain distinct from live Roll20 evidence.

### Version And Workflow Corrections

- Aligns current developer references and attribution component versions with MarkerService 1.1.1, ConditionAssist 1.0.5, TokenAssist 1.3.0, InitiativeAssist 1.0.6, CombatAssist 1.2.1, and HealthService 1.1.1. Historical release entries retain the versions they originally described.
- Clarifies that supported `!token-mod` commands remain deprecated compatibility aliases in v2.0.0. New macros should use TokenAssist commands; removal requires a separately announced migration release. This changes documentation only and does not remove or alter an alias.
- Updates the TokenAssist attribution summary to reflect implemented marker expressions, attribute reports, controller editing, relative visual controls, and multi-sided selection. Persistent image/default-token writes remain excluded, and no global TokenMod object or complete upstream compatibility is claimed. Original author, pinned-source, MIT, and SRD notices are preserved.
- Corrects smoke-test expectations for the current AttackAssist roll-choice controls, direct target selection, MarkerService and HealthService versions, and EffectAssist's direct-apply versus optional-review behavior. The tests no longer require obsolete labels or a review screen that is disabled by default.
- Clarifies release-candidate installation and retains the agreed Roll20-first, Foundry-next sequence. The README does not imply that the candidate is already available through One-Click.

### Preservation

The executable files, public commands, saved-state contracts, module versions, package metadata, and license terms are unchanged. All three v2.0.0 script copies remain byte-identical to the regression-reviewed build. This entry adds to the historical ledger without replacing earlier release notes or their recorded verification status.

---

## Release Ledger

| Revision | Status | Role |
| --- | --- | --- |
| **v2.0.0** | Active development in PR #81; focused EffectAssist, HealAssist, AttackAssist, player-casting, cast-recognition, duration, AlmanacAssist, HealthService, PC health-alert, concentration-offer, and suite-navigation checks are included; Roll20 acceptance pending | Source-aware effects, guarded Guidance consumption, guided verified healing and attacks, secure player workflows and retained GM requests, bounded 2014 Bless proposals, complete campaign-world systems, canonical HP evidence, GM-private PC health bands, private HP-loss check offers, and unified GM/help navigation |
| **v1.8.2** | Merged through PR #74; Issue #65 closed | Page-local progressive NPC token naming |
| **v1.8.1** | Merged through PR #73 | GM-private NPCAssist Bloodied threshold alerts and Control Center toggle |
| **v1.8.0** | Merged through PR #63; 712 automated checks passed | Canonical module identities and migration-safe project version transition |
| **v0.1.7.0** | Accepted after automated verification and live Roll20 smoke testing | Preservation-first encounter, turn, and round flow |
| **v0.1.6.1** | Merged; focused Roll20 acceptance passed | GM-private initiative start and optional table greetings |
| **v0.1.6.0** | Automated verification passed; Roll20 sandbox acceptance pending | Native Turn Tracker service and mixed-sheet initiative workflows |
| **v0.1.5.1** | Focused Roll20 timezone acceptance passed; complete manual module smoke not rerun | DM-configurable table time and NPC Session-date alignment |
| **v0.1.5.0** | Accepted release candidate; Issues #25-#29 and #32 complete | Integrated marker, token, and condition architecture |
| **v0.1.4.7** | Stable release; automated and Roll20 sandbox verification passed | Standalone TokenMod and StatusInfo interoperability |
| **v0.1.4.6** | Merged release | DM-readable system health and troubleshooting status |
| **v0.1.4.5** | Merged release | NPC death-history buckets, handouts, and arc notes |
| **v0.1.4.4** | Merged release | DM-facing CritFumble help and NPC death-audit readability update |
| **v0.1.4.2** | Release candidate; automated verification complete, Roll20 smoke confirmation pending | Diagnostic and migration-readiness release |
| **v0.1.4.1** | Preserved rollback baseline | Stability-first repair of the uploaded v0.1.4 baseline |
| **v0.1.4** | Uploaded stable-but-limping baseline | Source used to build v0.1.4.1 |
| **Attempted v0.1.5** | Failed upgrade; never released | Review source for selected fixes only |
| **v0.1.3** | Prior development milestone; supplied notes retained below | Core lifecycle, metrics, helper, and module-hardening work |
| **v0.1.2** | Historical release | Roll20 packaging and initial MECHSUITS structural wrap |
| **v0.1.1.2** | Historical release | CritFumble natural-1 bugfix |
| **v0.1.1.1** | Historical release | Quiet startup and logging improvements |
| **v0.1.1.0** | Initial public release | Original four-module framework |

### Release-history notes

- v0.1.4.2 requires Roll20 API sandbox smoke confirmation before it should be used as a confirmed table build.
- v0.1.4.1 remains available as the rollback script during v0.1.4.2 confirmation.
- The attempted v0.1.5 file was not imported wholesale. Its unsafe or structurally unreliable changes were rejected; only isolated reviewed ideas were ported.
- Older supplied notes used “Unreleased” and “Staging” labels for v0.1.3–v0.1.5 work. Those records are retained below as historical development evidence rather than silently discarded.
- Where the supplied historical record did not establish a release date, this changelog does not invent one.

---

## [2.0.0] – 2026-07-28

### Release definition

GameAssist v2.0.0 remains one active development line in PR #81. EffectAssist 2.5.4 coordinates the focused official-2014 effect catalog with compact caster choices, exact duplicate disambiguation, concentration-linked cleanup, retained GM requests, bounded Bless proposals, guarded Guidance consumption, worker-safe projections, and optional duration review. HealAssist 1.2.1 provides guided normal or maximum healing with direct single-recipient targeting, review, and optional verified automatic application. AttackAssist 1.1.0 provides compact official-2014 repeating-attack selection, prompt-safe Classic-sheet materialization, native visible targeting, immediate sheet-setting submission by default, optional roll-mode review, visible one-use sheet rolls, and no automatic attack consequences. TokenAssist 1.3.0 retains longest-name-first aliases, an organized action library, advanced MarkerService expressions, controller/report routing, computed reports, relative visual controls, multi-sided selection, and duplicate-install protection. AlmanacAssist 2.0.1 completes the campaign-scale GM palettes and reviewed travel layer on the consolidated Issue #95 campaign-world engine described below. HealthService 1.1.1 provides the canonical supported HP observation/write boundary and shared NPC HP-bar controls. ConcentrationAssist 0.6.0 uses that evidence for optional private check offers. CombatAssist 1.2.1 supplies accepted encounter progression, native round-counter handling, timers, pings, recovery, held actions, and optional integrations without replacing Roll20's Turn Tracker. Shared SemanticEvents remain immutable, in-sandbox, and non-replayed.

EffectAssist, HealAssist, AttackAssist, and AlmanacAssist start disabled so existing campaigns upgrade without receiving new markers, conditions, HP writes, other sheet writes, attack rolls, fictional chronology, weather, or chat output until the GM deliberately enables them.

### Release records and platform sequence - 2026-08-26

- Restores the v2.0.0 command, roadmap, and focused smoke-test records for `!ga-sheets`, `!ga-handouts`, TokenAssist 1.3.0 expansion, CombatAssist health evidence, Ready/Delay controls, and the optional NPCAssist encounter-summary handoff. The executable behavior was already present; this checkpoint returns the public release records to that same scope.
- Records SheetCapabilities 1.0.0, TokenAssist Issues #42-#44, CombatAssist Issues #52, #53, and #56, and the supported portion of handout Issue #72 as implemented pending their focused Roll20 verification rather than future work.
- Retains persistent image/default-token writes (#45), API_Meta-style diagnostics (#50), Jukebox hooks (#57), and broad EffectAssist catalog expansion (#82) outside the v2.0.0 gate.
- Defines Roll20 v2.0.0 as a bounded campaign-scale release. Its editable world definitions and WorldPacks must remain within Roll20 Mod sandbox limits; a full atlas-scale content architecture is not a Roll20 release requirement.
- Sequences the Foundry edition after Roll20 v2.0.0 live acceptance and stabilization. It will be a Foundry-native sister implementation with its own codebase and release history, beginning with AlmanacAssist and atlas-scale WorldPack storage rather than a concurrent or line-by-line port.
- No executable behavior, saved state, commands, or module versions change in this documentation and metadata checkpoint.

### AlmanacAssist 2.0.5 layered weather setup and menu repair - 2026-08-27

#### Selection controls and navigation

- Repairs the Current Settings selection path that could report "Choose a baseline from the list" after a button click. Climate, ecoregion, and location lists now send numbered choices with a current-settings check instead of embedding quoted identifiers. Almanac's button adapter also defers double quotes through the chat-link HTML boundary. Existing direct commands and identifiers are preserved.
- Rebuilds Current Settings around **Choose Climate**, **Choose Biome**, **Ecoregion Starters**, **Local Details**, **Seasons**, **Weather Breakdown**, **Generate Weather**, and named-location save/recall. Profile choices use their names as buttons, with at most eight choices per page. Calculation details are no longer repeated on every ordinary selection screen.
- Groups moon and event actions in **Moons & Events** and moves forecast/manual weather entry into **More Weather Controls**. Prepared forecasts show a short count and **View Forecast** instead of occupying the regular weather panel. **More Tools** separates scene controls, advanced world records, reusable definitions, system switches, and manuals.
- Refuses incomplete or malformed Current Settings arguments before mutation. Names with spaces and apostrophes are accepted; embedded double quotation marks receive an explanation instead of silently saving only part of the name.

#### Layered matrix and seasonal weather

- Exposes 17 climates and 16 biomes directly. The twelve ecoregion starters supply a biome/geography combination and local adjustments while retaining the GM's chosen regional climate.
- Adds independently replaceable optional layers: 12 geographies, 8 terrain choices, 5 outdoor environment choices, 8 hydrology choices, and 8 vegetation choices. Local Details shows the selected values and provides removal controls. Fine-Tune Values edits their four weather adjustments and supports explicit landscape descriptions with a return to layer-provided wording.
- Decomposes known earlier ecoregion totals into biome, geography, and residual adjustments without changing their combined effect. Each layer contributes once; reselection does not accumulate modifiers, and the older elevation/coast/biome calculation is not applied again. Existing custom influences are retained rather than inferred or discarded.
- Adds **Weather Breakdown** showing the climate baseline, individual local contributions, GM adjustments, season, and bounded final starting point. Generated weather still varies around those inputs, rather than promising the same condition on every roll.
- Makes seasonal responses directly editable from Current Settings. Named calendar seasons can use Cold, Mild Wet, Warm, Cooling, Rainy, Dry, or Little Seasonal Change, or four custom adjustments. Shared response changes require confirmation; unknown seasons are flagged rather than assigned an invented meaning. Temperature response strength is visible, and forecasts resolve the season on their own future dates.
- Keeps the matrix a bounded tabletop approximation. Environment layers describe outdoor exposure and shelter; indoor weather and underground microclimates require an explicit GM override. No terrain penalties, character writes, or automatic time advancement are introduced.

#### Saved data and verification

- Extends schema-1 settings with optional validated layers and description overrides. Saved places retain independent copies of the complete setup; reusable local profiles retain their layers without copying the regional climate or extra GM adjustments. Existing snapshots without these fields remain readable.
- Includes the expanded setup in WorldPack export/import. The depth limit increases from eight to ten levels for nested layer/tag records; byte, object-count, unsafe-key, reference, and schema checks remain in place. Malformed imports produce no partial writes.
- Preserves weather locks, manual environment overrides, calendar chronology, unrelated module behavior, and all previous changelog entries. AlmanacAssist advances from 2.0.4 to 2.0.5; the project remains GameAssist v2.0.0.
- Adds local browser HTML-boundary checks for every matrix choice, plus layer replacement, seasonal generation, future-date forecasts, stale controls, custom profiles, location recall, imports, permissions, and restart checks. The local HTML converter is not Roll20's renderer; live acceptance remains documented under **Current Settings And Location Recall** and **Local Layers And Seasonal Influence**.

### AlmanacAssist 2.0.4 Current Settings and location snapshots - 2026-08-27

#### Direct weather setup

- Adds **Current Settings** to the Almanac GM home screen, with the direct case-insensitive command `!aa current` / `!aa-current`. The GM chooses a regional climate baseline, one local influence profile, and optional adjustments without first constructing regions, ecoregion areas, or linked geography and biome definitions.
- Adds a twelve-profile influence matrix using the existing named ecoregion starters. Each entry exposes temperature, humidity, precipitation-chance, and wind adjustments. Switching profiles replaces those values rather than repeatedly accumulating modifiers.
- Adds button-driven numeric and text editors for baseline values, local influences, separate GM adjustments, terrain, ground, water, and vegetation. Edited local profiles can be saved under a unique name for reuse with other baselines. Working edits do not silently alter shared profiles or previously saved places.
- Routes the resulting settings through the existing weather generator and SceneResolver. Seasonal responses use the current or forecast date; matrix influences are applied once, without adding the linked-world elevation, coast, biome, or local adjustments a second time. Unrelated prior weather contexts are not carried into the new setup.

#### Named places and preservation

- **Save Current Settings** can create a named active place or explicitly update the current saved place after confirmation. Each place stores a self-contained schema-1 settings snapshot, including baseline values, local influences, GM adjustments, descriptions, and local context.
- **Recall Location** restores that setup without advancing the calendar, restoring an old weather roll, or generating new weather automatically. It asks before replacing unsaved working changes and refuses a location switch during an active journey.
- Working settings survive module disabling and sandbox restarts. Confirmed discard restores the saved setup and retains one prior working copy. Saved-location updates and generated buttons are checked against the current settings so stale controls cannot overwrite newer edits.
- Existing locations, commands, profile definitions, runtime history, weather locks, and manual environment overrides remain available. The older linked-world palette is retained under **More Tools**; broad removal of older paths is not part of this change.

#### Transfer, validation, and user guidance

- WorldPack exports include saved location snapshots and reusable custom influence profiles, but exclude unsaved working settings. Import validates snapshot structure and local-time references before committing. A confirmed import replaces the working context, retains one recovery copy, and preserves runtime chronology and current weather.
- Explicit local-time assignments update the saved snapshot and matching working context together, preventing a recalled snapshot from masking the GM's assignment.
- Missing, malformed, out-of-range, cancelled, or stale inputs produce a private explanation without partially applying the requested change. Player requests cannot change settings or browse private location lists.
- Updates the in-game manual, README, command metadata, and focused smoke instructions for the new workflow. AlmanacAssist advances from 2.0.3 to 2.0.4; GameAssist remains v2.0.0 on PR #81.
- Verification exercises emitted commands, query answers, calculations, location isolation, permissions, stale controls, WorldPack transfer, module restart, and fresh script evaluation. These local checks do not establish live Roll20 button or query behavior; the **Current Settings And Location Recall** smoke tests cover that boundary.

### AlmanacAssist 2.0.3 palette buttons and location controls - 2026-08-27

#### Palette repairs

- Preserves palette change-check identifiers as text. Previously, an identifier containing only digits was converted to a number by argument parsing; an unchanged selection could then be rejected as stale. Quoted identifiers now retain leading zeros, and older unquoted buttons remain accepted when their original eight-character identifier can be recovered.
- Carries the chosen location through category, pagination, profile preview, and apply controls. A saved destination can receive a climate, biome, geography, or combined ecoregion profile before the party travels there.
- Preserves existing stale-choice checks, private GM permissions, current weather, and unrelated locations. Destination setup does not expose a misleading Generate Weather button for the party's different current location.

#### Location management

- Replaces the repeated current/prepared/favorite/recent/nearby overview with direct naming, one-prompt creation, and a paginated saved-place list. Travel lists and detailed settings remain separately accessible.
- Adds rename-only editing that preserves world context and does not reroll weather. New places start from the current physical setup rather than unrelated first entries in the saved collections; explicit invalid references and missing names are refused before creating a place.
- Keeps all saved location data. Unchanged starter labels are omitted from the ordinary scene hierarchy, and the starting placeholder is displayed as Unnamed Starting Place until named by the GM.
- Preserves explicitly empty prepared-destination lists instead of automatically repopulating them. The current place is omitted from destination, favorite, and recent choice lists to avoid repetition.
- Exposes the existing WorldPack handout workflow under Context and Notes for advanced JSON editing. Opening it does not write or replace a handout. No second location import format is introduced.
- Corrects active-region persistence when a confirmed location change is committed. Movement still requires a separate preview and confirmation and respects locked/manual weather.

#### Records and verification

- Advances only AlmanacAssist from 2.0.2 to 2.0.3; GameAssist remains v2.0.0. Updates its inline explanations, section history, manual, README, command metadata, roadmap, and live smoke instructions while retaining previous changelog entries.
- Adds focused local tests that follow emitted buttons, including an all-digit fingerprint regression, naming, creation, destination profile preparation, permissions, missing values, empty lists, pagination, and restart preservation. Local checks do not establish that the reported live Roll20 button problem is fully resolved; the updated click-through smoke tests remain required.

### AlmanacAssist 2.0.2 natural-world profiles and seasonal weather - 2026-08-27

#### Reusable world palettes

- Adds the natural-world profile libraries that were absent from the earlier live-session action palettes: 17 climate types, 16 biomes, 12 geographies, 12 combined ecoregion profiles, and seven seasonal responses.
- Adds `!aa-palette` and a direct **World Palettes** control on Almanac Home. Profile choices are paginated, previewable, and applicable to the current location without replacing current weather automatically.
- Separates reusable ecoregion profiles from named ecoregion areas, regions, subregions, and playable locations. A combined profile supplies climate, biome, and geography together; individual palettes allow independent choices.
- Provides editable campaign copies while retaining immutable starter definitions. Applying a different profile to one location preserves other locations, cloning a shared area when necessary. Editing a shared saved profile updates the places that still follow it.
- Replaces raw-ID prompts in related place editors with named choices. Region settings retain parent inheritance, explicit climate selection, local adjustments, and removal safeguards.

#### Weather behavior

- Generates from the current location's resolved climate, calendar season, elevation, coastal influence, biome wetness, and local adjustments instead of relying only on the global active-region setting.
- Maps Wayfarer's four named seasons to explicit responses. Custom names can choose Cold, Mild Wet, Warm, Cooling, Rainy, Dry, or Little Seasonal Change, or supply four bounded numeric adjustments. Unmapped names produce an actionable setup note rather than an inferred English-season meaning.
- Resolves forecasts against their future calendar dates, including season boundaries. Carries prior weather forward only within a compatible place and seasonal context.
- Prevents generated warm rain from persisting into a freezing context and snow from persisting into a warm one. Corrects fog selection order, keeps rain/cloud/visibility descriptions consistent, and avoids repeatedly accumulating local wind adjustments.
- Retains biome ground beneath weather overlays instead of replacing the terrain with generic firm ground. Clearly distinguishes a seasonal climate baseline from current weather and labels explicit GM environment overrides.
- Keeps locked weather protected and preserves manually entered weather on location changes. The GM can explicitly generate a replacement when unlocked.
- Documents the weather model as adjustable game defaults, including a simplified rain/snow threshold, rather than measured climate normals or planetary simulation.

#### Preservation and verification

- Checks stale location/profile choices and collection capacity before applying palette changes. Invalid or missing values cannot silently create a profile named `true`.
- Preserves campaign climate definitions whose identifiers overlap newly added starters. Adds dependency checks for reusable profiles and validates their WorldPack references before normalization.
- Extends existing schema-1 records with optional profile and seasonal fields; older valid packs remain accepted, and active chronology and runtime history stay outside imports.
- Updates the source inventory, module notes, inline explanations, manual, README, roadmap, commands, and focused Roll20 checks. GameAssist remains v2.0.0; AlmanacAssist advances from 2.0.1 to 2.0.2.
- Passes 195 focused non-live Almanac checks, including emitted-button routing, context-driven weather, seasonal boundaries, invalid input, stale choices, capacity failures, permissions, WorldPack references, module reinitialization, and a fresh sandbox evaluation with persisted state. Live Roll20 acceptance is still pending.

### AlmanacAssist 2.0.1 campaign palettes and reviewed mileage travel - 2026-08-26

#### Live-session controls

- Reorders `!aa-gm` around current conditions and the actions most likely to be used during play: weather generation, time/date advancement, travel, rest, astronomy, environment, events, announcements, location, and calendar controls.
- Keeps campaign definitions, transfer tools, diagnostics, system toggles, and full reference material behind the focused **More Tools** and Worldbuilding screens.
- Makes WeatherAlmanac show precipitation, temperature, wind, and visibility together, distinguishes generated weather from a GM environment override, and provides direct Generate/Regenerate, Forecast, Enter Weather, Announce, and Home actions.
- Adds a compact **Events and Omens** palette for weighted celestial prompts, travel encounter checks, and explicit campaign phenomena without presenting generated prompts as rules or encounter content.

#### Mileage travel

- Adds Slow (2 mph), Normal (3 mph), Fast (4 mph), and bounded custom pace choices with GM-entered mileage, encounter interval, and die size.
- Reviews travel duration, estimated arrival, current road and visibility guidance, and encounter-check volume before offering separate **Advance Time & Roll**, **Advance Time Only**, and **Roll Checks Only** actions.
- Derives advisory road wording from the authoritative current scene, including precipitation, temperature, ground, terrain, wind, and visibility, without silently applying movement penalties, damage, conditions, or token changes.
- Uses one check for every started interval. Rolls of 1-2 are Negative, the mathematical midpoint rounded up is Neutral, the die maximum is Positive, and other values are No encounter. A d4 therefore uses 1-2 Negative, 3 Neutral, and 4 Positive.
- Keeps encounter evidence GM-private, never selects creatures or event content, shows at most 40 individual results in chat, retains bounded history, and refuses plans above 200 checks before creating a review grant.

#### Safety and verification

- Binds each reviewed mileage plan to the current chronology, place, weather, environment, and road evidence. A changed scene, expired review, or reused button cannot advance time or roll checks.
- Preserves the established prepared-destination journey workflow, one base chronology, Worldbuilding definitions, Wayfarer and WorldPack transactions, phenomena, temporal contexts, and optional subsystem boundaries.
- Advances the AlmanacAssist module version from 2.0.0 to 2.0.1 while GameAssist remains the unreleased v2.0.0 candidate.
- Passes 157 focused non-live Almanac checks. Roll20 live acceptance remains required for chat layout, context prompts, private delivery, restart behavior, and end-to-end table use.

### AlmanacAssist 2.0 coherent world engine - 2026-08-26

This checkpoint implements Issue #95 on PR #81 without publishing v2.0.0 or claiming the unperformed Roll20 live gate.

#### Live-play and worldbuilding surfaces

- Advances AlmanacAssist from 1.6.1 to 2.0.0.
- Rebuilds `!aa-gm` as a compact Current World screen for place, coherent scene, common time/date actions, travel, rest, weather, announcements, location changes, and campaign quick actions.
- Adds a separate `!aa-world` workspace grouped into Places, Natural World, Local Context, Time & Sky, Gameplay, and Campaign Tools.
- Keeps routine session controls separate from definition lists, provenance evidence, transfer tools, diagnostics, and read-once instruction.

#### Chronology and scene authority

- Adds valid Year 0 dates through signed elapsed minutes while retaining Year 1 at minute zero, so existing saved campaign dates do not shift.
- Adds one immutable `SceneResolver` snapshot with field-level provenance for location, local time, climate, weather, environment, astronomy, terrain, ground, visibility, hydrology, and active phenomena.
- Uses the resolved scene across current-world views and records unavailable subsystems or coherence limitations instead of exposing stale or competing values as simultaneous truth.
- Applies local temperature and wind adjustments exactly once when weather was generated for the active location.

#### Campaign-world definitions and movement

- Adds bounded, validated geographies, biomes, ecoregions, locations, phenomena, quick actions, page associations, and local temporal contexts.
- Preserves owner-provided valid identifiers and refuses dependency-breaking removals.
- Adds current, prepared, favorite, recent, nearby, and complete location views plus read-only destination previews.
- Adds reviewed travel with retained route, pace, progress, destination, explicit completion/cancellation, bounded history, and one base chronology advanced only by accepted progress.
- Adds explicit phenomena as temporary overlays that can begin and end without rewriting permanent climate, weather, environment, or location definitions.

#### Reusable setup and transfer

- Adds immutable versioned starter presets that install editable copies without replacing existing places.
- Adds optional D&D 5E (2014) and system-neutral RulesAdvisor guidance that never applies gameplay changes.
- Adds the owned `GameAssist Wayfarer Calendar` advanced handout. Import is bounded, previewed, stale-protected, one-use, atomic, and replaces only the unreviewed saved draft.
- Adds the owned `GameAssist Almanac WorldPack` transfer format. It validates syntax, schema, object bounds, unsafe keys, references, conflicts, and the complete definition graph before one commit; runtime chronology, travel state, preview grants, characters, and runtime caches are excluded.
- Tags imported records with pack/source provenance and keeps an imported Wayfarer definition inactive until its separate review and activation succeeds.

#### Contracts and verification

- Exposes exact world, scene, WorldPack, temporal-context, and Wayfarer-handout schema versions through `GameAssist.AlmanacAssist` together with defensive `getScene()`, `getWorld()`, and `getTemporalContexts()` reads.
- Extends the shared argument parser to retain owner-authored hyphenated option names such as `--rate-numerator` while preserving null-prototype maps and unsafe-key rejection.
- Passes 141 focused non-live checks covering the original six systems plus chronology compatibility, routing, world definitions, coherent scenes, travel, local temporal contexts, phenomena, presets, rules guidance, Wayfarer handout transactions, WorldPack transactions, and disable/re-enable preservation.
- Roll20 live acceptance remains required for chat layout, target prompts, handout editing, restart persistence, custom calendars, travel, scene coherence, WorldPack use, and verified 2014-sheet rests.

### Static-audit repairs and documentation alignment - 2026-08-25

This checkpoint repairs confirmed runtime defects and low-cost hardening findings without changing AlmanacAssist behavior or broadening the v2.0.0 feature scope.

#### Runtime repairs

- Advances CritAssist to 0.2.5.3. Automatic fumble detection now watches attack templates only and ignores dropped d20 results from advantage, disadvantage, and other keep/drop expressions.
- Advances InitiativeAssist to 1.0.6. Mixed-sheet actor classification now returns the inspected sheet contract instead of referencing an undefined local identifier.
- Advances CombatAssist to 1.2.1. The encounter-ending confirmation formats its stored start time through GameAssist's shared timezone-aware helper instead of calling an undefined function.
- Advances EffectAssist to 2.5.4. Provider-specific expiration wording and general provider-list wording now use separate helpers, preventing function-hoisting collisions.
- Advances HealAssist to 1.2.1. Public completion emotes validate the reviewed source character and fall back to the HealAssist speaker if that token or character has disappeared.
- Advances MarkerService and HealthService to 1.1.1. Marker registry caching no longer serializes the complete campaign registry on every operation, and NPC HP setup no longer consults the nonexistent `npc_hpbase` field.

#### Core hardening

- Parses shared option maps without an object prototype and ignores prototype-mutating option names.
- Reuses bounded compiled command matchers and one route decision per Roll20 API message, preserving most-specific case-insensitive routing without repeated full-route scans by every listener.
- Removes mutable `state.api.scripts` as external-script evidence. Compatibility diagnostics now use only supported public runtime contracts and explicitly treat general Roll20 script inventory as unavailable.

#### Documentation and verification

- Synchronizes current module and service versions across the executable inventory, README, roadmap, smoke test, and MECHSUITS footers while preserving earlier changelog checkpoints as historical records.
- JavaScript syntax parsing passes for both executable artifacts; `script.json` parses successfully; both executable artifacts are byte-identical with SHA-256 `A8BCDC6556FFFB7CB669210B85E12B53B3E77020211A6F8E56E66A300EDDDC3B`.
- The focused repair, concentration-health, duration-provider, HealthService, HealAssist, PC-health-alert, current EffectAssist, current AlmanacAssist, and MECHSUITS structural harnesses pass 20, 34, 40, 70, 64, 46, 134, 107, and 33 checks respectively.
- The AlmanacAssist harness verifies existing mechanical contracts only; live custom-calendar usability remains governed by the consolidated AlmanacAssist issue and is not claimed complete by this checkpoint.

### Focused table-flow refinement - 2026-08-24

This checkpoint removes avoidable menu steps from the three table workflows identified during live use without changing their ownership boundaries.

#### HealAssist 1.2.0

- Sends Cure Wounds, Healing Word, Heal, potions, and every other exactly-one-recipient action directly to Roll20's native target prompt after its required action choices.
- Retains the recipient-count screen for Prayer of Healing, Mass Healing Word, Mass Cure Wounds, and other actions that genuinely support multiple recipients.
- Keeps older generated commands usable by falling back to the retained recipient picker when no target was supplied.
- Preserves review/automatic application, HealthService verification, placement privacy, and manual resource responsibility.

#### AttackAssist 1.1.0

- Makes immediate submission with the character sheet's saved roll setting the default after attack and target selection.
- Adds the protected GM setting `reviewBeforeRoll`, managed through AttackAssist controls or `!Attack-Review-Mode on|off`.
- Restores the existing Sheet, Normal, Advantage, and Disadvantage review screen only when that setting is enabled.
- Clears stale one-use submissions when the mode changes while preserving target privacy, formula preflight, visible native sheet cards, and the no-damage boundary.

#### TokenAssist 1.1.0

- Adds **More Actions** to the compact GM Controls screen.
- Adds an organized, GM-only extended action library for names and tooltips, bars, markers, auras, vision and light, movement and size, appearance and order, and reference tools.
- Exposes the same library through `!token-assist actions`, `!Token-Actions`, and `!ta-actions` without crowding the ordinary control center.

#### Verification

- JavaScript syntax parsing passes for the complete v2.0.0 source.
- The focused cross-module interaction harness passes 81 checks, including direct single-recipient HealAssist targeting, default immediate AttackAssist sheet submission, opt-in attack review, unsafe-formula refusal, and the TokenAssist extended action menu.
- The three executable release artifacts are byte-identical with SHA-256 `9395CBE6760377470D102E88B07022A9852447EC50AC227E2AE43F7BC8919053`.
- Live Roll20 acceptance remains required for the changed chat-button and native-target-prompt paths.

### Shared HP, visible attack rolls, healing choices, and command consistency - 2026-08-24

This checkpoint addresses the latest focused Roll20 acceptance findings without branching away from v2.0.0 or PR #81.

#### HealthService 1.1.0 and NPC HP consumers

- Adds `!ga-health bars` as the GM-facing authority for choosing Bar 1, Bar 2, or Bar 3 as GameAssist's shared NPC HP surface.
- Adds a current-page audit that separates linked NPCs ready for use, linked NPCs needing bar setup, and token candidates that do not represent a character.
- Adds confirmation-gated **Prepare Linked NPCs**, which copies each NPC character's current and maximum HP into the selected independent token bar while preserving the other bars.
- Keeps **Link To Sheet HP** separate and explicitly warns that multiple tokens representing the same character would share one linked HP pool.
- Advances NPCAssist to 1.4.1, HPAssist to 0.3.0, and DebugTools to 0.3.1 so death/revival markers, Bloodied notices, audits, repairs, NPC HP rolls, and supported diagnostic damage follow the same selected bar.
- Preserves official-2014 PC HP attributes as their own canonical surface and keeps Bar 1 as the direct fallback when HealthService is deliberately disabled.

#### AttackAssist 1.0.7

- Sends the fully materialized official-2014 sheet command directly through Roll20 instead of attaching a callback that consumes the generated attack card.
- Restores the familiar visible sheet attack result while retaining one-use authorization, prompt preflight, stable row identity, target privacy, and the no-damage/no-combat-state boundary.
- Keeps the compact AttackAssist submission notice separate from the Roll20 roll card.
- Refuses literal or HTML-encoded question marks and unresolved prompt syntax inside stored attack fields or final inline-roll expressions before `sendChat`, preventing malformed character-sheet values from disabling the Roll20 sandbox.

#### HealAssist 1.1.0

- Adds a separate maximum-healing catalog that evaluates supported dice at their maximum possible values while retaining maximum-HP caps.
- Adds a GM-controlled automatic application mode after recipient selection; review-before-apply remains the default.
- Routes automatic writes through the same HealthService verification and stale-state checks as confirmed reviews.
- Whispers the GM when automatic application fails and does not present a failed write as successful.

#### EffectAssist 2.5.3

- Removes routine layer and represented-character detail from unique caster buttons.
- Adds concise character, layer, and token-reference detail only when duplicate visible labels require disambiguation.
- Retains exact-token concentration ownership and recipient validation behavior.

#### Command consistency

- Bare `!combat` and `!combatassist` now open CombatAssist's established control center.
- Bare `!token` and full-name `!tokenassist` commands now reach TokenAssist alongside `!token-assist` and `!ta`.
- Advances TokenAssist to 1.0.7 and checks longer command names first so `!token-assist help`, `audit`, and settings routes cannot be mistaken for the shorter `!token` alias.
- Adds full-name command routes for ConditionAssist, InitiativeAssist, WelcomeAssist, NPCAssist, EffectAssist, HealAssist, AttackAssist, AlmanacAssist, HPAssist, and DebugTools while preserving their established short commands.
- Command matching remains case-insensitive and accepts the established space or hyphen forms.

#### Verification

- JavaScript syntax parsing passes for the complete source.
- The focused EffectAssist harness passes 134 checks with an existing custom concentration marker and the same 134 checks in a fresh campaign using the built-in marker fallback.
- The cross-module interaction and Almanac regression harness passes 74 checks, including visible attack submission, literal and encoded unsafe-roll refusal, compact Bless caster identity, shared HP-bar preparation and consumers, HealAssist maximum/automatic paths, and bare module command routes.
- The complete Almanac boundary harness passes 107 checks.
- The retained ConditionAssist, TokenAssist, upgrade stabilization, timezone, InitiativeAssist, CombatAssist, canonical naming, Bloodied/static, and WelcomeAssist suites pass 81, 45, 64, 23, 116, 145, 266, 274, and 30 checks respectively.
- The MECHSUITS structural audit passes all 32 sections with an exact canonical tree, paired nesting, required metadata, and required footers.
- The three executable release artifacts are byte-identical with SHA-256 `E99EE3A399DDE3EB31A0859FBBE87B516EDA9250D4A8D1BB7943378528CDDCB2`.
- Live Roll20 acceptance remains the release gate for the behavior changed in this checkpoint.

### Attack, concentration-marker, and effect dependency repair — 2026-08-24

This pre-release checkpoint repairs three failures observed in live Roll20 testing while retaining GameAssist v2.0.0 and PR #81 as the single development line. AlmanacAssist's remaining custom-calendar and world-context work is recorded separately in [Issue #90](https://github.com/Mord-Eagle/GameAssist/issues/90).

#### AttackAssist 1.0.5

- Materializes the complete selected Classic-sheet attack formula, including nested repeating-row and global modifier fields, before submitting the roll.
- Translates the official sheet's **Query Whisper** and **Query Advantage** values to their documented first choices, Public and Normal, because an API-authored `sendChat` call cannot open those client prompts.
- Refuses any other `?{...}` query, circular attribute reference, or unresolved sheet/ability/target placeholder before it can reach Roll20's dice parser and disable the Mod sandbox.
- Translates documented official-2014 Classic sheet placeholders that may exist only as HTML defaults, including the ordinary critical range of `20`, checked attack and first-damage flags, and unchecked second-damage and save flags, before submitting a repeating attack through the Mod sandbox.
- Keeps explicit Normal, Advantage, and Disadvantage modes independent from unsaved `d20`, roll-mode, character-output, and empty global-modifier attributes.
- Refuses an unknown missing field before `sendChat`, names the field, and asks the GM to open and save the attack instead of allowing Roll20 to emit an attribute-resolution exception.
- Does not create or alter character-sheet attributes while preparing the roll.

#### ConcentrationAssist 0.6.0

- Uses Roll20's built-in `stopwatch` marker for fresh campaigns so concentration works without a custom campaign marker library.
- Preserves every valid saved concentration marker, including a valid custom `Concentrating` marker and exact custom tags.
- Migrates only the exact former stock `Concentrating` value when the campaign registry confirms that it cannot be resolved; an unavailable registry does not overwrite saved configuration.
- Adds GM-facing **Use Stopwatch**, **Choose Marker**, built-in marker, registered custom marker, and manual exact-tag controls to the existing settings screen.
- Requires a finite persisted or Roll20-computed official-2014 Constitution save bonus before rolling; missing Classic data is refused instead of becoming `+0`.
- Refuses recognized 2024 Beacon characters with a direct native-sheet next step until a separately verified adapter is available.
- Publishes concentration lifecycle changes only after MarkerService verifies the requested marker's final state on the exact token.

#### EffectAssist 2.5.2

- Validates the configured concentration marker before applying any concentration-dependent target projection.
- Refuses an invalid dependency before writing recipient markers or official-2014 modifier rows, preserving the all-or-nothing application boundary.
- Names the exact source and resolved marker after concentration begins successfully.
- Names every invalid recipient token, distinguishes an empty **Represents Character** value from a stale character reference, and accepts Roll20's compatible `represents` and `_represents` evidence without hiding a broken link.
- Distinguishes duplicate source tokens by token and layer, binds concentration ownership to the exact chosen source token, and does not end that effect when another token representing the same character loses its marker.
- Reports matching marker or sheet state that existed before EffectAssist and was deliberately preserved during cleanup.

#### Module controls

- Adds a direct **Disable** control to every running module's `!ga-nav <module>` destination and an **Enable** control to disabled-module destinations.
- Adds **Disable CritAssist** to CritAssist's private GM/DM interaction screens so the automatic Natural 1 workflow can be stopped without locating a raw configuration command.
- Keeps all module settings and gameplay behavior inside their existing owners; the suite navigator only routes to controls and lifecycle actions.

#### Compatibility boundary

- Documents that **5th Edition OGL by Roll20 Companion** can overlap GameAssist through automatic NPC HP and token-bar ownership, so campaigns should choose one automatic NPC HP writer.
- Records the Companion's supplied API-origin guard: normal Classic-sheet clicks may use its ammunition or spell-slot processing, while AttackAssist-generated API roll templates should not trigger that processing.
- Tracks shared 2014/2024 capability classification and future verified adapters in Issue #91 without delaying explicit refusals in the current candidate.

#### Verification

- JavaScript syntax parsing passes for the complete source.
- The focused lifecycle, identity, ownership, AttackAssist, concentration-marker, mixed-sheet refusal, module-control, and EffectAssist harness passes 134 checks with an existing valid custom marker.
- The same 134-check harness passes in a fresh campaign with no custom marker registry and confirms the built-in `stopwatch` default.
- The focused Roll20 interaction and Almanac regression harness passes 46 checks, including strict rejection of query-bearing API attack formulas before they can reach the dice parser.
- The complete Almanac boundary harness remains green at 107 checks; this repair does not alter AlmanacAssist runtime behavior tracked under Issue #90.
- The three executable artifacts are byte-identical at SHA-256 `85415BE2B90B495FCEAE999D5817A80F26FCB79D4DE6630A9CCD5D8510FF18D3`.
- The MECHSUITS structural audit passes all 32 sections with an exact canonical tree, paired nesting, required metadata, and required footers.

### Roll20 acceptance repair — 2026-08-22

This pre-release checkpoint advances EffectAssist to 2.5.0, AttackAssist to 1.0.2, ConcentrationAssist to 0.4.2, and AlmanacAssist to 1.6.0 while retaining GameAssist v2.0.0 and PR #81 as the single development line.

#### Shared Roll20 command transport

- Protects complete Roll20 query, target, attribute, and inline-roll expressions while GameAssist places commands inside chat-template buttons.
- Prevents context prompts from collapsing into blank values or `true`, including Wayfarer name, starting-date, weekday, period, moon, and weather controls.
- Keeps the correction at the shared command-button boundary so each affected module receives the same parser-safe behavior.

#### AttackAssist 1.0.2

- Rebuilds the attack picker as a compact list of saved attacks and target actions instead of giving each attack a large framed block.
- Replaces the official sheet's hidden `@{d20}` placeholder with an explicit `1d20` before submitting a Normal, Advantage, or Disadvantage roll.
- Preserves the character's saved sheet mode, stable repeating-row identity, one-use submission, target privacy, CritAssist observation, and no-damage boundary.

#### EffectAssist 2.5.0

- Separates player casting into a compact caster step followed by recipient count.
- Gives Bless direct choices for one, two, or three recipients and a separate Higher Level Casting screen for four through eleven recipients.
- Standardizes every EffectAssist-owned official-2014 modifier label as `Bless (GA)`, `Guidance (GA)`, `Warding Bond (GA)`, or `Haste (GA)`.
- Retains the established application, ownership, cleanup, overlap, GM-request, audit, cast-proposal, and duration boundaries.

#### ConcentrationAssist 0.4.2

- Revalidates a private HP-loss offer against the latest canonical resulting HP and current snapshot rather than requiring one exact event identifier.
- Accepts equivalent linked sheet and token-bar evidence for the same HP transition while still refusing an offer after a genuine second HP change or ended concentration.

#### AlmanacAssist 1.6.0

- Advances announcement schema 4 so Date, Time, Season, Observances, Moon Phases, Weather, Climate, and Environment each independently use Off, Descriptive, Detailed, or Technical presentation.
- Retains the Quick, Calendar, Travel, and Everything presets and adds one explicit campaign-default restoration path without changing fictional time or world state.
- Replaces the placeholder region name with the generic **Temperate Lowlands** starter while preserving valid campaign-defined regions.
- Treats an Environment override as the current scene and generated Weather as stored background state; the Weather screen identifies both and explains when stored weather resumes.
- Repairs default Wayfarer draft recovery so malformed weekday state is replaced by the complete campaign Wayfarer definition rather than surviving the reset.

#### Verification

- JavaScript syntax parsing passes for the complete source.
- The focused EffectAssist lifecycle and ownership harness passes 110 checks.
- The focused Roll20 interaction and Almanac control harness passes 35 checks, including complete encoded queries, executable attack d20 modes, two-stage Bless targeting through eleven recipients, independent announcement fields, current-scene weather ownership, and Wayfarer default repair.
- The complete AlmanacAssist time, climate, astronomy, weather, environment, rest, persistence, and boundary harness passes 107 checks.
- The MECHSUITS structural audit and release-artifact identity checks pass.

Live Roll20 acceptance remains the release gate for the native target prompts, official 2014 sheet rolls and workers, linked HP evidence, and chat-template rendering covered by this checkpoint.

### Roll20 command-button and Almanac control repair — 2026-08-20

This pre-release repair advances EffectAssist to 2.4.3 and AlmanacAssist to 1.5.0 while retaining AttackAssist 1.0.1 and GameAssist v2.0.0. It repairs Roll20-native target and query prompts at the shared button boundary, then applies the resulting controls to the effect, attack, calendar, astronomy, announcement, and rest workflows.

#### Roll20 target and query buttons

- Defers Roll20 target references, roll queries, ability calls, and bracketed rolls with the platform's documented HTML entities when GameAssist generates a command button.
- Prevents `@{target|...}` from being evaluated while the Mod script renders a chat panel, which previously reduced `!attack`, `!attack-menu`, and `!bless` interactions to the visible output `{}`.
- Restores the direct AttackAssist target picker, the direct Bless recipient picker, and AlmanacAssist context prompts without changing their existing authorization or one-use flow checks.
- Keeps the correction in the shared `GameAssist.createButton()` boundary so later modules do not need separate escaping rules for the same Roll20 behavior.

#### EffectAssist sheet labeling

- Advances EffectAssist to 2.4.3.
- Uses the compact label `Bless (GA)` for newly created GameAssist-owned Bless attack and saving-throw modifier rows.
- Leaves unrelated and pre-existing campaign rows untouched; EffectAssist cleanup continues to rely on owned-row evidence rather than display-name deletion.
- Excludes an effect already in its `ending` state from synchronous marker observations, preventing one EffectAssist-owned cleanup from entering the same effect twice or creating duplicate history records.

#### Announcement presentation

- Advances AlmanacAssist to 1.5.0 and announcement schema 3.
- Adds four explicit presentation choices: **Off**, **Descriptive**, **Detailed**, and **Technical**.
- **Off** suppresses delivery and provides a private GM confirmation or preview instead of posting a world announcement.
- **Descriptive** translates the Wayfarer clock, exact temperature, wind speed, and visibility into player-perceivable language such as Highsun, Cool, Gentle breeze, and Visibility remains good.
- Descriptive moon output identifies when configured moons are not visible because of daylight, cloud cover, or both.
- **Detailed** keeps useful exact current-weather measurements without presenting a climate baseline as a second simultaneous temperature.
- **Technical** retains the deeper weather, climate-likelihood, and environment context for GM reference while clearly separating current conditions from background context.
- Renames the untouched placeholder climate region from `Home Region` to `Campaign Default`; valid campaign-renamed regions remain unchanged.

#### Wayfarer calendar editing

- Repairs Change Name, Change Starting Date, Change Clock, and combined name/date controls so each button opens the intended Roll20 context prompts.
- Adds one atomic **Change Name and Starting Date** action. Invalid input preserves the complete prior draft rather than applying a partial identity change.
- Keeps the starting hour and minute valid when the GM deliberately shrinks the calendar's hours-per-day or minutes-per-hour, and reports the adjustment in the resulting editor.
- Keeps the draft starting period and day valid when the GM replaces the complete period list, selecting the corresponding new period when possible and otherwise using the first new period without silently moving dated dependents.
- Replaces circular recovery buttons with direct retry prompts plus a separate route back to the focused editor.
- Preserves the command-only campaign-default draft reset and leaves active fictional time unchanged during draft recovery.

#### Astronomy and Rest controls

- Adds direct per-moon Edit and Remove controls carrying the moon's internal identifier, plus an Add Moon prompt that does not ask the GM to discover or type an internal ID.
- Adds equivalent direct controls for bounded rare celestial events.
- Advances RestAlmanac state schema 2 with **Standard**, **Heroic**, **Gritty**, and bounded **Custom** duration profiles.
- Shows the active Short, Long, and Extended Rest durations in the ordinary Rest screen.
- Adds direct controls for custom house-rule rest types while retaining the existing preview, revalidation, and confirmed-write boundary.

#### Verification

- JavaScript syntax parsing passes for the complete source.
- The focused Roll20-style interaction harness passes 28 checks covering direct `!bless`, `!attack`, and `!attack-menu` target paths, deferred native prompts, Off/Descriptive/Detailed/Technical announcements, daylight/cloud moon visibility, Wayfarer identity and clock edits, direct moon controls, rest-rule profiles, Climate navigation, and Environment editing.
- The complete focused harnesses also pass 108 EffectAssist lifecycle/ownership checks and 107 AlmanacAssist time, climate, astronomy, weather, environment, rest, persistence, and boundary checks.
- Live Roll20 acceptance remains required because native target and query prompts are expanded by Roll20's chat parser rather than the local harness.

An editable Almanac import handout is not included in this repair. Importing nested calendar, moon, climate, weather, environment, and rest data requires a versioned schema, validation preview, and explicit confirmation so a handout typo cannot partially replace campaign chronology.

### Focused interaction and Almanac usability repair — 2026-08-19

This pre-release repair advances EffectAssist to 2.4.2, AttackAssist to 1.0.1, and AlmanacAssist to 1.4.0 without changing GameAssist's v2.0.0 release number or adding MECHSUITS section tags.

#### EffectAssist direct caster targeting

- Replaces the generated `!Effect-Targets --effect ... --source ...` caster hop with source-bound recipient buttons on the caster-selection screen.
- Places each valid controlled caster beside the recipient counts supported by the selected effect. One click now chooses that caster and invokes Roll20's native target prompt.
- Keeps source and effect authority in a short-lived opaque flow instead of placing raw source identifiers in the generated recipient command.
- Preserves the separate **Ask the GM** path for hidden, off-page, or unusually broad player targeting.
- Retains the older `!Effect-Targets` route for compatibility and recovery, but no ordinary EffectAssist screen depends on it.

#### AttackAssist direct target selection

- Replaces the generated `!Attack-Target --flow ...` intermediate screen with a **Choose Target** button beside each verified repeating attack.
- The attack button now invokes Roll20's native target prompt directly and continues into the established attack review and one-use roll choices.
- Keeps duplicate-name numbering, stable repeating-row identity, player-bound flow validation, and private **Ask The GM** requests unchanged.
- Retains `!Attack-Target` as a compatible route without making the normal attack workflow depend on it.

#### Wayfarer time presentation

- Removes AM/PM from the active Wayfarer display.
- Presents the campaign clock as the 1st through 20th Hour and identifies First Light, Morningtide, Highsun, Waning Hours, Evening's Crest, Nightfall, and Deep Night.
- Identifies Dawn near the 2nd Hour, Midday near the 7th, Dusk near the 12th, and Midnight near the 17th.
- Generated Wayfarer exact-time and starting-time prompts accept the human-facing 1st-through-20th Hour while preserving the existing zero-based stored chronology and command compatibility.

#### Announcement, Climate, and Environment controls

- Expands announcements from a quick/full switch to **Quick**, **Calendar**, **Travel**, and **Everything** presets.
- Adds a custom announcement heading and individual inclusion controls for date, time, season, observances, moon phases, weather, climate, and environment.
- Keeps previews private and quietly omits a requested field when its owning Almanac system has no current value.
- Rebuilds the Climate opening screen around the current region, readable conditions, direct region switching, and focused **Manage Regions** and **Climate Types** destinations.
- Rebuilds the Environment opening screen around current context, individual quick presets, a focused one-field custom editor, and a separate technical-detail screen.

#### Focused verification

- JavaScript syntax passes.
- MECHSUITS validation passes for all 32 framed sections with an exact canonical tree.
- Fourteen Roll20-style harness checks pass for multi-caster Bless targeting, direct attack targeting, Wayfarer clock language, announcement configuration, Climate navigation, and focused Environment editing.
- Live Roll20 acceptance remains required for the native target prompts and final chat presentation.

### Post-smoke repair pass — 2026-08-16

This pre-release repair pass advances EffectAssist to 2.4.1, ConcentrationAssist to 0.4.1, and AlmanacAssist to 1.1.2 without changing the GameAssist v2.0.0 release number or adding section tags. It addresses failures observed during the focused Roll20 acceptance pass while preserving the established module boundaries and v2.0.0 state contracts.

#### EffectAssist application and 2014-sheet projection lifecycle

- Makes **Application Review** optional and disabled by default. After the target and source are chosen, supported effects now apply immediately; the GM can restore the separate review screen through `!Effect-Settings` or `!Effect-Review on`.
- Removes the routine concentration-replacement question. A new concentration effect from the same source now ends that source's prior concentration effect by default.
- Adds a separately labeled advanced **Allow Multiple Concentration** option, disabled by default, for campaigns that intentionally use an exceptional rule.
- Creates official-2014 repeating modifier rows and their activation fields in sheet-worker order. Newly applied Bless, Guidance, Warding Bond, and Haste projections no longer require a user to toggle the generated sheet checkbox before the first supported roll or AC calculation.
- Deactivates generated modifier rows through sheet workers before removing their attributes. Ending an effect no longer leaves the character sheet's generated totals or roll queries using a removed GameAssist bonus.
- Keeps Guidance's supported global skill projection because it functions through the same worker-safe path. Its explicit manual-use fallback remains for ability checks not represented by a supported sheet skill.
- Gives Holy Weapon a marker distinct from Bless so two different active effects are not presented as the same token state.
- Keeps Holy Weapon and Pass Without a Trace in the **Tracked Marker; Rules Stay Manual** catalog group, while Bless, Guidance, Warding Bond, and Haste appear under **Marker + Supported Sheet Automation**.
- Ends an effect when every managed target marker or condition for that effect has been manually removed. That ending clears EffectAssist-owned source concentration and sheet projections. Removing only one marker from a multi-target effect remains repairable drift rather than ending the whole cast.
- Keeps the **Effect Applied** result's direct **End Effect** action and shortens the default route by omitting an unnecessary intermediate confirmation.
- Replaces the expiring player source-flow button used between source choice and target choice with a stateless, revalidated target command. A legitimate target button no longer becomes inert solely because its preceding source-choice capability was consumed.
- Expands EffectAssist settings, status, documentation, and acceptance checks for the new defaults and advanced option.

#### ConcentrationAssist HP-loss matching

- Limits HealthService-driven concentration matching to the HP event token, the event page, and the Player Ribbon page instead of treating every stored representation of a character as an equal candidate.
- Prefers the exact event token when it is concentrating, then uses a deterministic current-page Objects-layer or GM-layer representation.
- Ignores stale and off-page concentration markers when resolving the supported HP-loss offer.
- Stops emitting the multiple-token ambiguity warning for a character whose current-page representation is unambiguous.
- Produces no concentration offer when the affected character has no concentrating representation on the relevant page.

#### HealthService-facing language and disabled-module recovery

- Replaces repeated raw `unknown` explanations with the reader-facing phrase **Observed in Roll20; source not identified**.
- Explains that a supported observed decrease can still drive configured health-band notices or concentration offers without claiming an attacker, damage type, resistance result, or temporary-HP history.
- Adds a guarded suite-level recovery response for a command owned by a disabled or inactive module. For example, `!attack` now offers an Enable action and routes back to module and suite controls instead of appearing to do nothing.
- Leaves active command routes authoritative, so the recovery listener does not duplicate normal module responses.

#### AlmanacAssist Wayfarer calendar repair

- Replaces the generic Wayfarer starter draft with the campaign's Wayfarer Calendar definition, including its 20-hour day, 75-minute hours, Soladain-through-Stellara weekday cycle, twelve months, five festival periods, four dated seasonal observances, and four season ranges.
- Records the briefing's exact 460-day year, month and festival order, cross-year Frosthold boundary, and seven-part daily rhythm in the generated AlmanacAssist manual and release documentation.
- Migrates only the exact untouched pre-briefing starter and matching saved draft from the misleading `Solamnic Calendar` label. Valid campaign-edited Wayfarer definitions remain authoritative.
- Adds custom hours-per-day and minutes-per-hour fields and uses those values consistently for date conversion, advancement, astronomy offsets, duration evidence, and RestAlmanac time changes.
- Adds feast-period support through the `Name:Days:Feast` period syntax. Feast days are displayed as feast days and do not advance the ordinary weekday cycle.
- Makes complete period replacement clear index-based festival days, leap placement, holidays, and seasonal ranges, marks those stages for review, and explains the reset in the setup panel instead of silently remapping dates.
- Adds bounded custom seasonal ranges and applies them when the active Wayfarer calendar defines them.
- Rejects missing or cancelled text-query values instead of normalizing Roll20's flag-like placeholder to the string `true`. Cancelling **Change Name** therefore preserves the existing draft.
- Migrates only the exact earlier generic placeholder draft to the new starter definition. Existing valid campaign-edited Wayfarer calendars remain authoritative.
- Advances the Wayfarer draft and fictional-time state schemas to version 2 while preserving valid existing configuration.

#### Verification and release gate

- Keeps `GameAssist`, `GameAssist.js`, and `GameAssist-v2.0.0` as identical release artifacts.
- Adds focused Roll20 checks for first-roll sheet activation, post-cleanup roll behavior, default and advanced concentration policy, target-marker cleanup, duplicate-token concentration matching, disabled-module recovery, cancelled Wayfarer queries, custom clocks, feast periods, and the Solamnic starter calendar.
- JavaScript syntax and MECHSUITS framing are verified before the branch update. The focused Roll20 acceptance checks remain the release gate for these sandbox-specific sheet-worker and marker behaviors.

### Suite navigation and module return paths

- Adds `!GA-GM` and the equivalent `!GA-DM` as the private suite-level Game Master control center for all fifteen feature modules.
- Adds `!ga-help` as a private directory of module-owned help screens.
- Adds `!ga-nav`, `!ga-nav <module>`, and `!ga-nav <module> <section>` as a progressive navigator. Modules with compact command surfaces show their destinations directly; EffectAssist, TokenAssist, NPCAssist, InitiativeAssist, CombatAssist, and AlmanacAssist use one organized section step before their detailed destinations.
- Adds one **GameAssist Home** return to every module's primary Game Master screen while leaving module behavior, state, permissions, and specialized menus under that module's ownership.
- Replaces dead controls for disabled modules with an Enable action and routes enabled-but-inactive modules to troubleshooting details.

### Consistent command entry and control-panel presentation

- Makes command letters case-insensitive across the GameAssist command router and treats spaces or hyphens between command words as equivalent. Forms such as `!GA STATUS`, `!ga-status`, `!gA gM`, and `!GA-GM` therefore reach the same destination.
- Preserves quoted values, arguments, and documented `--options` while normalizing only the GameAssist command path.
- Selects the single most-specific active GameAssist route for each API message so overlapping compatibility aliases do not trigger two module handlers. The original Roll20 message remains unchanged for unrelated Mods.
- Standardizes suite navigation, ConfigUI 0.2.5, ConditionAssist 1.0.4, TokenAssist 1.0.5, and WelcomeAssist 0.1.5 private controls on Roll20's default-template presentation already used by HPAssist and CombatAssist.
- Groups central configuration output into alphabetized Services followed by alphabetized Modules.
- Replaces nested configuration JSON in ordinary chat with bounded human summaries and wrapping controls. The complete versioned configuration remains available through `!ga-config list`. WelcomeAssist's public greeting card remains intentionally distinct from its controls.
- Removes TokenAssist's separate white-and-pink panel treatment and the remaining pale custom frames from these shared interfaces. One suite presentation was chosen instead of a configurable theme so new controls inherit a predictable, readable default without multiplying styling work across every module.

### Guarded Guidance consumption

- Advances EffectAssist from 2.3.0 to 2.4.0 without changing durable effect-state schema 3, cast-proposal schema 1, or player-cast-flow schema 1.
- Labels the EffectAssist-created official-2014 global skill modifier as `1d4[GameAssist Guidance]`, allowing a supported sheet roll to carry evidence of the exact owned projection instead of relying on the presence of an arbitrary d4.
- Ends at most one active Guidance instance when the target character, controlling roller, current owned row, projection ledger, stored token identity, roll template, and owned expression are all present and unambiguous.
- Uses the ordinary EffectAssist end lifecycle so the marker, unedited sheet row, source concentration, history, and lifecycle event follow the same cleanup and ownership rules as a deliberate **Use Guidance** action.
- Keeps unrelated d4 modifiers, unsupported templates, non-skill ability checks, pre-existing rows, edited rows, ambiguous characters, ambiguous active instances, and stale or duplicate evidence unchanged.
- Includes the active effect instance in duplicate-event evidence so a new Guidance cast is not suppressed merely because the same character repeats a similar skill check shortly afterward.
- Keeps Issue #85 open until the official 2014 sheet's normal, advantage, and disadvantage skill-check paths pass in the live Roll20 Mod sandbox.

### Launch effect catalog

- Adds focused built-in definitions for Bless, Guidance, Warding Bond, Holy Weapon, Haste, and Pass Without a Trace.
- Gives every definition a stable identifier, readable rules summary, target guidance, duration guidance, concentration requirement, stacking group, projection list, and separate automatic, assisted, and informational instructions.
- Separates entries into **Marker and Sheet Automation** and **Tracked; Rules Stay Manual** before application.
- Omits Gift of Alacrity, Longstrider, and Beacon of Hope as built-in launch buttons because marker-only treatment does not remove enough table work; the generic Marker, Condition, and Record Only paths remain available when a GM deliberately wants that tracking.
- Presents a preview before application so the GM or casting player can see exactly what GameAssist will change and what still requires normal table adjudication.

### Official 2014 sheet projections

- Adds an ownership-aware adapter for the official D&D 5E by Roll20 2014 repeating global attack, saving-throw, skill, and AC modifier sections.
- Bless creates active `Bless (GameAssist)` `1d4` rows for global attack and saving-throw modifiers on eligible 2014 PC targets.
- Guidance creates an active `Guidance (GameAssist)` `1d4` global skill modifier row on eligible 2014 PC targets; ability checks that are not represented by a sheet skill retain an explicit manual-d4 instruction.
- Warding Bond creates active `Warding Bond (GameAssist)` `+1` rows for AC and saving throws.
- Haste creates an active `Haste (GameAssist)` `+2` AC row.
- Uses `setWithWorker` when Roll20 exposes it and avoids writing generated aggregate fields.
- Records exact attribute and row identifiers so cleanup can distinguish EffectAssist-created state from campaign-owned rows.
- Adopts matching pre-existing rows without claiming or deleting them.
- Preserves an EffectAssist-created row if a GM or another Mod edits its managed values, then reports that cleanup needs attention.
- Gives linked NPC targets marker and lifecycle support without creating PC-only modifier rows; unsupported mechanics remain explicit assisted steps.

### Complete Bless lifecycle

- Applies the configured Blessed marker to each target.
- Applies the 2014-sheet `1d4` global attack and saving-throw rows to eligible PC targets.
- Establishes concentration on the source through ConcentrationAssist's public lifecycle contract.
- Ends dependent Bless instances when source concentration ends through ConcentrationAssist or MarkerService observation.
- Removes only the final unneeded EffectAssist-owned target marker and unedited sheet rows.
- Rejects a second concentration effect from the same source unless replacement is explicitly confirmed; the guided prompt now presents replacement as the default choice.
- Rolls back partial work when any required projection cannot be established.

### Remaining catalog behavior

- Guidance manages its marker, safe `1d4` global skill row, source concentration, and cleanup while identifying non-skill ability checks as manual.
- Warding Bond manages its marker and safe `+1` AC/save rows while leaving resistance and mirrored damage to the table.
- Holy Weapon manages its marker and source concentration without adding a global damage row that would affect every weapon.
- Haste manages its marker, safe `+2` AC row, source concentration, and cleanup while identifying its remaining speed, save, action, and lethargy rules.
- Pass Without a Trace manages its marker and source concentration while identifying the `+10` Stealth and area-membership responsibilities.

### Semantic effect records and transactions

- Migrates EffectAssist durable state to schema version 2 with exact projection bindings for every instance.
- Adds reusable effect definitions with stable identifiers, readable names, concentration requirements, and multiple declared projections.
- Supports generic MarkerService, ConditionAssist, and record-only definitions for deliberate GM-managed effects.
- Records the exact source character and source token separately from every target character and target token.
- Preserves active instances across sandbox restarts and keeps a bounded history of the 100 most recently ended instances.
- Generates stable instance identifiers and rejects overlong or unsafe request identifiers.
- Makes repeated submission of the same request idempotent and refuses reuse of the same request ID for a different intent.
- Rejects a mixed valid/invalid target selection as one operation so a partial effect is never silently applied.
- Rolls back completed bindings if a later required binding fails during application.

### Projection ownership and overlap

- Adds shared projection ledgers for markers, conditions, concentration, and 2014-sheet rows. Each ledger records baseline state, creation ownership, expected values, and every active instance that currently relies on it.
- Allows overlapping sources to share non-stacking projections without multiplying visible or mechanical state.
- Ending one source removes only that source's ownership while another source remains active.
- Ending the final source removes the projection only when EffectAssist originally created it.
- Preserves matching markers, conditions, concentration, and sheet rows that existed before EffectAssist began managing the effect.
- Verifies each supported write and records clear pending or needs-attention health when a projection cannot be completed or safely cleaned.
- Refuses to mutate a token when its represented character no longer matches the identity captured by the effect instance.
- Treats manual removal of a target effect marker as auditable, repairable projection drift rather than silently ending the source's concentration or every target's effect.
- Continues to end dependent effects when the source's Concentrating marker is removed or ConcentrationAssist reports that concentration ended.

### Audit and authorized repair

- Adds a read-only audit that compares semantic instances, projection ownership, marker/condition state, concentration state, and exact 2014-sheet rows without changing the campaign.
- Reports missing or altered managed projections, unexpected remaining projections, unavailable services, malformed known records, incomplete cleanup, and token-identity drift as distinct conditions.
- Adds short-lived repair grants that are bound to the requesting GM and the exact mismatch signature.
- Makes each repair grant single-use and requires EffectAssist to recheck the mismatch immediately before writing.
- Refuses stale, expired, reused, altered, or non-GM repair requests.
- Runs a fresh audit after an approved repair so the result is visible rather than assumed.

### Game Master experience

- Adds a compact EffectAssist GM/DM control center, Guide/Help, Catalog, Active Effects, Info, Status, Definitions, Audit, Apply/Confirm, End, Repair, and persistent Manual workflow.
- Makes bare `!effect` open the catalog directly and keeps Status compact by moving complete active-instance controls to `!Effect-Active`.
- Adds an **End Effect** button to every successful application result.
- Adds a Player Casting switch to the GM control center; it is enabled by default and may be locked or restored without restarting the sandbox.
- Adds case-insensitive player shortcuts for `!Bless`, `!Guidance` / `!Guide`, `!Haste`, `!Warding-Bond`, `!Holy-Weapon`, and `!PwoaT`.
- Requires every player preview and confirmation to resolve a linked source currently controlled by that Roll20 player; custom effects, status, audit, repair, and configuration remain GM-only.
- Provides friendly unknown-command recovery with a direct route back to the Guide.
- Keeps detailed catalog and lifecycle guidance in the module manual while ordinary chat menus remain task-oriented.
- Adds EffectAssist to ConfigUI, module health reporting, the public command matrix, One-Click metadata, and the module-specific smoke-test guide.

### Player casting and retained GM requests

- Advances EffectAssist from 2.2.0 to 2.3.0 without changing durable effect-state schema 3 or cast-proposal schema 1; player casting uses a separate sandbox-local flow schema 1.
- Replaces generated player buttons containing source token or character identifiers with short-lived opaque choices bound to the requesting player, source, effect definition, workflow stage, and expiry.
- Rechecks source identity, current control, active page, token layer, module availability, and player-casting permission at each player step instead of trusting an earlier menu.
- Uses Roll20's native map target query for visible linked recipients, allowing a player to choose a recipient they can see without requiring control of that recipient.
- Returns a clear **Start Again** action when a player button is stale, reused, fabricated, or belongs to another player instead of failing silently.
- Adds bounded, expiring player requests for hidden or off-page recipients. `!Effect-Requests` retains those requests for GM review instead of relying on a single transient whisper.
- Adds generated GM apply and dismiss actions, revalidates a request when the GM opens it and again before confirmation, and invalidates a pending request if the GM later locks player casting.
- Keeps invalidated requests visible as needing attention until they are dismissed or expire, while completed requests are removed from the inbox.
- Adds direct built-in effect buttons and a current player-request count to the EffectAssist GM Control Center so ordinary GM application does not require unnecessary intermediate menus.
- Keeps player-visible menus limited to casting choices and recovery. Definitions, active records, configuration, audits, repair, duration review, cast proposals, and the request inbox remain GM-only.
- Omits hidden recipient names from public cast announcements while preserving private GM evidence.
- Bounds player casting flows to fifty five-minute entries and retained GM requests to twenty ten-minute entries.
- Passes 34 focused local checks covering opaque buttons, source authorization, visible non-controlled targeting, preview and confirmation, request retention, direct GM controls, hidden-recipient privacy, lock invalidation, stale and fabricated buttons, single use, and defensive public inspection. Live separate-player Roll20 acceptance remains required before Issue #88 is complete.

### Official 2014 Bless cast proposals

- Advances EffectAssist from 2.1.0 to 2.2.0 and adds sandbox-local cast-proposal schema 1 without changing durable effect-state schema 3.
- Recognizes only the official D&D 5E by Roll20 2014 `spell` template with an exact normalized Bless name and one unambiguous character-name match.
- Requires one eligible linked source token on the actor's active page; non-GM cards additionally require current source control and an Objects-layer token.
- Creates one private five-minute GM proposal and never applies an effect, establishes concentration, changes a marker or sheet row, or announces a cast from recognition alone.
- Treats spell-card target wording as descriptive text and never converts it into token recipients.
- Requires the GM to select actual recipient tokens, then routes the request through the existing EffectAssist source authorization, preview, one-use confirmation, transaction, concentration, projection, and announcement path.
- Deduplicates repeated copies of the same chat evidence, bounds the pending inbox to twenty proposals, and makes each proposal single-use.
- Adds `!Effect-Casts`, generated review/dismiss controls, and `!Effect-Recognition on|off` to the Control Center, Status, Quick Guide, Manual, command matrix, smoke test, and One-Click metadata.
- Leaves the complete `!effect` catalog available whether recognition is enabled or disabled.
- Refuses unsupported spells and ambiguous caster evidence without creating an instance; supported but ambiguous Bless evidence gives the GM an actionable catalog route.
- Keeps 2024 spell recognition deferred until real template evidence supports a separate documented contract.

### TokenAssist compatibility wording

- Advances TokenAssist from 1.0.3 to 1.0.4 without changing token mutation behavior or command routing.
- Removes the expired instruction to replace older `!token-mod` macros before v2.0.0.
- Retains `!token-mod` as a compatibility alias while recommending `!token-assist` and `!ta` for new macros.
- Requires any future alias removal to be announced through a separate migration release rather than inferred from project-version numbering.

### SemanticEvents core service

- Adds an always-available in-memory service for immutable, JSON-safe semantic event envelopes.
- Assigns an event schema version, event id, stream id, sequence, producer, occurrence time, optional cause event, and payload to each publication.
- Delivers events directly and in publication order without routing ordinary handlers through the queue.
- Allows observers to filter by exact event type and isolates observer exceptions so one integration cannot interrupt another.
- Provides bounded observer registration and explicit cleanup by subscription or owner.
- Publishes EffectAssist lifecycle changes as `effect.lifecycle.changed`.
- Does not persist or replay events; durable gameplay truth remains in the owning module's state.

### HealthService core foundation

- Adds toggleable `GameAssist.HealthService` 1.0.0 and `[GAMEASSIST:CORE:HEALTHSERVICE]` after SemanticEvents in the declared core order.
- Normalizes supported official D&D 5E by Roll20 2014 PC `hp` attributes and linked NPC token bar 1 into one documented snapshot shape.
- Publishes immutable `health.transition` semantic events with old/new values, delta, direction, character, optional unambiguous token, page, Roll20 surface, classification, confidence, and provenance.
- Deduplicates one logical linked PC change when Roll20 reports it through both the character attribute and token bar surfaces.
- Requires GameAssist-owned HP writers to supply bounded producer and operation identifiers and verifies the resulting Roll20 value before attaching declared provenance.
- Makes repeated use of the same producer, operation ID, subject, and intent idempotent; conflicting reuse is refused.
- Distinguishes declared damage, healing, initialization, synchronization, clearing, invalid values, and unknown observations without inferring an attacker, damage type, resistance, temporary-HP interaction, spell, or combat cause.
- Keeps recent transition evidence, completed operation identity, pending writes, and deduplication windows bounded in memory; it persists no causal combat ledger and replays nothing after sandbox restart.
- Isolates observer failures through SemanticEvents so one optional consumer cannot interrupt HP changes or another observer.
- Performs no concentration roll, death-history write, healing roll, combat action, damage adjudication, or automatic rollback by itself.
- Adds GM-only `!ga-health`, `!ga-health recent`, and `!ga-health audit` screens for lifecycle state, bounded evidence, and a read-only Player Ribbon page support check.
- Adds HealthService lifecycle and retained-evidence details plus a direct Health Evidence button to `!ga-status --details`.

### GM-private PC health alerts

- Adds the optional Issue #86 PC health-alert consumer without registering another Roll20 HP listener or creating another feature module.
- Stores one protected `HealthService.pcAlerts` configuration object with alert enablement, exact-HP visibility, and independent 50%, 25%, and 10% threshold choices.
- Keeps alerts off by default, keeps all three standard thresholds selected for simple activation, and hides exact HP until the GM deliberately enables it.
- Adds `!ga-health alerts` as the compact GM control screen, including safe preview, alert enable/disable, exact-HP visibility, and individual threshold controls.
- Adds a direct **Manage PC Health Alerts** button and readable summary to the HealthService card in ConfigUI 0.2.3.
- Whispers only the GM when a supported official 2014 PC moves from above an enabled percentage to at or below it.
- Combines every threshold crossed by one large decrease into one ordered notice instead of sending message spam.
- Uses the transition itself as rearm evidence: remaining below a threshold stays quiet, while healing above it permits a later downward crossing to alert again.
- Suppresses alerts for NPCs, initialization, synchronization, clearing, invalid values, non-decreases, unsupported sheets, nonpositive maximum HP, and transitions that also change maximum HP.
- Leaves an unexplained decrease classified as unknown evidence and reports only the observed health-band crossing; it does not claim damage, an attacker, resistance, temporary-HP handling, or combat cause.
- Keeps NPCAssist's existing NPC Bloodied alerts separate and independently configurable, preventing a PC feature from double-reporting NPC policy.
- Includes the protected settings in the configuration-only snapshot while excluding all HealthService event, deduplication, and operation caches.
- Adds a focused 46-check automated harness covering defaults, malformed-setting repair, GM permissions, privacy, clickable settings controls, combined and extreme threshold crossings, repeat suppression, healing rearm, threshold toggles, optional exact HP, NPC exclusion, synchronization and max-change suppression, preview, protected config, snapshot boundaries, and independent alert shutdown.
- Keeps Issue #86 open at the sandbox-verification checkpoint until the complete live Roll20 track passes.

### Initial HealthService adoption

- Advances HPAssist to 0.2.0 and routes supported NPC HP rolls through verified `initialization` or `synchronization` writes with HPAssist producer identity.
- Preserves HPAssist's established direct write behavior when HealthService is deliberately disabled; only shared provenance-aware integration is unavailable.
- Routes supported RestAlmanac HP restoration and HP rollback through HealthService with AlmanacAssist operation identity and verified healing or synchronization evidence.
- Advances DebugTools to 0.3.0 and routes an explicitly applied damage diagnostic through a verified `damage` write on supported HP surfaces while preserving dry-run-first behavior and the established direct fallback for unsupported tokens or a disabled HealthService.
- Leaves NPCAssist's established death, revival, Bloodied, setup-protection, marker, and history behavior unchanged during staged adoption.

### State and lifecycle safeguards

- Adds EffectAssist schema-2 defaults through the existing state self-healing path while preserving valid configuration and unknown state branches.
- Adds the preserved `allowPlayerCasting`, `castRecognition`, and `durationCandidates` configuration keys with defaults of `true`.
- Reports malformed known definitions, instances, and projection records without deleting them automatically.
- Preserves EffectAssist runtime records when the module is disabled and restores command access to the same records when it is re-enabled. Direct public API mutation requests return `UNAVAILABLE` while disabled; read-only inspection remains available.
- Removes active handlers during disable without deleting the public state ledger.
- Keeps MarkerService, ConditionAssist, ConcentrationAssist, and the 2014-sheet adapter behind explicit projection contracts rather than blending their persistent state into EffectAssist.
- Adds explicit policy limits for active effects, history, definitions, targets, request identifiers, player casting flows, retained GM requests, repair grants, names, descriptions, and chat output.

### ConcentrationAssist contract

- Advances ConcentrationAssist from 0.2.2 to 0.3.0 for its lifecycle contract, then to 0.4.0 for optional HealthService-driven check offers without removing or changing its established public command language.
- Adds a public API for resolving the configured marker, checking current concentration, establishing or clearing concentration, and observing lifecycle changes.
- Publishes immutable `concentration.established`, `concentration.failed`, and `concentration.ended` semantic events.
- Allows eligible concentration source tokens on the Objects or GM layer.
- Keeps ConcentrationAssist authoritative for concentration state while EffectAssist responds through public events and marker observation instead of writing ConcentrationAssist's persistent branch.

### HealthService concentration-check offers

- Adds the `healthPrompts` configuration key, enabled by default and independently toggleable by the GM from the ConcentrationAssist Settings screen; players can review the state but cannot change the campaign-wide choice.
- Observes immutable `health.transition` events without making HealthService a hard ConcentrationAssist dependency; disabling HealthService removes only automatic HP-loss offers while all manual concentration commands remain available.
- Offers a check only when a supported character is already carrying the configured concentration marker and the transition is either declared-and-verified `damage` or an unexplained numeric decrease.
- Labels verified GameAssist damage as **Damage** and labels direct Roll20 or third-party decreases as **Observed HP Loss** so an unknown cause is never presented as a proven attack, spell, or damage event.
- Calculates the offered DC as `max(10, floor(HP loss / 2))` and provides Normal, Advantage, and Disadvantage buttons through ConcentrationAssist's existing roll implementation.
- Treats one deduplicated HealthService event as one logical offer even when Roll20 reports a linked PC change through both the sheet attribute and token bar surfaces.
- Whispers the offer to the GM and, only for an Objects-layer token on that controller's currently visible page, each eligible non-GM controller. GM-layer and player-hidden identities remain GM-only.
- Makes each generated offer single-use, sandbox-local, bounded to fifty pending offers, and valid for at most ten minutes.
- Rechecks the exact latest HealthService event, current canonical HP value, character/token identity, active concentration marker, player-page visibility, and current player control before rolling.
- Refuses expired, superseded, already-used, unauthorized, deleted-token, changed-identity, no-longer-concentrating, and disabled-service offers with a private next step.
- Suppresses the public character emote for a GM-layer or player-hidden offered check, preventing hidden-token names or concentration outcomes from leaking to players.
- Keeps healing, initialization, synchronization, clearing, invalid values, unrelated HP changes, and non-concentrating characters silent.
- Does not infer a failed save, end concentration, or end EffectAssist records merely because HP decreased; a player or GM must deliberately choose and resolve the offered check.

### HealAssist guided healing

- Adds disabled-by-default HealAssist 1.0.0 as an independently toggleable feature module that depends only on HealthService and leaves every unrelated module available.
- Supports the official D&D 5E by Roll20 2014 character sheet at launch and refuses the 2024 sheet or an unsupported HP surface rather than guessing field names.
- Provides guided Cure Wounds, Healing Word, Prayer of Healing, Mass Healing Word, Mass Cure Wounds, Heal, Potion of Healing, Greater Healing, Superior Healing, Supreme Healing, and bounded Manual Healing Formula actions.
- Calculates the documented 2014 spell-slot scaling and potion formulas, asks the user to choose Intelligence, Wisdom, or Charisma when an ability modifier is required, and reads that selected modifier from the source character.
- Accepts only bounded simple manual formulas of the form `NdS`, `NdS +/- flat`, or a flat value; Roll20 attributes, ability calls, roll queries, keep/drop expressions, multiplication, and arbitrary compound expressions are refused before rolling.
- Never infers or consumes a spell slot, potion, class resource, feature use, or temporary HP. Every review and completion result states the remaining table responsibility.
- Uses short-lived player-bound source choices and Roll20's native target prompt so a player may choose a visible supported PC without receiving control of that recipient.
- Routes NPC, GM-layer, hidden, and off-page placement through a retained private GM request instead of exposing those recipients or granting direct player HP writes.
- Keeps NPC names, HP values, roll evidence, and completion results private. Optional public completion messages are limited to visible PC recipients and report each recipient's actual restored HP after the maximum-HP cap.
- Adds a GM lock for player-started healing and a public/private safe-result setting without disabling GM workflows.
- Rolls once before mutation and presents the raw dice, complete formula, total, current HP, proposed HP, maximum HP, actual gain, and manual resource step for every recipient.
- Changes no HP until an expiring one-use confirmation is accepted by the authorized actor.
- Revalidates module and HealthService availability, source identity and control, recipient identity and supported surface, current HP, maximum HP, page, and layer before applying the reviewed result.
- Refuses expired, stale, reused, fabricated, wrong-player, changed-control, changed-representation, or changed-HP actions without rerolling or overwriting newer evidence.
- Sends every accepted PC or NPC HP change through HealthService with HealAssist producer identity, a unique operation ID, `healing` classification, and post-write verification.
- Treats multi-recipient healing as one reviewed transaction. Every recipient is revalidated before the first write; if a later write fails, completed recipients receive verified `synchronization` rollback attempts and the action is reported as failed rather than partially complete.
- Adds compact `!Heal`, `!Heal-Menu`, `!Heal-GM`, `!Heal-DM`, Guide/Help, Info, Status, Audit, Manual, Requests, Players, and Results surfaces plus compatibility `!HealAssist-*` routes.
- Creates one stable `GameAssist Guide - HealAssist` handout through the existing module-manual helper.
- Exposes observational `GameAssist.HealAssist.getStatus()` and `getActions()` methods while deliberately withholding a public confirmation or mutation shortcut; other modules use HealthService under their own producer identity.
- Keeps source choices, retained GM requests, rolled proposals, and confirmation capabilities bounded in memory and clears them on module teardown or sandbox restart.
- Adds a focused 64-check automated harness covering catalog and formulas, player authorization, visible non-controlled PC targeting, review evidence, no-write-before-confirmation, HealthService provenance, one-use and stale refusal, maximum-HP capping, manual-formula validation, NPC privacy and GM review, result settings, player lockout, read-only audit, and multi-target rollback.
- Keeps Issue #84 open at the sandbox-verification checkpoint until its complete live Roll20 acceptance track passes.

### AttackAssist guided attacks

- Adds disabled-by-default AttackAssist 1.0.0 as an independently toggleable feature module with no required feature-module dependency and an enabled-by-default player-guided setting that the GM may lock.
- Supports linked official D&D 5E by Roll20 2014 PC repeating attacks at launch. Official 2024 characters, NPC action formulas, unlinked tokens, and unsupported sheets receive a clear refusal while their native sheet controls remain available.
- Verifies the source token layer, linked character, official-2014 PC attributes, current controller, current visible page, and player-access setting before accepting a player source.
- Treats an explicit selected token as authoritative. An unsupported selection does not silently fall back to another eligible character on the page.
- Reads repeating attack rows in the sheet's saved `_reporder_repeating_attack` order and uses the persistent Roll20 row ID rather than the attack display name as the action identity.
- Adds numbered labels when multiple rows share the same name, allowing the user to choose the intended row without changing either character-sheet entry.
- Refuses rows without a verified official `atk` or `atkdmg` rollbase instead of constructing an inferred attack formula from partial attributes.
- Uses Roll20's native target query for visible tokens so a player can target a creature they do not control without gaining token control or exposing a raw token list.
- Retains hidden, GM-layer, and off-page placement as a bounded private GM request. Player confirmation and completion messages never reveal the hidden target's name or placement.
- Offers **Use Sheet Setting**, **Normal**, **Advantage**, and **Disadvantage** from one final review.
- Preserves the verified sheet-generated rollbase and substitutes the official 2014 roll-mode fragment rather than temporarily mutating the character's saved `rtype` attribute.
- Qualifies top-level and repeating-row attribute references to the exact acting character and exact stable attack row, including the generated damage and critical-damage action links.
- Submits the accepted roll as `character|id`, preserving familiar character attribution and allowing CritAssist to observe the official attack card through its established natural-1 path.
- Consumes the reviewed submission before calling Roll20 chat, then announces a visible attacker and target only after the roll callback. A reused roll button cannot submit or announce again.
- Binds source choices, placement requests, and submissions to the initiating player, expires them after ten minutes, bounds each collection to fifty records, and clears all transient capabilities on module teardown or sandbox restart.
- Revalidates module state, player permission, source identity and control, exact repeating row, target page and layer, and one-use submission immediately before rolling.
- Refuses expired, stale, reused, fabricated, changed-row, wrong-player, changed-control, changed-page, deleted-token, and unsupported-source paths with a clear route to start again.
- Leaves target HP, markers, effects, conditions, position, token properties, character resources, campaign state, initiative, rounds, and turns unchanged. AttackAssist guides the roll but does not resolve its consequences.
- Adds compact `!Attack`, `!Attack-Menu`, `!Attack-GM`, `!Attack-DM`, Guide/Help, Info, Status, Audit, Manual, Requests, Players, and compatibility `!AttackAssist-*` surfaces.
- Creates one stable `GameAssist Guide - AttackAssist` handout through the existing module-manual helper.
- Exposes observational `GameAssist.AttackAssist.getStatus()` and `listAttacks(characterId)` methods while deliberately withholding a public target-selection or roll-submission shortcut.
- Bases the implementation on Roll20's documented repeating-attack button syntax and the official 2014 legacy sheet's `roll_attack`, `rollbase`, `rtype`, `atk`, and `atkdmg` contracts rather than an independently invented card format.
- Adds one One-Click conflict warning for another script or macro that guides or automatically submits the same repeating attack or announces the same attacker and target.
- Adds a focused 55-check automated harness covering stable order and duplicate labels, unsupported sheets, native target prompts, all four roll modes, exact row qualification, character sender, post-roll announcement, one natural-1 delivery to CritAssist, stale and reused refusal, cross-player authorization, hidden-target privacy, player lockout, read-only audit, stable manual creation, and no target or campaign mutation.
- Keeps Issue #87 open at the sandbox-verification checkpoint until its complete live Roll20 acceptance track passes.

### Effect duration providers

- Advances EffectAssist from 2.0.0 to 2.1.0 and its durable state schema from 2 to 3.
- Adds formal encounter-round, world-minute, and ending-rule metadata to each built-in launch definition.
- Records a CombatAssist anchor only when an active accepted encounter exists on the effect source's page, including the encounter identity, current round, current initiative identity, and target round.
- Records an Almanac anchor only when TimeAlmanac is available, including the committed starting minute, target minute, and revision.
- Advances CombatAssist from 1.0.5 to 1.1.0 with stable encounter identity, monotonic accepted-forward progression, and immutable schema-1 encounter and turn events.
- Publishes CombatAssist start, rebase, attention, pause, resume, end, forward-turn, and backward-turn observations without exposing a consumer tracker-write method.
- Creates a private GM expiration candidate only after an accepted forward CombatAssist boundary or committed forward Almanac boundary is reached.
- Creates an encounter-end reminder, rather than an expiration claim, when CombatAssist ends before an anchored round boundary can be verified.
- Keeps every effect active until an existing explicit ending path succeeds; no duration callback removes markers, sheet rows, concentration, or semantic records automatically.
- Lets the GM end the exact effect, keep it active by dismissing the candidate, or reopen a dismissed candidate through `!Effect-Duration`.
- Adds `!Effect-Durations on|off` so candidate processing can be disabled without deleting active effects, provider anchors, or prior review evidence.
- Ignores backward turns, tracker rebases, initiative edits, and backward Almanac movement as elapsed-duration proof.
- Compares a large committed Almanac jump once and deduplicates providers so the same elapsed boundary does not produce repeated expiration candidates.
- Reconciles persisted anchors after module initialization and when the GM opens Duration Review following re-enable; SemanticEvents remains non-persistent and no elapsed event history is replayed.
- Migrates existing schema-2 effects without inventing retrospective start times. Those effects retain their original duration label and receive an explicit manual-duration note.
- Leaves effects manual when no provider was active at application time, the GM disabled duration candidates, or a custom duration replaced the catalog wording.
- Adds GM-facing duration state to EffectAssist Status, Active Effects, the Control Center, Quick Guide, and the stable manual handout.
- Exposes defensive `getDurationCandidates()` and deliberate `reconcileDurations()` inspection methods while preserving the existing lifecycle observer contract.
- Adds bounded policy limits for retained duration candidates, encounter-round values, and world-minute values.
- Passes 40 focused local duration-provider checks, 34 ConcentrationAssist/HealthService regression checks, 70 HealthService checks, and JavaScript syntax validation. Live Roll20 duration-provider acceptance remains required before Issue #80 is complete.

### Complete AlmanacAssist module

- Adds AlmanacAssist 1.0.0 as one disabled-by-default GameAssist module containing TimeAlmanac, ClimateAlmanac, AstronomyAlmanac, WeatherAlmanac, EnviroAlmanac, and RestAlmanac.
- Keeps all six internal systems in the v2.0.0 release gate. AlmanacAssist is not published as a Time-only or otherwise partial module.
- Lets the GM turn each internal system on or off independently without deleting its valid configuration, current state, definitions, or bounded history.
- Gives every system useful fallback behavior when an optional context provider is off: Astronomy can use a manual day and season, Weather can use fallback climate/time context, Environment can use a manual preset or override, and Rest can operate without advancing TimeAlmanac.
- Adds a private master control center, compact Guide/Help, Systems screen, Status, read-only Audit, Info, and one stable AlmanacAssist manual handout.
- Adds concise case-insensitive routes through `!Almanac-*`, `!aa-*`, `!date`, `!time`, `!cal`, `!clim`, `!astro`, `!weather`, `!enviro`, and `!rest`.

### TimeAlmanac

- Stores one elapsed fictional-minute value as the chronology authority instead of persisting a separate mutable date for every calendar.
- Adds Standard, current 28-day Solamnic, Harptos, and campaign-edited Wayfarer calendar profiles.
- Preserves the same elapsed moment when a GM changes profiles, so switching the presentation does not reset or silently move world time.
- Supports deliberate forward advancement, confirmed backward movement, and confirmed exact setting with bounded history and semantic time-change events.
- Allows Wayfarer campaigns to define bounded weekday names, month names and lengths, intercalary festival days, leap rules, and dated holidays.
- Provides players a read-only current date/time view while keeping calendar mutation and setup GM-only.
- Keeps fictional world time separate from GameAssist's real-world table timezone, status/log timestamps, and NPCAssist's date-managed Session rollover.
- Does not reverse weather, rests, effects, or other past events when time is moved backward; the command warns and records the chronology change instead.

### Guided Wayfarer calendar setup

- Advances AlmanacAssist from 1.0.0 to 1.1.0 and adds a versioned persistent Wayfarer draft that remains separate from the active campaign calendar.
- Replaces the single crowded edit panel with a dedicated setup home and six guided stages for calendar identity and starting date, weekdays, months, intercalary festival days, leap behavior, and holidays.
- Shows setup progress and a compact calendar summary on every stage, with consistent Back, Save Draft, and Continue controls.
- Adds a readable review and preview screen that shows unequal month lengths, festival and leap days, holidays, and the proposed starting date before activation.
- Allows the GM to leave setup, reload the sandbox, and resume the saved draft without exposing partial calendar work to players.
- Keeps invalid edits atomic: the last valid draft, active calendar, and current fictional date remain unchanged when a submitted stage fails validation.
- Lets the GM duplicate Standard, Solamnic, Harptos, or the saved Wayfarer definition into an editable draft without changing the active profile.
- Explains that a Standard-to-Wayfarer copy uses Wayfarer's repeating four-year leap interval and therefore does not reproduce Gregorian century exceptions.
- Uses the reviewed starting date for a first Wayfarer activation while preserving elapsed fictional minutes when an already-active Wayfarer definition is edited.
- Refuses an active-definition edit when the revised calendar cannot represent the existing elapsed time, then offers a separately labeled reset-to-draft-start path instead of moving time silently.
- Retains one complete pre-activation calendar-and-time checkpoint in runtime history for deliberate rollback; configuration snapshots continue to contain configuration rather than runtime recovery data, and discarding a draft removes only unactivated work.
- Expands the generated AlmanacAssist manual with plain-language calendar concepts, a complete worked example, activation behavior, editing, rollback, troubleshooting, and recovery.
- Adds focused Issue #89 coverage for draft/live separation, progress, invalid-input preservation, unequal month lengths, intercalary days, leap rules, multiple holidays, activation, elapsed-time preservation, duplication, cancellation, rollback, and manual content.

### Direct Wayfarer management, seasons, and astronomy visibility

- Advances AlmanacAssist from 1.1.2 to 1.2.0 and the saved Wayfarer draft schema from 2 to 3.
- Replaces the sequential-first Wayfarer home with a direct calendar manager whose primary controls open Name/Clock/Start, Weekdays, Periods, Festival Days, Leap Rule, Holidays, and Seasons independently.
- Retains a guided review route for first-time setup without requiring experienced GMs to pass through unrelated stages for a small change.
- Adds validated seasonal-range editing with named start and end dates, support for ranges that cross the year boundary, and overlap refusal.
- Adds seasons to draft completeness, preview, activation, validation, period-replacement invalidation, the stable manual, and release acceptance.
- Surfaces current moon phases in the Almanac control center, current date/time response, Wayfarer manager, and draft preview while keeping moon cycles, offsets, and phase names under Astronomy ownership.
- Adds case-insensitive focused-system role and reference aliases with either spaces or hyphens, including `!Weather-GM`, `!weather dm`, `!Weather-Help`, `!Weather-Status`, and `!Weather-Audit`.
- Adds `!aa-wayfarer reset-default --confirm yes` as an intentionally buttonless recovery command that replaces only the saved draft with the campaign Wayfarer default. The active calendar and fictional time remain unchanged.
- Changes calendar-profile confirmation to ask explicitly for confirmation and state that elapsed calendar time is preserved.
- Keeps invalid calendar edits atomic and preserves the separate draft, explicit activation, elapsed-time behavior, and one rollback point established by AlmanacAssist 1.1.x.

### Almanac documentation and MECHSUITS consistency repair

- Corrects the executable's current-release banner and module inventory to identify AlmanacAssist 1.2.0 and ConfigUI 0.2.5 instead of the superseded 1.1.1 and 0.2.4 checkpoints.
- Corrects the README's current module table, release gate, and embedded v2.0.0 history, and updates the roadmap's Issue #89 checkpoint to describe the direct Wayfarer Calendar Manager.
- Preserves AlmanacAssist 1.0.0, 1.1.0, 1.1.1, and 1.1.2 notes as labeled historical context rather than erasing or relabeling earlier implementation decisions.
- Adds inline contracts for calendar-date offset conversion, seasonal-range reconstruction and validation, current moon summaries, and focused command normalization.
- Expands AlmanacAssist's MECHSUITS decision log to record direct-versus-guided editing, cross-year seasonal storage, Astronomy ownership of moon data, command-only draft recovery, and alias reuse of existing handlers.
- Records the related ConfigUI, command-interface, and shared-utility decisions for service-first alphabetical grouping and bounded chat summaries while retaining complete snapshot evidence.
- Keeps `GameAssist`, `GameAssist-v2.0.0`, and `GameAssist.js` byte-identical after the correction.

### AlmanacAssist 1.3.0 action-first controls and focused Wayfarer navigation

- Advances AlmanacAssist from 1.2.0 to 1.3.0 without changing its calendar-state schema or Wayfarer draft schema.
- Rebuilds `!aa-gm` around the actions used during play: the current fictional moment; quick and chosen date/time advances; exact date/time setting; calendar selection; Wayfarer access; announcement preview and delivery; weather, moons, climate, environment, and rest.
- Moves system toggles, status, audit, and long-form reference material behind **More Almanac Tools** so routine use no longer gives technical evidence the same visual priority as table actions.
- Makes exact-time prompts derive their valid hour and minute ranges from the active calendar. The campaign Wayfarer Calendar therefore offers hours 0-19 and minutes 0-74 instead of Gregorian clock bounds.
- Adds bounded announcement settings for public or GM-only delivery and quick or full world detail. `!aa-preview` always remains private, while `!aa-announce` follows the saved audience setting.
- Preserves the earlier public-summary behavior as the fallback for missing or malformed announcement configuration and self-heals that known configuration branch during module initialization.
- Lets the calendar chooser activate the last saved complete Wayfarer calendar directly after confirmation, without requiring the GM to revisit draft-construction screens.
- Rebuilds the Wayfarer home around **Use**, **Edit Calendar**, **Start From a Copy**, **Details**, **Recovery**, and **Help**. Focused component editors show only their current value and relevant controls.
- Moves teaching examples and terminology behind **Explain This**, structural evidence behind **Details**, and rollback/reset guidance behind **Recovery**. The complete worked calendar example remains available in the generated AlmanacAssist manual.
- Retains draft/live separation, atomic validation, explicit activation, elapsed-fictional-time preservation, one rollback point, command-only default-draft recovery, Astronomy ownership of moon cycles, and all six independently controlled Almanac systems.
- Adapts the useful owner-versus-presentation and focused-editor principles from the standalone campaign-calendar proof of concept and Fantasy Calendar's documented interface model to Roll20 chat controls; no external calendar service or runtime dependency is introduced.

### MECHSUITS version-evidence verification

- Rechecks all 32 framed sections for paired tags, proper physical nesting, present parents, canonical-tree agreement, owner-authoritative codename and area metadata, `last_updated_version`, and required **Notes & Comments** footers.
- Confirms the current AlmanacAssist banner inventory, section metadata, runtime constant, startup message, generated manual, README, roadmap, smoke test, and package description identify the 1.3.0 checkpoint; older 1.0.0-1.2.0 references remain only where they document historical changes.
- Corrects CombatAssist's isolated runtime version display from 1.1.1 to the owner-authoritative 1.1.0 already recorded by its section metadata, release inventory, and changelog. This maintenance correction changes no encounter behavior.
- Keeps the canonical tree and section-tag inventory unchanged because no section was added, removed, moved, or renamed.

### ClimateAlmanac

- Adds bounded built-in temperate, arctic, desert, tropical, coastal, mountain, and swamp climate profiles.
- Allows the GM to edit built-in starting profiles, restore them deliberately, and create or remove bounded custom profiles with unique names.
- Adds bounded named regions with parent identifiers, actual parent-profile inheritance, regional overrides, and one active region.
- Makes a child that inherits continue following its current parent rather than copying a stale profile value at creation.
- Provides a manual season fallback for campaigns that do not use TimeAlmanac.
- Refuses ambiguous profile/region names, duplicate names, invalid parents, excessive nesting, and removal of a profile still assigned to a region without partially changing state.

### AstronomyAlmanac

- Adds multiple configurable moons with unique names, bounded cycle lengths, offsets, and campaign-defined phase names.
- Calculates reproducible moon phases, daylight, and deterministic equinox/solstice boundaries from TimeAlmanac when available or explicit manual day/season context otherwise.
- Adds bounded read-only future moon/daylight forecasts that do not advance the current fictional time.
- Adds a separate bounded weighted rare-event catalog for omens and unusual celestial suggestions.
- Keeps rare-event selection distinct from deterministic phases and season boundaries so adding an omen never changes the underlying astronomy result.
- Refuses invalid cycles, offsets, phase lists, names, or weights without partial mutation.

### WeatherAlmanac

- Generates structured current weather with a readable summary, temperature, wind, precipitation, cloud cover, visibility, severity, duration, and bounded tags.
- Uses continuity-aware transitions so a new result relates to current conditions instead of behaving as an unrelated redraw.
- Improves generation with optional Time and Climate context but remains operational through documented fallbacks when either system is off.
- Adds bounded read-only forecasts, explicit manual weather, lock/unlock controls, history, and semantic weather events.
- Keeps forecast results separate from committed current weather and refuses to replace a locked or manual condition silently.
- Returns no active weather context while WeatherAlmanac is disabled, preventing consumers from mistaking preserved state for a current result.

### EnviroAlmanac

- Derives structured visibility, temperature, precipitation, wind, ground, water, exposure, severity, and tags from committed weather when available.
- Adds clear, blizzard, desert, swamp, and underwater manual presets plus a bounded custom GM override.
- Keeps a manual override authoritative until it is deliberately cleared, including when WeatherAlmanac later generates a new result.
- Remains usable without WeatherAlmanac and returns no active context while disabled.
- Is descriptive in v2.0.0: it does not automatically impose penalties, change rolls, move tokens, apply markers, or write character sheets.
- Refuses invalid severity or oversized tag lists without partial mutation.

### RestAlmanac

- Adds Short, Long, optional Extended, and bounded custom rest workflows for selected linked official D&D 5E by Roll20 2014 PC tokens.
- Requires a preview before every write, binds confirmation to the requesting player, expires it after a bounded interval, and revalidates token control, represented character, sheet eligibility, and every proposed field value immediately before writing.
- Leaves Hit Die spending to the native sheet during Short Rest and optionally advances fictional time only when that exact choice appeared in the accepted preview.
- Restores verified current HP to maximum, recovers half maximum Hit Dice with a minimum of one, and restores remaining spell slots to verified totals during Long Rest.
- Avoids guessing at class resources, NPC fields, 2024-sheet fields, third-party-sheet structures, or undocumented aggregate values.
- Performs the supported writes as one transaction, verifies Roll20's accepted values, and rolls completed writes back where possible if a later required write or optional TimeAlmanac advance fails.
- Refuses stale confirmations when HP, HP maximum, Hit Dice maximum, a spell-slot total, control, representation, or the promised TimeAlmanac availability changed after preview.
- Records bounded rest history and semantic events without making other Almanac systems depend on RestAlmanac.

### AlmanacAssist state and public contracts

- Adds bounded policy limits for histories, regions, nesting depth, climate profiles and tags, temperature ranges, moons, phases, rare events and weights, forecasts, holidays, rest grants, and custom rests.
- Protects the structured Almanac configuration branches from unvalidated generic `!ga-config` writes; guided setup screens validate a complete change before committing it.
- Adds `GameAssist.AlmanacAssist` with separate module and Time availability checks, defensive context getters, system-state inspection, and filtered semantic-event observation.
- Returns `null` for disabled active-context systems instead of exposing preserved weather, environment, climate, astronomy, or time as though it were currently authoritative.
- Preserves unknown state branches for warning-only auditing and repairs malformed known containers through the existing conservative self-healing path.
- Keeps RestAlmanac as the only initial Almanac character-sheet writer; Time, Climate, Astronomy, Weather, and Environment remain world-state or descriptive services.

### Verification and release gate

- JavaScript syntax parsing passes for the complete v2.0.0 executable.
- MECHSUITS structural validation finds 32 correctly nested and paired sections, exact file-scoped canonical-tree agreement, matching section metadata, and required footers. This structural check does not by itself claim complete v1.5.2 compliance.
- Seventy focused HealthService semantic transitions pass for supported 2014 PC and linked-NPC snapshots, linked event deduplication, legitimate repeated-transition preservation, explicit damage/healing/initialization provenance, unknown external changes, blank/invalid handling, immutable payloads, observer isolation, idempotent operation identity, bounded evidence, and disabled-service refusal.
- Thirty-four focused ConcentrationAssist/HealthService checks pass for default configuration, GM-only setting control, linked-event deduplication, GM/controller privacy, unrelated-player refusal, unknown-versus-verified wording, DC calculation, advantage roll evidence, last-damage compatibility, single use, stale HP, ended concentration, silent healing/synchronization, module opt-out, disabled-service fallback, verified DebugTools damage, hidden NPC privacy, and unchanged manual checks.
- One hundred nine focused EffectAssist regression checks pass for the launch catalog, complete Bless automation, Guidance's global skill row, concentration cleanup and replacement, overlapping ownership, cross-adapter sharing, idempotency, preserved baseline state, edited-row preservation, NPC fallback, player authorization and lockout, audit/repair, and lifecycle handling.
- Thirty-four focused EffectAssist player-casting checks pass for opaque source choices, visible non-controlled targeting, retained GM placement requests, direct GM controls, hidden-recipient privacy, actor/stage/expiry revalidation, lock invalidation, single use, and visible stale-button recovery.
- Thirty focused cast-recognition checks pass for exact 2014 Bless evidence, real-player actor identity, private proposal creation, non-mutating recognition, target-text refusal, duplicate suppression, missing-selection recovery, normal preview/confirmation reuse, single use, stale authorization, player lockout, unsupported spells, ambiguous characters, the recognition toggle, manual catalog availability, and unchanged concentration replacement.
- Sixty-four focused HealAssist checks pass for the supported 2014 action catalog, exact formulas and roll evidence, source authorization, visible non-controlled PC targeting, no mutation before review, HealthService provenance, duplicate and stale refusal, maximum-HP capping, bounded manual formulas, NPC privacy and retained GM review, result settings, player lockout, read-only audit, and verified multi-target rollback attempts.
- One hundred seven focused AlmanacAssist checks pass for all six systems, calendar/profile boundaries, Wayfarer configuration, climate inheritance, astronomy configuration and forecasting, weather continuity and locks, environment overrides, rest preview/revalidation/rollback, independent toggles, preserved state, public availability, and focused audits.
- Thirty-six focused Wayfarer setup checks pass for draft/live separation, guided progress, invalid-input preservation, unequal month lengths, festival days, leap rules, holidays, starting-date activation, elapsed-time-preserving edits, profile duplication, draft cancellation, one-step rollback, and generated manual content.
- The maintained v2.0.0 regression sweep passes 454 functional checks across cast recognition and Guidance evidence, concentration/health integration, effect durations, HealthService, HealAssist, PC health alerts, AttackAssist, player-casting and suite navigation, and Wayfarer setup. The suite-navigation group includes mixed-case and space/hyphen command variants, single-route dispatch, preserved `--options`, and shared private-control presentation checks.
- `script.json` parses with the expanded v2.0.0 command and description additions.
- Release acceptance includes the clean-install and v1.8.2 upgrade tracks in `Smoketest.md`, focused HealthService, EffectAssist, and HealAssist checks, and the complete six-system AlmanacAssist track in the live Roll20 Mod sandbox.

### Deliberate exclusions

- No 2024-sheet or third-party-sheet effect writes.
- No automatic effect application, concentration change, or recipient inference from spell-card text; supported official 2014 Bless cards create private GM proposals only.
- No automatic spell-slot, potion, class-resource, feature-use, temporary-HP, or arbitrary spell-card handling in HealAssist; the reviewed workflow applies supported HP only.
- No HP-loss effect offers.
- No automatic concentration roll or automatic concentration ending from HP loss; v2.0.0 offers a private revalidated choice and waits for an authorized click.
- No automatic turn, round, encounter, or world-time expiration.
- No automatic environmental penalties, weather-driven markers, or unverified class-resource rest writes.
- No 2024-sheet, NPC-sheet, or third-party-sheet RestAlmanac writes.
- No replayable event ledger or queueing of ordinary event handlers.
- No automatic deletion of malformed or unknown saved state.
- No passive targeting guesses from chat text, WildShape identity guesses, or unsupported aggregate sheet-field rewrites.

---

## [1.8.2] – 2026-07-28

### Release definition

GameAssist v1.8.2 adds optional page-local progressive naming for newly added linked NPC tokens and corrects HPAssist's public command routing. NPCAssist advances from `1.3.3` to `1.4.0`, and HPAssist advances from `0.1.1.2` to `0.1.1.3`.

The feature prevents accidental same-page NPC token-name collisions without introducing a campaign counter, rewriting existing tokens, renaming represented characters, or preventing a GM from deliberately creating duplicate names later.

### Naming contract

- Added the `autoNumberNpcTokens` NPCAssist configuration key, enabled by default.
- Applies only when a linked character is explicitly marked `npc=1` and the newly added token is on the Objects or GM layer.
- Uses the represented character's current nonblank name as the base name, falling back to the token's nonblank name only when necessary.
- Reads other eligible NPC token names on the new token's page at that moment.
- Keeps the unsuffixed base name when it is available.
- When the base name is already used, assigns the lowest available positive suffix: `Goblin 1`, `Goblin 2`, and so on.
- Compares names without case sensitivity so cosmetic capitalization does not create an accidental collision.
- Existing tokens are never renamed, renumbered, reordered, or otherwise changed.
- Deleted names become available again. Sandbox restarts require no repair because no sequence counter is stored.
- A later manual rename remains untouched, including a deliberate duplicate.

### Eligibility and safeguards

- Skips player characters, unlinked tokens, map-layer graphics, missing represented characters, unreadable NPC identity, and blank base names without chat spam.
- Changes only the new token's `name`.
- Does not change `showname`, character names, HP, bars, markers, layer, controllers, vision, lighting, death history, report buckets, Arc records, or handouts.
- Runs synchronously in NPCAssist's existing `add:graphic` handler before the HPAssist initialization guard is established.
- Preserves HPAssist automatic HP rolling and NPCAssist's protection against false death, revival, or Bloodied events.

### Game Master controls and documentation

- Adds a state-aware **Automatic NPC Names** Turn On or Turn Off button to the NPCAssist Control Center.
- Adds `!npc-numbering` and equivalent NPCAssist command-family aliases; each toggles once and redraws the Control Center.
- Adds the setting to NPCAssist status, its persistent manual, the README configuration reference, One-Click command metadata, and the focused smoke test.
- Keeps successful automatic naming quiet during ordinary token setup.

### HPAssist command routing

- Makes case-insensitive `!HP-<command>` and `!hp <command>` the generated and documented HPAssist command surface.
- Updates HPAssist buttons, startup guidance, README examples, smoke tests, and One-Click command metadata to use the canonical names.
- Prevents NPCAssist's broad `!npc-*` unknown-command recovery from intercepting deprecated `!npc-hp-*` macros.
- Retains `!HPAssist-*`, `!npc-hp-*`, `!NPCHP-*`, and `!NPCHPRoller-*` as compatibility aliases for existing campaign macros.
- Does not change HP formula parsing, token eligibility, bar writes, automatic rolling, or NPCAssist initialization protection.

### Verification and release gate

- JavaScript syntax parsing passes for the v1.8.2 executable candidate.
- Focused deterministic naming tests cover unsuffixed first use, collision suffixes, gap reuse, page independence, case-insensitive comparison, disabled behavior, and noneligible-token exclusions.
- The release artifacts are byte-identical with SHA-256 `0864AFB434DAF13BD4A8C6B1F24F0BF7C4A4657C5BD8732C7222EEBC17D0A505`.
- Roll20 acceptance must confirm real `add:graphic` ordering, object/GM-layer behavior, Control Center toggling, rapid multi-token additions, and HPAssist coexistence.

### Deliberate exclusions

- No bulk rename command or repair pass for existing duplicate names.
- No campaign-wide, character-wide, creation-order, or persistent counter.
- No renaming of represented characters.
- No enforcement after an ordinary manual token-name change.
- No change to death, Bloodied, marker, history, Arc, handout, initiative, combat, condition, token-control, concentration, HP-roll, or welcome behavior.

---

## [1.8.1] – 2026-07-28

### Release definition

GameAssist v1.8.1 is a focused NPCAssist update. It can privately notify the GM when an eligible living NPC crosses from above half of its maximum HP to half HP or below. The release preserves v1.8.0's canonical module identities and keeps the new notice outside death markers, death history, Arc records, and public chat.

NPCAssist advances from `1.3.2` to `1.3.3`. No other module's independent version changes.

### Bloodied threshold behavior

- Added the `notifyBloodied` NPCAssist configuration key, enabled by default.
- Uses the Roll20 `change:graphic:bar1_value` event's previous and current values as the threshold evidence.
- Alerts only when previous HP was above half, current HP is half or below, current HP remains above 0, and current bar 1 maximum HP is numeric and positive.
- Does not repeat while HP remains at or below half.
- Naturally rearms after healing above half; a later qualifying drop can notify the GM again.
- A direct drop to 0 or below remains a death event and does not also produce a Bloodied notice.

### Eligibility, privacy, and safeguards

- Restricts Bloodied notices to linked object-layer tokens whose represented character has `npc=1`.
- Ignores player characters, unlinked tokens, GM-layer tokens, blank or non-numeric HP, and blank, zero, negative, or non-numeric maximum HP.
- Reuses HPAssist's new-token initialization grace period so automatic HP setup cannot create a false Bloodied notice.
- Whispers only the GM and includes the NPC name plus current/maximum HP.
- Adds no Bloodied marker, persistent per-token threshold state, death-history entry, report-bucket entry, or Arc record.
- Leaves `autoTrackDeath`, MarkerService requests, revival annotations, auto-hide behavior, audits, repair, and report writing unchanged.

### Game Master controls and documentation

- Adds Bloodied notice state to `!npc-death-status` and the NPCAssist manual.
- Adds a state-aware one-click Bloodied toggle to the NPCAssist Control Center; `!npc-bloodied` and the equivalent command-family aliases toggle the setting and immediately redraw the controls.
- Keeps the setting available through existing configuration controls, including `!ga-config set NPCAssist notifyBloodied=false`.
- Updates the README configuration reference, release sequence, upgrade guidance, module behavior, and current release notes.
- Updates the public roadmap with v1.8.0 completion, v1.8.1 active work, and deferred Issue #72 for safe GameAssist handout organization while Roll20's Mod API folder hierarchy remains read-only.
- Adds a focused v1.8.1 Roll20 smoke track covering threshold crossing, repeat suppression, rearming, privacy, invalid maxima, death separation, and HPAssist initialization.

### Verification and release gate

- JavaScript syntax validation passes for `GameAssist`, `GameAssist.js`, and `GameAssist-v1.8.1`.
- Seven executable harnesses pass 504 assertions across NPCAssist threshold behavior, v0.1.4.7 state migration, module lifecycle, MarkerService and ConditionAssist behavior, TokenAssist, timezone handling, InitiativeAssist, CombatAssist, and WelcomeAssist.
- The focused Issue #64 static harness passes 232 checks covering the Bloodied contract, retained canonical module ownership and aliases, MECHSUITS nesting and canonical-tree agreement, One-Click metadata, previous-version ordering, and artifact identity. The complete local verification total is 736 checks.
- `GameAssist`, `GameAssist.js`, and `GameAssist-v1.8.1` are byte-identical with SHA-256 `01BB828FA3E76CCFBB1DEC5AFEC770D98D19AB1E4941A38CC0FAAD858576FEC5`.
- Roll20 sandbox acceptance must confirm the real `change:graphic:bar1_value` transition behavior and GM-only delivery.

### Deliberate exclusions

- No configurable Bloodied percentage in v1.8.1; the threshold is fixed at 50%.
- No Bloodied status marker, public announcement, player whisper, history record, handout entry, or Arc integration.
- No progressive NPC naming; that remains v1.8.2 work under Issue #65.
- No EffectAssist, AlmanacAssist, TokenAssist parity, or CombatAssist backlog implementation.

---

## [1.8.0] – 2026-07-28

### Release definition

GameAssist v1.8.0 is a compatibility-preserving module-identity release. It adopts **CritAssist**, **NPCAssist**, **ConcentrationAssist**, and **HPAssist** as the canonical names for the four remaining inherited modules while retaining the commands, settings, history, and campaign workflows established under CritFumble, NPCManager, ConcentrationTracker, and NPCHPRoller.

This release also begins three-part GameAssist project versioning. The transition is from `v0.1.7.0` to `v1.8.0`; historical release numbers are not rewritten. Each module's independent version remains unchanged because the migration changes project-level ownership and naming rather than the module's established gameplay contract.

### Canonical module identities

- Renamed the four runtime registrations, lifecycle owners, dependency references, log speakers, configuration labels, public menus, manual titles, MECHSUITS tags, and canonical-tree entries.
- Kept HP rolling in its own HPAssist module. NPCAssist owns NPC state, death/revival history, reports, audits, and Arc records; HPAssist owns deliberate and optional automatic `npc_hpformula` rolls.
- Updated MarkerService dependents to NPCAssist and ConcentrationAssist without changing marker resolution, mutation, observation, teardown, or dependent-service safeguards.
- Updated module health, configuration, and startup output so only canonical names appear as active components.

### State and handout migration

- Added a one-time valid-state migration from `CritFumble` to `CritAssist`, `NPCManager` to `NPCAssist`, `ConcentrationTracker` to `ConcentrationAssist`, and `NPCHPRoller` to `HPAssist` before startup auditing.
- Uses destination-first merging: an already valid canonical value wins, while valid missing values from the old branch are retained.
- Removes a well-formed old branch only after its valid data has been incorporated. Unknown branches and malformed old branches remain untouched so the state auditor can report them for diagnosis.
- Canonicalizes legacy names passed to GameAssist state/configuration helpers, preventing an accepted old configuration command from recreating a second old-name branch.
- Preserves NPCAssist Campaign, Chapter, Section, Session, Arc, death, and revival records, along with all valid module enablement and configuration values.
- Extends stable manual handling so one unambiguous old `GameAssist Guide - <LegacyName>` handout is adopted, renamed, and updated. Multiple legacy matches are refused instead of guessed or overwritten.

### Command and API compatibility

- Added canonical `!CritAssist-*`, `!NPCAssist-*`, `!ConcentrationAssist-*`, `!HP-*`, and `!HPAssist-*` command families.
- Preserved established `!critfumble*`, `!critfail`, `!NPC-*`, `!NPC-Death-*`, `!NPCManager-*`, `!concentration`, `!Concentration-*`, `!Con-*`, `!cc`, `!npc-hp-*`, `!NPCHP-*`, and `!NPCHPRoller-*` forms.
- Ensured new and legacy HP command families share one dispatcher, including Guide, GM/DM, Status, Info, Audit, Settings, Manual, selected/page rolls, and friendly unknown-command recovery.
- Retained `GameAssist.NPCManager` as a compatibility reference to `GameAssist.NPCAssist`; canonical consumers should use the new public name.
- Continued the older `!token-mod` spelling as a v1.x compatibility alias with removal no earlier than GameAssist v2.0.0. The version-format change does not silently expire an existing command.

### Documentation and release surfaces

- Updated the executable banner, module inventory, project version, runtime version, MECHSUITS section metadata, and file-scoped canonical tree.
- Updated README module guides, command/configuration examples, upgrade guidance, architecture diagram, and release sequence.
- Updated `Smoketest.md` with a clean v1.8.0 path and a focused v0.1.7.0 upgrade path covering state, records, aliases, and handout adoption.
- Updated `ROADMAP.md` with the accepted sequence: v1.8.0 naming migration, v1.8.1 Bloodied alerts, v1.8.2 progressive NPC naming, EffectAssist Phase A in v2.x, AlmanacAssist phases in v2.y, and deferred TokenAssist/CombatAssist work in v2.z.
- Updated One-Click metadata and retained the previous v0.1.7.0 artifact as the immediate rollback source.

### Verification

- JavaScript syntax validation passes for the complete v1.8.0 candidate.
- The existing automated suites pass 488 checks across state migration, module lifecycle, MarkerService and ConditionAssist behavior, TokenAssist behavior, timezone handling, InitiativeAssist, CombatAssist, and WelcomeAssist.
- The focused Issue #60 harness passes 224 checks covering canonical state ownership, destination-first merges, malformed-source preservation, legacy configuration aliases, dependent-service names, command routing, unknown-command recovery, old-guide adoption, MECHSUITS structure, metadata, and artifact identity. Together with the established suites, v1.8.0 passes 712 automated checks.
- `GameAssist`, `GameAssist.js`, and `GameAssist-v1.8.0` are byte-identical with SHA-256 `5C16D23FC46D88FF871B45E684EAB0AD86D08607958D70DA89D196D9D14BA9B2`.
- Final acceptance still requires the focused Roll20 clean-install and v0.1.7.0 upgrade smoke tracks. Roll20 remains the authority for live sandbox behavior.

### Deliberate exclusions

- No Bloodied alert behavior; that is scoped to v1.8.1 under Issue #64.
- No progressive NPC naming; that is scoped to v1.8.2 under Issue #65.
- No EffectAssist or AlmanacAssist implementation.
- No removal of established legacy commands or destructive cleanup of malformed state.
- No change to initiative, combat, welcome, condition, token, marker, timezone, or NPC-history gameplay rules beyond the renamed ownership references required for migration.

---

## [Unreleased]

### Immediate release work

- Complete the real Roll20 smoke-test checklist for v0.1.4.2.
  - Confirm the API sandbox saves and reloads without a red console exception.
  - Confirm the core ready whisper reports `0.1.4.2`.
  - Confirm `!ga-status`, `!ga-config modules`, `!ga-config list`, and `!ga-metrics`.
  - Confirm TokenMod-dependent modules report either `confirmed` or the expected `unverifiable` warning.
  - Confirm a real natural-1 attack, concentration workflow, NPC death/revival marker cycle, NPC HP roll, and module disable/re-enable cycle.
- Keep `GameAssist-v0.1.4.1.js` unchanged as the rollback baseline until the v0.1.4.2 smoke test is complete.
- Freeze broad GameAssist core development after v0.1.4.2 is confirmed so the compatibility-first bridge character-sheet project can begin on a stable foundation.

### Deferred work

- Validated configuration/state snapshot import and restoration.
  - Import requires schema validation, migration rules, preview/dry-run behavior, unknown-branch handling, and rollback semantics.
  - v0.1.4.2 intentionally exports configuration only and provides no import command.
- Native Mord character-sheet support.
  - This belongs to the bridge character-sheet project, not the v0.1.4.2 core release.
- Plugin loader or automatic third-party module discovery.
  - Roll20 does not expose a normal filesystem-style plugin directory.
  - Any future extension contract must be explicit and validated.
- Spell-specific concentration detection, spell names, duration tracking, expiration, and reminders.
- Cooldown, encounter, resource, condition, rest/recovery, and location/AoE modules.
- Rollable-table import/export.
- Expanded verbose-mode diagnostics.

### Explicitly not planned as “fixes”

- Do not route every command and event through the queue.
- Do not claim that a watchdog or timeout can terminate running JavaScript or Roll20 operations.
- Do not automatically delete unexpected state branches.
- Do not claim guaranteed external dependency discovery when Roll20 metadata may be unavailable.

---

## [0.1.4.2] – 2026-06-09

### Release definition

v0.1.4.2 is a **diagnostic and migration-readiness release**. It adds conservative state self-healing, an explicit public queue API, three-state dependency diagnostics, versioned configuration-only snapshots, and more truthful health reporting without changing normal bundled-module event execution.

The release was deliberately kept narrow:

- normal command and event handlers remain direct;
- gameplay-module implementations remain byte-for-byte aligned with the v0.1.4.1 module bodies;
- bootstrap changes are limited to state repair and dependency-status handling;
- no roadmap gameplay modules or character-sheet integration were added.

### Release artifacts

| Artifact | Purpose | SHA-256 |
| --- | --- | --- |
| `GameAssist-v0.1.4.2.js` | Release-candidate script | `AB5E2EC627E9BD969997B9FEA0563ED6A9690BD958DD433A38C83FF7F8A3CB35` |
| `GameAssist-v0.1.4.1.js` | Rollback baseline | `E4072A73BECD73EFF4D185F4F30B4A4594DA21DFF85F2C9319F0DA1A55EB08B5` |
| `README-GameAssist-v0.1.4.2.md` | Long-form user/developer handbook | `180AFC8C12E1BFEEA11A9F1EDBC0FD83C115E1DA47867BD4DC1390DD8184289A` |
| `GameAssist-v0.1.4.2-release-notes-and-smoke-test.md` | Release-specific Roll20 verification checklist | Included with release outputs |

### Version and MECHSUITS metadata

- Advanced the Roll20 header version, MECHSUITS banner `project_version`, and runtime `VERSION` constant to `0.1.4.2`.
  - Roll20 header: `GameAssist-v0.1.4.2.js` line 4.
  - Banner `project_version`: line 83.
  - Runtime `const VERSION = '0.1.4.2'`: line 574.
- Updated only the MECHSUITS sections that received meaningful behavior or contract changes:
  - `[GAMEASSIST:POLICY]`
  - `[GAMEASSIST:APP:UTILS]`
  - `[GAMEASSIST:CORE]`
  - `[GAMEASSIST:CORE:QUEUE]`
  - `[GAMEASSIST:CORE:OBJECT]`
  - `[GAMEASSIST:INTERFACES:COMMANDS]`
  - `[GAMEASSIST:BOOTSTRAP]`
- Preserved literal codename `GAMEASSIST`; no identifier normalization or tag renaming was performed.
- Preserved prior section commentary under `Prior notes` and added `Changed (v0.1.4.2)` records to the changed sections.
- Completed a structural audit for tag pairing, parent nesting, ancestor-only overlap, canonical-tree agreement, metadata presence, and required section footers.

### Added – State self-healing and audit safety

- Added conservative repair for known module state branches in `[GAMEASSIST:APP:UTILS]`.
  - `ensureStateRoot()` begins at line 276 and guarantees the core `state.GameAssist` containers exist.
  - Known module-branch repair logic records whether the missing/malformed item was the branch, `config`, or `runtime` at lines 333, 337, and 341.
  - `auditState()` begins at line 388.
  - `seedDefaults()` begins at line 423 and runs after repair.
- Known branch behavior:
  - If a known module branch is missing or malformed, GameAssist rebuilds a safe branch container.
  - If `config` is missing or malformed, GameAssist restores a valid object.
  - If `runtime` is missing or malformed, GameAssist restores a valid object.
  - Valid existing configuration values are preserved.
  - Repairs are logged and recorded through `recordMetric('state_repair', ...)` at line 414.
- Unknown branch behavior:
  - Unexpected keys are collected and warned about at line 399.
  - Unknown branches are left untouched during startup.
  - No automatic destructive cleanup occurs.
- Rationale:
  - Known GameAssist-owned shapes can be repaired safely.
  - Unknown branches may contain user data, abandoned module data, or future-extension data; deleting them automatically would be unsafe.
  - This state posture is important before character-sheet development because upgrades and new modules will increase persistent-state complexity.

### Added – Explicit state cleanup command

- Added GM-only `!ga-config cleanup` in `[GAMEASSIST:INTERFACES:COMMANDS]` at line 1448.
- Cleanup behavior:
  - Preserves known modules and core branches.
  - Deletes only unknown/orphaned branches after the GM explicitly invokes the command.
  - Reports the removed branch names or confirms that no orphaned branches were found.
- Safety boundary:
  - Cleanup is intentionally not executed during startup.
  - Documentation warns the GM to review state warnings before using cleanup.

### Added – Public opt-in queue API

- Exposed `GameAssist.enqueue(task, options)` in `[GAMEASSIST:CORE:OBJECT]` at line 1096.
- Public API behavior:
  - Requires `task` to be a function.
  - Returns `false` and warns when the task is invalid.
  - Returns `true` when accepted.
  - Accepts optional numeric `priority` and positive `timeout`.
  - Falls back to the established default timeout when no valid timeout is supplied.
  - Higher numeric priority runs first; equal-priority jobs preserve enqueue order.
- Existing queue implementation remains in `[GAMEASSIST:CORE:QUEUE]`:
  - `_enqueue(...)` begins at line 618.
  - The job-id stale-completion guard remains intact.
  - The queue continues to serialize only explicitly submitted work and module lifecycle transitions.
- Async contract:
  - Asynchronous queued work must return a Promise that settles when the queued portion is complete.
  - Merely starting `sendChat()` without returning a Promise would allow the queued task to appear complete too early.
- Timeout contract:
  - A timeout releases queue ownership so later jobs can proceed.
  - A timeout cannot cancel the underlying JavaScript callback, `sendChat()` call, or Roll20 operation.
  - The underlying work may finish later; the stale-job guard prevents that late completion from advancing the queue again.
- Rationale:
  - Future modules gain a supported serialization seam without imposing queue latency or coupling on every Roll20 event.

### Changed – Queue and watchdog truthfulness

- Updated `[GAMEASSIST:CORE:QUEUE]` narrative and footer to state the actual operational limit:
  - queue timeouts release the queue;
  - watchdog recovery releases a stuck busy state;
  - neither mechanism kills running JavaScript or Roll20 work.
- Preserved ordinary command/event execution as direct.
- Added `Queue Mode: explicit opt-in; normal event handlers execute directly` to `!ga-status` at line 1507.
- Rejected the old documentation claim that every inbound Roll20 event was queued and watchdog-controlled.
- Rationale:
  - Roll20 offers no general cancellation primitive for a running callback or pending external operation.
  - Accurate documentation is part of operational safety.

### Added – Three-state dependency diagnostics

- Reworked dependency reporting in `[GAMEASSIST:CORE:OBJECT]` through `_checkDependencies(name)` at line 1033.
- Dependency states:
  - `confirmed`: the dependency is positively known to be available.
  - `missing`: the dependency is positively known to be absent.
  - `unverifiable`: Roll20 did not expose enough script metadata to determine presence.
- `_checkDependencies(...)` returns:
  - `status`
  - `missing`
  - `confirmed`
  - `unverifiable`
  - `verified`
- Runtime behavior:
  - Missing dependencies prevent module enablement or cause startup skip.
  - Unverifiable dependencies produce a warning and allow the module to proceed.
  - Modules with no declared dependencies report confirmed.
- Current declared external dependencies:
  - NPCManager → TokenMod (`dependsOn: ['TokenMod']`, line 2300).
  - ConcentrationTracker → TokenMod (`dependsOn: ['TokenMod']`, line 2817).
  - NPCHPRoller does not require TokenMod.
- Rationale:
  - Earlier binary dependency reporting treated unavailable Roll20 metadata as proof of absence.
  - The tri-state model distinguishes evidence from uncertainty and avoids falsely disabling useful modules.

### Added – Versioned configuration-only snapshots

- Added snapshot identifiers to `[GAMEASSIST:POLICY]`:
  - `configFormat: 'gameassist-config-snapshot'`
  - `configSchemaVersion: 1`
  - Snapshot policy group begins at line 201.
- Updated `!ga-config list` in `[GAMEASSIST:INTERFACES:COMMANDS]` beginning at line 1350.
- Snapshot includes:

  ```json
  {
    "format": "gameassist-config-snapshot",
    "schemaVersion": 1,
    "scope": "configuration-only",
    "generatedAt": "<ISO timestamp>",
    "version": "0.1.4.2",
    "flags": {},
    "globalConfig": {},
    "modules": {}
  }
  ```

- Snapshot includes every bundled module configuration.
- Snapshot excludes:
  - runtime caches;
  - metrics;
  - unknown/orphaned branches;
  - arbitrary full `state.GameAssist` data.
- The `GameAssist Config` handout explicitly labels the snapshot scope as configuration-only.
- No import or automatic restore command was added.
- Rationale:
  - Versioning the export now creates a stable future validation boundary.
  - Import/restore is deferred because unsafe state import could be more damaging than a missing feature.

### Added – Health reporting

- Added `getModuleHealth()` in `[GAMEASSIST:INTERFACES:COMMANDS]` at line 1323.
- Added `formatDependencyStatus()` at line 1337.
- Expanded `!ga-status` at line 1487 to report:
  - command count;
  - event/message count;
  - errors;
  - average explicit queue-task duration;
  - queue length;
  - explicit queue mode statement;
  - last update;
  - total modules;
  - configured modules;
  - running modules;
  - dependency-skipped modules;
  - active listeners;
  - dependency warnings.
- Expanded `!ga-config modules` to show, per module:
  - stored configured state;
  - current runtime state;
  - dependency status.
- Rationale:
  - “Configured” and “running” are not interchangeable.
  - A module can be configured on but skipped, failed, or waiting on dependencies.
  - Health output should reveal that distinction without requiring state-console inspection.

### Changed – Bootstrap order and startup diagnostics

- Updated `[GAMEASSIST:BOOTSTRAP]`, beginning at line 3305.
- Startup order now:
  1. establish core state;
  2. initialize metrics/session timestamp;
  3. clear GameAssist’s internal listener registries;
  4. audit and repair known state;
  5. seed defaults;
  6. deduplicate planned metadata;
  7. run optional compatibility audit;
  8. report core ready;
  9. diagnose dependencies and initialize enabled modules.
- Dependency behavior during startup:
  - missing → warn, disable stored enabled state, leave module inactive;
  - unverifiable → warn and proceed;
  - confirmed → proceed normally.
- Preserved `GameAssist.flags.QUIET_STARTUP = true` default:
  - individual module-ready messages remain suppressed by default;
  - the core-ready message remains visible.

### Documented – Previously hidden commands and configuration

- Documented commands that existed in code but were absent or unclear in older README revisions:
  - `!npc-death-clear` at script line 2237;
  - `!npc-death-audit` at script line 2244;
  - `!ga-config cleanup` at script line 1448;
  - `!ga-metrics [reset]`.
- Documented NPCManager configuration:
  - `autoHide: false` at line 2154;
  - `hideLayer: 'gmlayer'` at line 2155.
- Documented developer metadata and command matching:
  - `dependsOn`
  - `match.caseInsensitive`
  - `match.mode: 'token'`
  - `match.mode: 'prefix'`
- Clarified command behavior:
  - `!npc-death-report` shows recorded deaths;
  - `!npc-death-audit` checks current HP/marker mismatches;
  - `!npc-death-clear` clears the recorded report log;
  - `!critfumblemenu --pid <playerId>` is the internal player-targeted syntax;
  - selected DebugTools tokens are used by omitting `--token`; literal `--token select` is not implemented by the parser;
  - commands are generally case-insensitive; lowercase is not a universal requirement.

### Documentation – Full README reconstruction

- Rebuilt `README-GameAssist-v0.1.4.2.md` as a long-form handbook after the first accurate-but-overly-compact rewrite omitted the original layout and teaching material.
- Restored:
  - numbered sections and table of contents;
  - TL;DR table;
  - architecture explanation and fail-safe table;
  - all six module guides;
  - installation guide;
  - command matrix;
  - configuration reference;
  - developer API;
  - Roll-Table Cookbook;
  - macro recipes;
  - historical benchmark section;
  - detailed troubleshooting;
  - upgrade and rollback paths;
  - contribution guidance;
  - roadmap status;
  - changelog summary;
  - glossary.
- Corrected old claims that described unsuitable, impossible, or unimplemented behavior:
  - removed “zero silent failures” guarantee;
  - removed claim that every event is queued;
  - removed claim that watchdog kills running tasks;
  - removed claim that state audit deletes and reseeds unknown branches;
  - removed guaranteed dependency-discovery claim;
  - corrected `!ga-config list` from full-state backup language to configuration-only snapshot language;
  - corrected startup-message expectations under `QUIET_STARTUP`;
  - corrected defaults, syntax, command purpose, and dependency statements.
- Preserved the old benchmark numbers only as explicitly labeled historical v0.1.3-era evidence, not a v0.1.4.2 performance guarantee.

### Compatibility and behavior boundaries

| Area | v0.1.4.2 Contract |
| --- | --- |
| Roll20 event hooks | Captures native `on` once through `R20_ON`; does not override global `on` or `off`. |
| Normal handlers | Execute directly through initialized/active guards. |
| Queue | Explicit opt-in plus module lifecycle transitions only. |
| Queue timeout | Releases queue; cannot cancel underlying work. |
| Dependency discovery | Best-effort, tri-state, never guaranteed. |
| Unknown state | Warn and preserve until explicit cleanup. |
| Config export | Versioned configuration-only snapshot; no import. |
| Gameplay modules | Preserved from v0.1.4.1; no new gameplay behavior in this release. |
| Character sheet | Not implemented. |

### State and migration impact

- Existing valid module configuration is preserved.
- Known malformed/missing `config` and `runtime` containers are repaired at startup.
- Unknown branches remain intact unless the GM runs `!ga-config cleanup`.
- `!ga-config list` creates a new versioned snapshot shape but does not mutate state.
- No automatic migration removes unknown data.
- No import/restore migration exists.
- Rollback warning:
  - replacing the script with v0.1.4.1 rolls back code;
  - it does not automatically reverse persistent state changes made while v0.1.4.2 was active.

### Explicitly not included

- No implicit queueing of commands/events.
- No cancellation of running JavaScript or Roll20 operations.
- No automatic deletion of unknown state.
- No guaranteed external-script discovery.
- No full-state export/import or snapshot restoration.
- No plugin loader.
- No Rest Manager, encounter tools, cooldown tools, resource tools, condition tools, or location tools.
- No native Mord character-sheet support.
- No new public gameplay command set.

### Automated verification evidence

| Verification | Result | What it established |
| --- | --- | --- |
| JavaScript syntax validation | Passed | Release artifact parses successfully. |
| MECHSUITS structural audit | Passed | No missing parents, invalid overlaps, canonical-tree drift, metadata gaps, or missing footers were detected. |
| Existing command simulation | Passed | Core and bundled command surfaces remained callable without simulation exceptions. |
| Confirmed dependency simulation | Passed | Confirmed dependencies report and initialize correctly. |
| Missing dependency simulation | Passed | Missing dependencies skip/refuse the dependent module. |
| Unverifiable dependency simulation | Passed | Unverifiable dependencies warn and proceed. |
| Known-state repair simulation | Passed | Malformed known `config`/`runtime` containers repair. |
| Valid-config preservation | Passed | Existing valid values survive repair. |
| Unknown-state preservation | Passed | Unknown branches remain untouched at startup. |
| Configuration snapshot generation | Passed | Format, schema version, scope, module configs, and exclusions are correct. |
| Health/status reporting | Passed | Configured/running/skipped counts and warnings appear. |
| Explicit queue serialization | Passed | Explicitly enqueued tasks serialize. |
| Queue-timeout release | Passed | Later task proceeds while underlying timed-out work may finish later. |
| Exact marker/lifecycle regression | Passed | Marker and module lifecycle behavior remained intact. |
| Global event-hook audit | Passed | No global `on`/`off` overrides introduced. |

### Roll20 verification still required

- Paste `GameAssist-v0.1.4.2.js` into a disposable or controlled Roll20 API sandbox.
- Confirm the API sandbox reloads cleanly.
- Run the release smoke test in `GameAssist-v0.1.4.2-release-notes-and-smoke-test.md`.
- Do not retire the v0.1.4.1 rollback baseline until those tests pass.

---

## [0.1.4.1] – 2026-06-08

### Release definition

v0.1.4.1 is a stability-first update built from the uploaded, stable-but-limping v0.1.4 baseline. It preserves v0.1.4 command and bootstrap behavior, incorporates only isolated safe ideas from the failed attempted v0.1.5 upgrade, and aligns the single-file structure with MECHSUITS v1.5.2 requirements without performing a wholesale rewrite.

### Development strategy

- Treated uploaded v0.1.4 as the behavioral baseline.
- Preserved the six-module shape:
  - ConfigUI
  - CritFumble
  - NPCManager
  - ConcentrationTracker
  - NPCHPRoller
  - DebugTools
- Avoided broad bootstrap and interface/event lifecycle restructuring.
- Preserved captured Roll20 `R20_ON` behavior.
- Preserved direct normal handler execution.
- Applied changes at narrow MECHSUITS section granularity.
- Kept a separate rollback copy of v0.1.4.

### Version and MECHSUITS metadata

- Advanced Roll20 header, MECHSUITS `project_version`, and runtime `VERSION` to `0.1.4.1`.
  - Header: `GameAssist-v0.1.4.1.js` line 4.
  - Banner: line 74.
  - Runtime version: line 520.
- Preserved literal codename `GAMEASSIST`.
- Audited:
  - banner order and prose;
  - file-scoped canonical tree;
  - section tags and physical nesting;
  - `mechsuit_section.codename`;
  - section `area`;
  - `last_updated_version`;
  - Changed/Maintenance footer discipline;
  - prior-note preservation;
  - required Notes & Comments footers.
- Did not claim that comment-only inherited sections were meaningfully changed.

### Added – Centralized POLICY ownership

- Added/expanded `[GAMEASSIST:POLICY]` beginning at line 163.
- Centralized existing values without changing defaults:
  - queue default timeout;
  - watchdog interval and multiplier;
  - metrics history/duration limits;
  - runtime cache limits;
  - timestamp sanity window;
  - ConfigUI page size;
  - CritFumble roll delay;
  - unsafe configuration keys.
- Used shallow frozen policy groups to reduce accidental runtime mutation.
- Rationale:
  - Shared knobs previously lived in multiple sections.
  - Central policy ownership makes later changes reviewable and rollbackable.
  - Existing values were preserved to avoid changing runtime behavior during the stability release.

### Added – Time seams and timestamp hardening

- Added shared wall-clock helper `now()` at line 227.
- Added monotonic duration helper `monotonic()` at line 231.
- Routed human-facing local-time formatting through `localTime(...)` at line 246.
- Added `sanitizeTimestamp(raw, fallback)` at line 443.
- Routed queue duration measurement through `monotonic()`.
- Routed stored timestamps through the shared wall-clock seam and timestamp sanitizer.
- Rationale:
  - Wall-clock time is appropriate for human and persistent timestamps.
  - Monotonic time is appropriate for durations and timeout measurement.
  - Sanitization prevents malformed/future timestamps from corrupting ordered runtime caches.

### Added – Shared marker helpers

- Added `normalizeMarkerId(marker)` at line 331.
- Added `tokenHasMarker(token, marker)` at line 335.
- Exact-marker behavior:
  - recognizes a configured marker;
  - recognizes counted Roll20 marker values such as `dead@2`;
  - does not match unrelated marker names such as `deadly`.
- Rationale:
  - Substring-style matching can remove or misreport the wrong marker.
  - Shared top-level helpers are visible to module teardown functions and avoid the ConcentrationTracker scoping failure identified in the attempted upgrade.

### Added – Shared runtime self-healing helpers

- Added `ensureRuntimeObject(modState)` at line 411.
- Added `ensureRuntimeKey(runtime, key, kind)` at line 425.
- Added `ensureModRuntimeKey(modState, key, kind)` at line 438.
- Used shared helpers to keep module runtime caches usable after malformed state or older persisted shapes.
- Rationale:
  - Runtime caches are operational and can be safely repaired to known container types.
  - Shared helpers reduce duplicated and inconsistent repair code.

### Changed – Queue timing and stale-completion protection

- Preserved `_enqueue(...)` in `[GAMEASSIST:CORE:QUEUE]`, beginning at line 564.
- Preserved job-id guards at lines 581 and 593:

  ```js
  if (myId !== _jobId) return;
  ```

- Preserved the timed-out completion guard:

  ```js
  if (timedOut) return;
  ```

- Routed queue timing through POLICY and `monotonic()`.
- Emitted the declared metric name through `recordMetric(POLICY.metrics.queueDurationName, ...)` at line 603.
- Rationale:
  - A timed-out job may still finish later.
  - Without the job-id and timed-out guards, late completion could advance the queue twice or corrupt busy-state accounting.

### Changed – Configuration safety and snapshot completeness

- Updated `!ga-config list` beginning at line 1211 to include:
  - runtime version;
  - global flags;
  - root/global configuration;
  - every bundled module configuration.
- Clarified scope:
  - “complete” means complete configuration snapshot;
  - it does not mean full state, runtime cache, or metrics backup.
- Preserved unsafe-key refusal:
  - `BAD_KEYS` sourced from POLICY at line 1242;
  - refusal check at line 1248.
- Preserved `enabled=true|false` routing through module lifecycle methods rather than directly changing state.
- Rationale:
  - Older snapshot behavior omitted module configs.
  - Config export needed to be useful before versioned import could be considered.
  - Prototype-related keys remain unsafe and are explicitly rejected.

### Changed – Shared linked-character validation

- Preserved/exported `GameAssist.getLinkedCharacter` at line 1139.
- Updated modules to use shared linked-token validation at lines including:
  - NPCManager: lines 2008 and 2096;
  - ConcentrationTracker: lines 2476, 2555, and 2743;
  - NPCHPRoller: lines 2818 and 2865.
- Rationale:
  - Modules should not independently assume that tokens are linked, on the Objects layer, or backed by a valid character.
  - Shared validation keeps invalid/unlinked/PC token handling consistent.

### Changed – NPCManager exact marker behavior

- Updated NPCManager to use exact shared marker matching.
- Preserved:
  - `deadMarker: 'dead'`;
  - TokenMod calls;
  - death log behavior;
  - death audit/report commands;
  - configured-marker teardown.
- Teardown begins near line 2142 and clears only the configured marker from eligible current-page tokens.
- Counted marker values such as `dead@2` are recognized.
- Unrelated values such as `deadly` are preserved.
- Rationale:
  - Disable/teardown should clean up the marker GameAssist owns without damaging unrelated status information.

### Changed – ConcentrationTracker lifecycle and runtime safety

- Preserved configured-marker teardown beginning near line 2659.
- Preserved shared marker matching and runtime self-healing.
- Preserved structured `lastDamage` metadata while remaining compatible with legacy numeric values.
- Preserved existing command language:
  - `!concentration`
  - `!cc`
  - `--damage`
  - `--mode`
  - `--off`
  - `--status`
  - `--last`
  - `--config randomize on|off`
  - `!ga-conc-status`
- Rationale:
  - The attempted upgrade exposed a serious helper-scope risk in teardown.
  - Shared helpers ensure teardown can access the configured-marker logic safely.

### Changed – DebugTools exact marker behavior

- Updated DebugTools marker diagnostics to use shared exact marker normalization.
- Marker diagnostics now understand counted markers.
- Preserved:
  - disabled-by-default posture;
  - dry-run-by-default posture;
  - `--apply` requirement for mutations.
- Section change note appears near line 3116.

### Changed – Captured Roll20 event hooks

- Preserved captured native Roll20 handler:

  ```js
  const R20_ON = ...
  ```

  at line 147.
- Preserved use of `R20_ON` for command/event wrappers and `ready`.
- Did not override global `on` or `off`.
- Rationale:
  - Global event-function overrides introduce script-order-dependent interoperability failures with scripts loaded after GameAssist.
  - Roll20 does not provide a dependable general-purpose `off()` contract for these handlers.

### Intentionally excluded from the attempted v0.1.5 upgrade

- Duplicate trailing script fragment.
  - Rejected because duplicated bootstrap/module code could double-register handlers or fail parsing/execution.
- Changed or normalized codename.
  - Rejected because MECHSUITS v1.5.2 requires literal owner-authoritative identifier preservation.
- Global `on`/`off` overrides.
  - Rejected because they create order-dependent cross-script behavior.
- Weakened queue stale-completion guard.
  - Rejected because late completion after timeout could advance the queue twice.
- Broader command matching.
  - Rejected because it could make neighboring command names accidentally trigger.
- Wholesale bootstrap/dependency/interface restructuring.
  - Rejected because the failed whole-file upgrade did not justify expanding the release’s blast radius.

### Verification evidence

| Verification | Result |
| --- | --- |
| JavaScript syntax validation | Passed |
| MECHSUITS structural audit | Passed; no missing parents, invalid overlaps, canonical-tree drift, metadata issues, or missing footers detected |
| Simulated Roll20 startup | Passed with enabled modules wired |
| Core command simulation | Passed without exceptions |
| Unsafe `__proto__` config write | Refused |
| NPC death-marker add/remove simulation | Passed |
| Exact counted marker handling | Passed |
| Unrelated marker preservation | Passed |
| Module disable/enable simulation | Passed |
| Captured native event-hook strategy | Preserved |

### Rollback posture

- v0.1.4.1 is preserved unchanged as the rollback baseline for v0.1.4.2.
- Rollback requires replacing the script and re-running health/smoke tests.
- Script rollback does not automatically restore persistent state.

---

## [0.1.4] – Uploaded Stable-But-Limping Baseline

### Baseline role

- Served as the source baseline for v0.1.4.1.
- Was treated as stable enough to preserve but not “known-good.”
- Included the six-module structure:
  - ConfigUI
  - CritFumble
  - ConcentrationTracker
  - NPCManager
  - NPCHPRoller
  - DebugTools
- Retained TokenMod-based status changes for NPCManager and ConcentrationTracker.
- Preserved captured `R20_ON` behavior and avoided global `on`/`off` overrides.

### Added

- New **ConfigUI** module providing a GM-only chat control panel:
  - module enable/disable buttons;
  - boolean config toggles;
  - pagination;
  - `!ga-config ui`;
  - `!ga-config-ui`.
- New **DebugTools** module:
  - disabled by default;
  - GM-only;
  - dry-run by default;
  - `!ga-debug damage|marker|save`;
  - mutations require `--apply`.
- Public `GameAssist.renderConfigUI(playerId, options)` helper.

### Changed

- Updated README TL;DR, module guides, command matrix, macro recipes, and configuration reference for ConfigUI and DebugTools.
- Advanced runtime version to 0.1.4.
- Retained queue-guarded module lifecycle hooks.

### Known baseline limitations carried into the repair line

- State repair and dependency diagnostics needed clearer, safer semantics.
- Config snapshot behavior and documentation needed correction.
- Marker matching required exact shared helpers.
- Some commands/configuration existed but were not fully documented.
- README described queue/watchdog/state/dependency guarantees more strongly than the Roll20 environment could support.

> No authoritative shipment date was recorded in the supplied changelog. This entry records baseline provenance.

---

## [0.1.3] – Detailed Historical Development Record

This section preserves the supplied granular v0.1.3-era development record, including implementation locations and replaced behavior. The referenced line numbers belong to the historical artifact described by those notes and are retained for audit value.

### Added – Persisted session metrics

- Added persisted session metrics with GM summary/reset command.
  - Added `GameAssist` lines 288-420 for the metrics store helpers:
    - `createMetricsStore`
    - `ensureStateRoot`
    - `recordMetric`
  - Instrumented wrappers at lines 683-742, 796-844, and 1049-1119 to log:
    - commands;
    - events;
    - queue tasks;
    - module toggles;
    - errors.
  - Exposed `!ga-metrics`.
  - Updated the task queue finalizer at lines 197-214 to retain only the latest durations and feed the metrics ring buffer.
  - Exported `getMetricsStore` and `recordMetric` on the public API at lines 927-932.
- Documentation:
  - README TL;DR, Command Matrix, and Troubleshooting sections documented `!ga-metrics`.
  - `script.json` listed the new command and staged version bump.

### Added – Shared token-to-character resolver

- Introduced a shared resolver so modules validate Roll20 objects before use.
  - Added `GameAssist` lines 343-353:

    ```js
    function getLinkedCharacter(token) { ... return { token, character }; }
    ```

  - Added public export at line 836:

    ```js
    GameAssist.getLinkedCharacter = getLinkedCharacter;
    ```

  - Added module usage at historical lines 1213, 1261, 1540, 1611, 1783, 1839, and 1886 so NPCManager, ConcentrationTracker, and NPCHPRoller consistently gate work on verified tokens.
  - Removed duplicated per-module inline checks from the prior implementation:
    - pre-update line 1156: `const charId = token.get('represents');`
    - pre-update line 1168: `const character = getObj('character', charId);`
    - pre-update line 1362: `const charId = token.get('represents');`

### Added – NPCHPRoller auto-roll on token add

- Added opt-in automatic HP rolling for newly created NPC tokens through `autoRollOnAdd`.
  - Added historical lines 1801-1869 to reuse a shared NPC context resolver.
  - New-token handling silently skips non-NPC or invalid tokens.
  - Automatic rolls are annotated in logs.
  - Added `add:graphic` listener metadata at historical lines 1948-1956.
  - Updated README module/config documentation.
- Default remained `false` to avoid event noise and unintended token mutation.

### Changed – Guard-based module handler lifecycle

- Core handler lifecycle moved from physical `off()` calls to module guard flags.
  - Added historical lines 609-620 to store:
    - `initialized`
    - `active`
    - `dependsOn`
    - `wired`
    - `internal`
  - Added handler guards at historical lines 627 and 646-647:

    ```js
    if (!MODULES[mod]?.initialized || !MODULES[mod]?.active) return;
    ```

  - Preserved the READY gate for normal event handling.
  - Removed prior minimal registration:

    ```js
    MODULES[name] = { initFn, teardown, enabled, initialized: false, events, prefixes };
    ```

  - Removed attempted physical unbinding:

    ```js
    (this._commandHandlers[mod] || []).forEach(h => off(h.event, h.fn));
    (this._listeners[mod] || []).forEach(h => off(h.event, h.fn));
    ```

  - `offCommands` and `offEvents` became logical registry clearing rather than claims of Roll20 listener detachment.

### Changed – Serialized module enable/disable with dependency guards

- Added `_transitioning` checks and queued lifecycle execution across historical lines 718-807.
- Added rollback on initialization failure at historical lines 745-755.
- Added dependency verification helper at historical lines 673-701.
- Added dependency checks inside `enableModule` and bootstrap at historical lines 723-731 and 1945-1955.
- Removed the old eager teardown/clear path:
  - pre-update line 502: `this.offEvents(name);`
  - pre-update line 503: `this.offCommands(name);`
  - pre-update line 504: `clearState(name);`
  - pre-update line 505: `getState(name).config.enabled = true;`
  - removed the analogous disable block at pre-update lines 520-524.

### Changed – State audits became non-destructive

- Added whitelist behavior across historical lines 305-321 so unexpected keys warn without destructive deletion.
- Removed pre-update lines 294-301 that executed:

  ```js
  delete root[k];
  ```

  for unknown or malformed branches.
- This established the safety rule later expanded in v0.1.4.2:
  - known shapes may be repaired;
  - unknown branches are preserved unless explicitly cleaned.

### Changed – State helpers exposed through public API

- Added historical lines 833-835:
  - `GameAssist.getState`
  - `GameAssist.saveState`
  - `GameAssist.clearState`
- Updated module initializers at historical lines 958, 1203, 1324, and 1741 to call `GameAssist.getState(...)`.
- Removed direct internal accessor usage from the previous revision:
  - pre-update line 648: `const modState = getState('CritFumble');`
  - pre-update line 893: `const modState = getState('NPCManager');`
  - pre-update line 996: `const modState = getState('ConcentrationTracker');`
  - pre-update line 1325: `const modState = getState('NPCHPRoller');`

### Changed – Compatibility audit scoring

- Added signature catalog and scoring routine across historical lines 377-518.
- Added summary rows and hints for known/unknown scripts.
- Replaced earlier summary-only logging at pre-update lines 354-357, which reported only known/unknown lists and planned hooks.
- Compatibility output remained gated by `GameAssist.flags.DEBUG_COMPAT`.

### Changed – ConcentrationTracker structured runtime data

- Added structured storage at historical lines 1559-1569.
- Added skipped-token reporting in `handleClear` at historical lines 1600-1624.
- Added `!ga-conc-status` wiring at historical lines 1691-1698.
- Removed previous single-number storage:

  ```js
  modState.runtime.lastDamage[msg.playerid] = damage;
  ```

- Removed silent marker clearing:

  ```js
  if (t) toggleMarker(t, false);
  ```

- Structured metadata included damage, DC, mode, token/character IDs, bonus, player, and timestamp.

### Changed – NPCManager configured-marker teardown

- Added teardown across historical lines 1308-1331.
- Teardown removes the configured marker through TokenMod and reports the number cleared.
- Replaced behavior where disabling NPCManager could leave stale GameAssist-owned death markers on tokens.

### Changed – Chat sanitization and planning utilities

- Added quote escaping at historical line 340:

  ```js
  .replace(/"/g, '&quot;');
  ```

- Added `_dedupePlanned` guard at historical line 667:

  ```js
  if (this._deduped) return;
  ```

- Replaced unconditional deduplication from pre-update lines 493-495.
- Rationale:
  - quoted text should not break Roll20 whisper HTML;
  - planned metadata should not grow repeatedly across reload-like flows.

### Changed – Bootstrap dependency and failure handling

- Added dependency checks and active-flag management at historical lines 1945-1973.
- Set `initialized` and `active` based on actual startup success.
- Removed unconditional initialization loop from pre-update lines 1491-1499:

  ```js
  Object.entries(MODULES).forEach(...)
  ```

- Failed or dependency-blocked modules remain inert instead of appearing active.

### Added – Staged v0.1.3 helper and dependency work

- Added compatibility audit scoring with signature-based hints for:
  - TokenMod
  - ScriptCards
  - APILogic
- Added shared helpers:
  - `GameAssist.createButton(label, command)`
  - `GameAssist.rollTable(tableName)`
- Added GM command `!ga-conc-status`.
- Added declared `dependsOn` checks for module enablement.
- Added structured ConcentrationTracker metadata used by the status report.

### Documentation

- Clarified state-auditor commentary so unexpected branches are documented as warning-only.
- Updated README for:
  - metrics;
  - developer helpers;
  - compatibility scoring;
  - dependency guardrails;
  - `!ga-conc-status`;
  - NPCHPRoller `autoRollOnAdd`.

> No authoritative shipment date was recorded in the supplied development notes.

---

## [0.1.2] – 2025-09-16

### Packaging & Repository Compliance (Roll20 API Repo)

- **Standard Header Added:** Inserted the Roll20-required top-of-file comment containing:
  - name;
  - version;
  - last-updated date;
  - description;
  - syntax/configuration pointers.
- **One-Click Artifacts:** Added:
  - `script.json`;
  - repository-focused `README.md`;
  - `GameAssist/` folder layout suitable for a `roll20-api-scripts` pull request.
- **Dependencies & Tables:** Declared TokenMod usage and documented the exact CritFumble rollable-table names:
  - `CF-Melee`
  - `CF-Ranged`
  - `CF-Thrown`
  - `CF-Spell`
  - `CF-Natural`
  - `Confirm-Crit-Martial`
  - `Confirm-Crit-Magic`

### MECHSUITS v1.5 Structural Wrap (No Runtime Changes)

- **Framing Only:** Introduced:
  - MECHSUITS YAML banner;
  - canonical tree;
  - `[CODENAME:AREA] BEGIN/END` section frames;
  - section notes for maintainability and reviewability.
- **Behavior Parity:** No functional changes; commands and modules remained behaviorally aligned with v0.1.1.2.

### Version & Metadata

- **Version Bump:** Updated version to `0.1.2`.
- **State/Migration:** No migration; `state.GameAssist` structure remained unchanged.

---

## [0.1.1.2] – 2025-06-10

### CritFumble Module

- **Natural 1 Detection Bugfix:**
  Refactored `hasNaturalOne` to robustly detect natural 1s on d20 attack rolls across template complexity and non-standard inline-roll shapes. This removed `"Cannot read properties of undefined (reading 'r')"` failures and ensured valid attack rolls could be checked without assuming every result contains `.r`.

- **GM Visibility Improvement:**
  Whispered the **Confirm Critical Miss** confirmation menu to both the GM and the player, rather than only the player, so GM oversight remains consistent.

---

## [0.1.1.1] – 2025-05-30

### Core Framework

- **Quiet Startup Option:**
  Added `flags.QUIET_STARTUP`, default `true`. Per-module “Ready” chat lines may be suppressed while the core summary remains visible.

- **Logging Improvements:**
  - Re-implemented `GameAssist.log` for clearer output and log hygiene.
  - Escaped user text.
  - Split multiline output into properly formatted GM whisper content.
  - Preserved message order and formatting.
  - Added `{ startup: true }` metadata so modules can mark suppressible ready messages.

- **Core-Ready Announcement:**
  The core ready message remains unsuppressed even when quiet startup is enabled.

- **Status Command Update:**
  - `!ga-status` uses real newline characters.
  - Output remains grouped into one GM whisper.

- **Module Announcements:**
  - CritFumble, NPCManager, ConcentrationTracker, and NPCHPRoller marked their ready messages with `{ startup: true }`.
  - NPCHPRoller adopted the shared startup-output pattern.

- **Summary:**
  No intended gameplay changes. Work focused on GM chat quality, reduced startup noise, and clearer diagnostics.

---

## [0.1.1.0] – 2025-05-29

- Initial public release of GameAssist.
- Bundled the core loader with four modules:
  - CritFumble
  - NPCManager
  - ConcentrationTracker
  - NPCHPRoller
- Established the foundation for later modular expansion and customization.

---

## Historical Staging Labels Preserved

The supplied predecessor changelog used these labels before the v0.1.4.1/v0.1.4.2 repair line was created:

- `[Unreleased]` for much of the detailed v0.1.3-era lifecycle, metrics, state, compatibility, and module work.
- `[Staging] 0.1.4 (blocked by 0.1.3 compliance)` for ConfigUI and DebugTools.
- `[Staging] 0.1.3 (MECHSUITS compliance gate)` for compatibility hints, helpers, dependency checks, and structured concentration data.

Those labels are no longer the current release-status statement, but their detailed implementation records have been retained in the relevant sections above. The attempted v0.1.5 upgrade remains explicitly unshipped.

---

*This changelog records implementation history, rationale, limitations, verification, and release posture. Roadmap ideas and failed upgrade attempts are never presented as shipped features.*

---

## Append-Only Maintenance Policy — Adopted 2026-06-10

This section governs changelog entries added after v0.1.4.2.

- Published entries are preserved as historical records and are not silently rewritten.
- Each new release entry is a curated record of changes since the preceding release entry.
- Corrections to an older entry are appended as a dated correction record that identifies the superseded claim.
- Roadmap work belongs in `ROADMAP.md`; installation and troubleshooting procedures belong in `Smoketest.md`.
- An older entry may receive an appended summary after it is at least three major-version releases behind the current release. The original detailed entry remains preserved.
- Release status, verification results, and artifact names are stated as repository facts rather than internal work narration or editorial judgments.

### Corrections to v0.1.3.x–v0.1.4.2 records

The following corrections supersede inaccurate or temporary wording in the preserved entries above:

| Preserved wording or reference | Corrected record |
| --- | --- |
| `GameAssist-v0.1.4.2.js` | The tracked artifact is `GameAssist-v0.1.4.2`. Its SHA-256 is `038B07B292E09981BD56564D83F5900353BDC1BDA0D39FDD4CB63A1DBE80CAC4`. |
| `GameAssist-v0.1.4.1.js` | No v0.1.4.1 script is retained in the repository. Its historical checksum cannot be verified from the repository contents. |
| `README-GameAssist-v0.1.4.2.md` | The tracked handbook is `README.md`. No version-named v0.1.4.2 README is retained. |
| `GameAssist-v0.1.4.2-release-notes-and-smoke-test.md` | The tracked installation and troubleshooting checklist is `Smoketest.md`. The named release-specific file is not retained. |
| “Mocked Roll20 sandbox” | These checks were simulated Roll20-environment checks, not executions inside the Roll20 API sandbox. |
| “Release candidate,” “stable-but-limping,” “attempted upgrade,” and similar labels | These phrases describe development context recorded at the time. They are not current release-status classifications. |
| “Truthful” or “honest” reporting claims | The durable contract is the specific behavior documented by the corresponding entry, such as configured/running/dependency-skipped counts or three-state dependency reporting. |
| v0.1.4.2 Roll20 confirmation language | The recorded v0.1.4.2 sandbox pass exposed the custom concentration-marker recognition failure addressed by v0.1.4.3. No complete passing v0.1.4.2 sandbox result is recorded. |

### Current release index

| Revision | Status | Repository role |
| --- | --- | --- |
| **v0.1.4.5** | Pre-release; automated verification complete, Roll20 smoke confirmation pending | NPC death-history buckets, handouts, and arc notes |
| **v0.1.4.4** | Previous complete script | DM-facing CritFumble help and NPC death-audit readability update |
| **v0.1.4.3** | Previous complete script | Concentration custom-marker recognition and standalone TokenMod interoperability update |
| **v0.1.4.2** | Previous complete script | Diagnostic and migration-readiness release with a known concentration custom-marker limitation |
| **v0.1.4.1** | Historical release; script not retained | Stability-focused repair based on v0.1.4 |
| **v0.1.4** | Historical baseline | Preserved as `GameAssist v0.1.4` |
| **Unreleased v0.1.5 prototype** | Not released | Review source for selected fixes and architecture planning |

---

## [0.1.4.3] – 2026-06-10

### Release definition

v0.1.4.3 improves standalone TokenMod interoperability by resolving configured marker names to the exact marker identities Roll20 stores on tokens. The update focuses on ConcentrationTracker status reporting and marker lifecycle requests while preserving the v0.1.4.x external dependency model.

MarkerService and integrated TokenMod remain assigned to the v0.1.5.x roadmap.

### Release artifacts

| Artifact | Purpose | SHA-256 |
| --- | --- | --- |
| `GameAssist-v0.1.4.3` | Versioned v0.1.4.3 script | `4C95BB9408A86BE45E7F5AC4A2726B932A6D408ADF834E90D5B7A1E161C48971` |
| `GameAssist` | Current repository script; identical to `GameAssist-v0.1.4.3` | `4C95BB9408A86BE45E7F5AC4A2726B932A6D408ADF834E90D5B7A1E161C48971` |
| `GameAssist-v0.1.4.2` | Previous complete script | `038B07B292E09981BD56564D83F5900353BDC1BDA0D39FDD4CB63A1DBE80CAC4` |

### Root cause addressed

- Roll20 stores a custom marker display name such as `Concentrating` as a token marker tag such as `Concentrating::7191835`.
- v0.1.4.2 compared the configured display name directly with the stored tag.
- A token visibly carrying the configured custom marker could therefore be omitted from `!concentration --status`.
- `deps unverifiable (TokenMod)` was not the cause of the status-read failure. Status reporting reads token markers directly; TokenMod is used when GameAssist requests marker mutation.

### Changed — Shared marker identity resolution

- Added a cached reader for Roll20's campaign custom-marker registry in `[GAMEASSIST:APP:UTILS]`.
- Added structured marker resolution for:
  - lowercase built-in marker ids such as `dead`;
  - custom marker display names such as `Concentrating`;
  - exact stored custom marker tags such as `Concentrating::7191835`;
  - counted marker values such as `Concentrating::7191835@3`.
- Preserved lowercase built-in-marker precedence so a custom marker named `dead` does not replace NPCManager's built-in default.
- Allowed a colliding custom marker to be selected by its complete stored tag.
- Updated `tokenHasMarker(...)` to compare exact resolved marker identities.
- Added fast paths for already-resolved custom tags and literal built-in ids.
- Exact stored custom marker tags now resolve before campaign-registry access, so a valid configured tag such as `Concentrating::7191835` remains usable when Roll20's marker registry is unavailable or malformed.
- Simple matching quote pairs are stripped before marker resolution, so chat-configured values such as `"red"` and `'red'` resolve as `red`.
- Returned explicit resolution failures for unrecognized configured markers.

### Changed — ConcentrationTracker status and lifecycle diagnostics

- `!concentration --status` now:
  - lists current-page tokens carrying the resolved configured marker;
  - returns `No tokens concentrating.` when no matching tokens are present;
  - reports when the current player page cannot be determined;
  - reports an unrecognized configured marker and provides configuration repair syntax;
  - logs a warning when a display name matches multiple custom markers.
- Concentration marker add, remove, and teardown requests now send TokenMod the resolved stored marker tag.
- `!concentration --off` reports that marker removal was requested rather than claiming the asynchronous TokenMod operation completed.
- Teardown stops and logs a warning when the configured marker cannot be resolved.

### Changed — NPCManager death-marker mutation

- NPCManager now resolves the configured death marker before TokenMod add, remove, and teardown requests.
- The default built-in `dead` marker still emits `statusmarkers|+dead` and `statusmarkers|-dead`.
- Built-in color markers such as `red` work even when the saved configuration contains simple wrapping quotes.
- A configured custom display name now emits the exact stored custom marker tag when Roll20's marker registry can resolve it.
- A configured exact custom tag, such as `Dead Custom::abc123`, remains usable even when Roll20's marker registry is unavailable or malformed.
- If the configured death marker cannot be resolved, NPCManager warns instead of sending a misleading TokenMod request or logging a death as completed.

### Documentation and changelog maintenance

- Updated `README.md`, `ROADMAP.md`, and `Smoketest.md` for v0.1.4.3 behavior and validation.
- Added focused concentration-marker checks to `Smoketest.md`.
- Separated release records, roadmap plans, and installation/troubleshooting procedures.
- Adopted the append-only changelog policy above.
- Added appended corrections for inaccurate artifact names and temporary development terminology in preserved v0.1.3.x–v0.1.4.2 records.

### MECHSUITS changes

- Advanced the file header, banner `project_version`, prose guarantee, visual version, and runtime `VERSION` to `0.1.4.3`.
- Applied the Meaningful Change Rule to:
  - `[GAMEASSIST:APP]`
  - `[GAMEASSIST:APP:UTILS]`
  - `[GAMEASSIST:CORE]`
  - `[GAMEASSIST:MODULES]`
  - `[GAMEASSIST:MODULES:NPCMANAGER]`
  - `[GAMEASSIST:MODULES:CONCENTRATIONTRACKER]`
- Recorded maintenance-only commentary updates in:
  - `[GAMEASSIST:POLICY]`
  - `[GAMEASSIST:INTERFACES:COMMANDS]`
  - `[GAMEASSIST:MODULES:CRITFUMBLE]`
- Preserved literal codename `GAMEASSIST`, existing section tags, and prior notes.
- Confirmed paired tags, proper nesting, and canonical-tree agreement.

### Compatibility and state impact

| Area | v0.1.4.3 behavior |
| --- | --- |
| TokenMod | Remains a separately installed dependency responsible for requested marker mutations. |
| Marker reads/writes | GameAssist reads token markers directly and resolves built-in ids, custom display names, and stored custom tags before marker-dependent read/write decisions. |
| MarkerService | Not included. |
| Integrated TokenMod | Not included. |
| Public commands | Existing v0.1.4.2 command language is preserved. |
| Persistent state | No migration is required; existing ConcentrationTracker configuration remains valid. |
| Rollback | Replacing the script with `GameAssist-v0.1.4.2` restores the previous marker-name comparison behavior. |

### Verification results

| Verification | Result | Coverage |
| --- | --- | --- |
| JavaScript syntax validation | Passed | The current script parses successfully. |
| Current/versioned script identity | Passed | `GameAssist` and `GameAssist-v0.1.4.3` are byte-identical. |
| MECHSUITS structural audit | Passed | Section pairing, nesting, metadata, footers, and canonical tree agree. |
| Simulated Roll20-environment checks | Passed | Empty status, custom and counted markers, built-in markers, exact custom tags, exact custom tags with registry failures, NPC death-marker add command generation, invalid-marker diagnostics, disabled-module diagnostics, and TokenMod teardown command generation. |
| Roll20 API sandbox | Not recorded | Installation and module validation procedures are documented in `Smoketest.md`. |

### Exclusions

- No MarkerService module.
- No integrated TokenMod or StatusInfo module.
- No change to the v0.1.4.x dependency model.
- No configuration import or full-state restore.
- No new gameplay modules.
- No native Mord character-sheet support.

---

## [0.1.4.4] – 2026-07-17

### Release definition

v0.1.4.4 is a small DM-facing readability release. It preserves the v0.1.4.3 marker-recognition and standalone TokenMod interoperability fixes while improving two chat outputs identified in Issue #21.

### Issue addressed

- [#21](https://github.com/Mord-Eagle/GameAssist/issues/21) — Make CritFumble help and NPC death-audit output human-readable.

### Changed — DM-facing command output

- Revised `!critfumble help` from a command list into a quick reference with an `Open Natural 1 Menu` button, common commands, attack types, and exact setup table names.
- Added `!critfumble menu` as the public CritFumble-family command for opening the guided Natural 1 dialogue.
- Added bare `!critfumble` as a help alias, so entering the feature command without a subcommand opens the guide instead of silently doing nothing.
- Preserved `!critfail` as the direct GM player-picker command.
- Preserved existing CritFumble command syntax:
  - `!critfail`
  - `!critfumble`
  - `!critfumble help`
  - `!critfumble menu`
  - `!critfumble-TYPE`
  - `!confirm-crit-martial`
  - `!confirm-crit-magic`
- Changed `!npc-death-audit` from multiple line-by-line log messages into one grouped GM report.
- Added an audit `Scope` row stating that linked NPC tokens are checked and player characters are not included.
- Grouped audit mismatches by action: `Add Marker` for dead NPCs missing the configured marker, and `Clear Marker` for living NPCs still carrying it.
- Preserved useful mismatch details: NPC name, HP, current markers, and token ID.
- Bounded each audit mismatch detail group while preserving total counts, so crowded pages do not produce one oversized Roll20 chat payload.
- Kept unrelated unlinked-page-item notes as informational context, so party markers, scenery, labels, and props do not read like errors.

### Documentation

- Updated `Smoketest.md` so DMs no longer need to reinterpret the old audit success message.
- Updated the CritFumble smoke test to check the quick-reference help panel, the bare `!critfumble` help alias, the `!critfumble menu` guided dialogue, and the unchanged `!critfail` player picker.
- Updated `README.md` to describe the quick reference, guided menu, direct player picker, and the meaning of a clean NPC death audit.
- Updated `ROADMAP.md` so #21, #22, and #23 precede the #24 standalone-interoperability umbrella, with #32 explicitly deferred after the existing issue queue.

### Review fixes

- Hardened `!critfumble help` and `!critfumble menu` matching so extra internal whitespace is accepted.
- Hardened direct fumble rolls so mixed-case commands such as `!CritFumble-melee` resolve the intended fumble type.
- Added a POLICY-owned `npcAuditDetailLimit` cap for grouped NPC death-audit reports.
- Corrected `script.json` so `script` points to the repository's actual `GameAssist` artifact instead of nonexistent `GameAssist.js`.
- Added `!critfumble help` and `!critfumble menu` to the script metadata command list.

### MECHSUITS records

- Updated `[GAMEASSIST:MODULES:CRITFUMBLE]` because the public help output changed.
- Updated `[GAMEASSIST:MODULES:NPCMANAGER]` because the public audit success output changed.
- Updated `[GAMEASSIST:POLICY]` because the NPC death-audit detail cap is a runtime behavior knob.
- Updated `[GAMEASSIST:CORE]` because the runtime `VERSION` constant advanced.
- Preserved existing section tags, codename `GAMEASSIST`, and command names.

### Release artifacts

The v0.1.4.3 artifact remains preserved. The current repository script and the new v0.1.4.4 versioned artifact share:

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `DB68D6467D698FEF25D416394FFD07F6F44EF2E2361D9DBA9F198A0DAA41D091` |
| `GameAssist-v0.1.4.4` | `DB68D6467D698FEF25D416394FFD07F6F44EF2E2361D9DBA9F198A0DAA41D091` |

### Verification

| Check | Result |
| --- | --- |
| `node --check .\GameAssist` | Passed |
| `GameAssist-v0.1.4.4` syntax via stdin check | Passed |
| `GameAssist` versus `GameAssist-v0.1.4.4` byte identity | Passed |
| `git diff --check` | Passed |

Roll20 API sandbox confirmation is still required for the final release gate.

---

## [0.1.4.5] – 2026-07-17

### Release definition

v0.1.4.5 is an NPCManager usability and campaign-notes release for Issue #22. It keeps the `v0.1.4.x` standalone TokenMod architecture, but changes death history from a single chat-oriented log into hierarchical DM-facing handout buckets: Campaign, Chapter, Section, and Session. It also adds a report writer and curated Arc rosters that sit outside that hierarchy. NPCManager advances to module version `1.1.0` because its state model, report workflow, clear behavior, date handling, and Arc-management surface changed substantially even though the GameAssist project version remains a patch release.

### Issue addressed

- [#22](https://github.com/Mord-Eagle/GameAssist/issues/22) — Add summarized and named NPC death-log pools.

### Changed — scoped NPC death buckets

- Advanced `[GAMEASSIST:MODULES:NPCMANAGER]` independent `module_version` from `0.1.1.0` to `1.0.0` for the bucket-state redesign, then to `1.1.0` for report writing, hierarchical clearing, date rollover, and curated Arc management.
- Added active death-history bucket names under NPCManager config:
  - `campaign`
  - `chapter`
  - `section`
  - `session`
- Default bucket names are intentionally simple:
  - Campaign: `Campaign`
  - Chapter: `Chapter`
  - Section: `Section`
  - Session: current date in `YYYY-MM-DD` form when no saved session name exists.
- Added `!npc-death-buckets` as the GM-facing bucket control panel.
- Added bucket rename support:
  - `!npc-death-buckets --campaign "Name"`
  - `!npc-death-buckets --chapter "Name"`
  - `!npc-death-buckets --section "Name"`
  - `!npc-death-buckets --session "Name"`
  - `!npc-death-buckets --resetSession`
- Changing a bucket name starts or resumes that named bucket. Existing bucket records and handouts are retained instead of being deleted.
- Every newly recorded NPC death is copied into all four active buckets so Session history can be cleared while Chapter, Section, and Campaign history remain available.
- Added a lazy date-boundary check before every NPCManager command and tracked NPC HP event. A date-managed Session moves to the current sandbox/UTC `YYYY-MM-DD` name before new activity is processed; prior dated buckets and handouts remain available.
- Explicitly named Sessions remain active across date changes. `!npc-death-buckets --resetSession` restores the current UTC date and re-enables automatic date-managed rollover.
- Tracked DM-configurable timezone formatting and date boundaries separately in [Issue #35](https://github.com/Mord-Eagle/GameAssist/issues/35). v0.1.4.5 does not reinterpret historical timestamps.

### Changed — death recording and revival handling

- Death recording no longer depends on TokenMod marker-write success.
- When a linked NPC drops below 1 HP:
  - GameAssist records the death in the active buckets;
  - GameAssist requests the configured death marker through TokenMod when the marker is not already present;
  - `autoHide` behavior is preserved.
- Duplicate open death entries are avoided while an NPC already has an unrevived record.
- When a linked NPC rises above 0 HP:
  - GameAssist annotates the most recent matching unrevived death entry;
  - the annotation is applied across stored buckets and arc entries where a matching entry exists;
  - GameAssist requests marker removal through TokenMod when the marker is present.
- Revival annotations are saved even when an invalid marker configuration or failed TokenMod request prevents visual marker removal.
- Revival annotations preserve history instead of silently deleting the death entry.

### Changed — death reports and handouts

- `!npc-death-report` now opens the active Session bucket by default.
- Added bucket scope selection:
  - `!npc-death-report --scope campaign`
  - `!npc-death-report --scope chapter`
  - `!npc-death-report --scope section`
  - `!npc-death-report --scope session`
- Preserved bounded detail views:
  - `!npc-death-report --recent`
  - `!npc-death-report --page N`
  - `!npc-death-report --help`
- Changed `!npc-death-report --write` to open the report writer before any handout is changed.
- Added `!npc-death-write` and the case-insensitive shorthand `!NPC-WR`.
- Added report-writer actions:
  - `!npc-death-write --all` updates all four active bucket handouts;
  - `!npc-death-write --scope campaign|chapter|section|session` updates one active handout;
  - `!npc-death-write --newSection "Name"` starts or resumes a Section, copies only missing current-Session deaths into it, and updates the Section and Session handouts without rewriting Campaign or Chapter.
- Each bucket writes to one handout named by scope and bucket name, for example:
  - `GameAssist Deaths - Campaign - Campaign`
  - `GameAssist Deaths - Chapter - Chapter`
  - `GameAssist Deaths - Section - Section`
  - `GameAssist Deaths - Session - 2026-07-17`
- Existing legacy `runtime.deathLog` entries are backfilled into active buckets when the bucket system first reads old state and no bucket entries exist.
- The legacy `deathLog` array is retained for compatibility and duplicate/open-death detection.

### Changed — audit output

- `!npc-death-audit` remains the current-page HP/marker mismatch checker.
- Chat output is now a short summary with:
  - mismatch count;
  - explicit scope statement;
  - configured marker;
  - count of NPCs needing a marker;
  - count of NPCs needing marker removal;
  - count of ignored unlinked page items.
- Complete audit rows write to the `GameAssist NPC Death Audit` handout.
- Chat retains bounded, grouped token details under `Add Death Marker` and `Remove Death Marker`, including each affected token's HP, current markers, and token ID.
- The audit continues to check linked NPC tokens only; player characters are intentionally excluded.

### Added — manual arc handouts

- Added `!npc-death-arc` as the GM-facing arc help/list panel, keeping the command within NPCManager's `!npc-death-*` naming family.
- Added manual selected-token capture:
  - `!npc-death-arc --name "Arc Name"`
  - selected linked PC and NPC tokens are appended to `GameAssist Arc - Arc Name`.
- Added session import:
  - `!npc-death-arc --name "Arc Name" --session`
  - current Session bucket deaths are appended without duplicating entries already imported into that arc.
- Added optional note support for selected-token entries:
  - `!npc-death-arc --name "Arc Name" --note "Text"`
- Arc buckets are independent story-note handouts; they do not sit inside Campaign, Chapter, Section, or Session.
- Arc entries now deduplicate by linked creature by default. A selected token that later appears in a full Session import remains one entry and may be enriched with the matching death record.
- Added `--allowDuplicates` as an explicit override when repeated Arc entries are intentional.
- Added `!npc-death-arc --name "Arc Name" --manage` with paged entry controls.
- Added one-entry Remove buttons, `--removeSelected` for selected-token cleanup, and `--undo` for the most recent Arc addition or merge.
- Arc corrections change only the Arc roster and handout; they do not alter Campaign, Chapter, Section, or Session history.

### Changed — review hardening

- Removed the unused init-time Session entry from `DEFAULT_BUCKET_NAMES`. Session defaults continue to call `currentSessionDateKey()` when needed, preserving date rollover while avoiding a misleading frozen-date fallback.
- Added opt-in `preserveRuntimeOnDisable` module-registration metadata. Existing modules continue clearing disposable runtime caches by default.
- NPCManager enables runtime retention so disabling marker automation no longer erases saved Campaign, Chapter, Section, Session, or Arc records; configured-marker teardown still runs.
- Open-death deduplication now requires an exact token ID. Legacy name-only entries remain available in reports but cannot suppress a new death for a different same-named NPC.
- Persisted the legacy death-log migration completion flag in NPCManager runtime state so the migration does not repeat on every command.
- Batched legacy migration handout writes to one update per scope after all retained entries are copied.
- Matched current death records by token ID before using the name-only fallback reserved for legacy entries without token IDs. This keeps separate same-named NPC tokens from sharing one death or revival record.
- Preserved open-death detection across retained buckets after a scoped Session clear, preventing a still-dead NPC from being recorded again in Campaign, Chapter, or Section after another below-zero HP edit.
- Preserved an exact selected-token HP value of `0` in arc state instead of treating it as absent.
- Limited arc revival annotations to entries imported from death history. Ordinary selected-token story notes remain unchanged during later positive-HP edits.

### Added — NPCManager start-here help

- Added `!npc-death-help` as the top-level NPCManager help menu.
- The help menu shows:
  - start-here steps for DMs;
  - a plain-language explanation of Campaign, Chapter, Section, and Session;
  - active bucket names and counts;
  - direct buttons for reading, writing, clearing, audit, and Arc workflows;
  - compact expert command examples.
- Rebuilt `!npc-death-report --help` as the central NPCManager guide and made `!npc-death-help` open the same guide.
- The guide explains the four-level hierarchy, active names and counts, report writing, selected-only versus nested clearing, Arc management, and audit scope with direct action buttons.

### Changed — safer bucket clearing

- The default clear target remains Session.
- Every clear confirmation offers the selected bucket alone.
- Campaign, Chapter, and Section confirmations also offer `--nested`, which clears the selected level and every descendant:
  - Campaign and below: Campaign, Chapter, Section, Session;
  - Chapter and below: Chapter, Section, Session;
  - Section and below: Section, Session.
- Parent levels above the selected level are retained.
- Clearing any set that includes Session also clears the retained legacy `deathLog` mirror.
- Adjacent boolean switches now parse independently, so displayed combinations such as `--nested --confirm` and `--session --allowDuplicates` execute as written.

### Documentation

- Updated `README.md` with NPCManager `1.1.0`, bucket hierarchy, handout names, central help guide, report writer, nested clear choices, date rollover, Arc deduplication, and recovery controls.
- Added a Roll20 API repository readiness checklist to `README.md` covering folder/script naming, `script.json`, header, file types, smoke-test language, license, post-merge wiki upkeep, and the extensionless `GameAssist` versus `.js` submission-artifact check.
- Updated `Smoketest.md` so the in-depth NPCManager checks exercise Campaign, Chapter, Section, and Session naming, the report writer, “new Section from Session,” selected-only and nested clearing, Arc deduplication/override/removal/undo, date-boundary expectations, audit output, and handout refreshes.
- Updated `ROADMAP.md` to record Issue #22 as scoped death-history buckets and handouts rather than a summary-only report pass.
- Updated `script.json` to version `0.1.4.5`, add `0.1.4.4` to `previousversions`, identify NPCManager `1.1.0`, and list the report-writer, nested-clear, and Arc-management command surface.

### MECHSUITS records

- Updated `[GAMEASSIST:POLICY]` because the death-report summary/detail caps are runtime behavior knobs.
- Updated `[GAMEASSIST:APP:UTILS]` because adjacent boolean flags no longer consume one another as values.
- Updated `[GAMEASSIST:CORE]` because the runtime `VERSION` constant advanced.
- Updated `[GAMEASSIST:MODULES:NPCMANAGER]` because the public death-report, writer, help, bucket, audit, Arc, revival, rollover, and hierarchical-clear behavior changed.
- Preserved existing section tags, codename `GAMEASSIST`, and command names.

### Release artifacts

The v0.1.4.4 artifact remains preserved. The current repository script and the new v0.1.4.5 versioned artifact share this repository blob SHA-256:

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `F6D9AAE9906C4ACF5494861032F8CCB50709B3FCA06454EC4116CD6D03577578` |
| `GameAssist-v0.1.4.5` | `F6D9AAE9906C4ACF5494861032F8CCB50709B3FCA06454EC4116CD6D03577578` |

Local Roll20 test copy:

| Artifact | SHA-256 |
| --- | --- |
| `outputs/GameAssist-v0.1.4.5-pr34-test.js` | `95487BA6297884561CE3F51667E84B13990246151B924D9F9638742AD11C0950` |

### Verification

| Check | Result |
| --- | --- |
| `node --check .\GameAssist` | Passed |
| `script.json` JSON parse | Passed |
| `GameAssist` versus `GameAssist-v0.1.4.5` byte identity | Passed |
| NPCManager review regression checks for migration, same-name tokens, scoped clearing, arc revival eligibility, and zero HP | Passed |
| NPCManager behavioral harness: Arc deduplication/override/removal/undo, selected-only and nested clearing, Section seeding, and simulated date rollover | Passed (22 assertions) |
| Copilot follow-up harness: custom Session retention, date-mode reset/rollover, and revival annotation despite marker-resolution failure | Passed (9 assertions) |
| NPC death-audit chat/handout regression: two named mismatches with HP, markers, and token IDs in chat plus complete handout details | Passed (12 assertions) |
| Five-revision preservation audit: commands, defaults, state repair, queue, dependencies, marker identity, module UX, HP rolling, and NPCManager lifecycle | Passed after correcting NPCManager disable retention |
| Legacy name-only deduplication regression: a retained legacy name does not block a new token-ID-bearing death | Passed |
| MECHSUITS section pairing, nesting, metadata, footers, and canonical-tree agreement | Passed (19 sections) |
| `git diff --cached --check` | Passed |
| Roll20 API sandbox acceptance checklist | Pending DM smoke test |

The Roll20 sandbox checklist remains the release acceptance test for live marker changes, chat rendering, and handout behavior.

---

## [0.1.4.6] – 2026-07-17

### Release definition

v0.1.4.6 is a focused GameAssist status-readability release for Issue #23. It replaces the flat technical `!ga-status` list with a short, action-oriented system check for DMs and retains volatile counters and internal diagnostics in an optional troubleshooting view. It also preserves an enabled module's configured intent when a confirmed missing dependency prevents startup, allowing the status panels to report the skip accurately. It does not change gameplay-module commands, marker behavior, TokenMod communication, StatusInfo interoperability, queue execution, runtime caches, or NPCManager history.

### Issue addressed

- [#23](https://github.com/Mord-Eagle/GameAssist/issues/23) — Make `!ga-status` output easier for DMs to interpret.

### Changed — default system check

- Rebuilt `!ga-status` as a Roll20 default-template panel titled `GameAssist 0.1.4.6 System Check`.
- The first panel now presents four decisions in reading order:
  - overall health and whether the DM needs to act;
  - how many enabled modules are running and how many modules are turned off;
  - errors recorded during the current Roll20 sandbox session;
  - dependency evidence with a plain-language next action.
- Added a separate `GameAssist Actions` whisper immediately below the simple status table with direct buttons for:
  - Troubleshooting Details;
  - Module List;
  - Open Settings.
- Deliberately disabled modules are reported as turned off rather than failures.
- Dependency warnings from disabled modules are excluded from the active health decision.
- Modules skipped during startup for a confirmed missing dependency remain configured, appear as needing attention, and contribute to the dependency-skipped count.

### Added — troubleshooting details

- Added `!ga-status --details`; `!ga-status details` is accepted as an equivalent readable form.
- The details panel preserves the prior diagnostic surface with clearer labels:
  - registered, enabled, running, and dependency-skipped module counts;
  - commands, chat messages, and errors recorded in the current sandbox session;
  - explicit queue length and the reminder that normal Roll20 events execute directly;
  - average duration for explicitly queued tasks;
  - last recorded activity in sandbox-local display time;
  - GameAssist's internally tracked event-hook count.
- The event-hook count explicitly states that it is troubleshooting information rather than a health or pass/fail test.
- Added buttons to refresh details, return to the simple view, open the module list, and view metrics.
- Moved those detailed-view buttons into a separate `Troubleshooting Actions` whisper immediately below the details table.

### Changed — health interpretation

- `Ready - GameAssist is responding and every enabled module is running.` appears when enabled modules are active, no current-sandbox error is recorded, and enabled-module dependencies are confirmed.
- `Ready - enabled modules are running. A marker check is recommended.` appears when Roll20 cannot confirm a dependency but enabled modules are otherwise active.
- `Attention needed - review the items below.` appears when GameAssist has recorded an error, an enabled module is stopped, or an enabled module has a confirmed missing dependency.
- `unverifiable` remains non-fatal. The panel explains that Roll20 may not expose enough metadata and recommends one real death or concentration marker test.
- Confirmed missing dependencies identify the dependency and affected enabled modules, then recommend installing/enabling the dependency or turning off the affected module.
- Startup now checks whether a module was deliberately disabled before diagnosing its dependencies. This prevents optional disabled modules from producing startup dependency warnings.
- Startup no longer rewrites `config.enabled` to `false` when a confirmed missing dependency skips a configured module. Preserving that setting distinguishes the skipped module from one the DM intentionally disabled.
- Manual `!ga-enable <Module>` retries with confirmed missing dependencies now refuse activation without changing the module's existing configuration. Configured-and-skipped modules remain visible as needing attention, while deliberately disabled modules remain disabled.
- `disableModule()` now considers both persistent configuration and runtime state before reporting that a module is already disabled. A configured-but-inactive dependency skip can therefore be turned off through `!ga-disable` or `!ga-config set <Module> enabled=false`, clearing the corresponding status warning.

### Corrected — duration and terminology

- Corrected a live Roll20 rendering failure in which button-only rows inside the default template were omitted. Status navigation now uses ordinary GM whispers while the health information remains in the default-template table.
- Removed the malformed `Avg Task Duration: N/Ams` output.
- When no queued duration exists, the details panel now reads `N/A - no queued task duration has been recorded.`
- Numeric averages use a spaced unit, for example `15.00 ms`.
- Replaced the ambiguous `Active Listeners` label with `GameAssist Event Hooks` and qualified its limited diagnostic meaning.
- Replaced the raw `Last Update` value with `Last Recorded Activity` and a human-readable sandbox-time display.
- Separated health results from session activity counters so changing command/message counts no longer look like fixed installation expectations.

### Compatibility boundaries

- Preserved the six bundled modules and all prior command literals.
- Kept TokenMod as the standalone marker-mutation dependency for the `v0.1.4.x` line.
- Did not implement any of Issue #24's remaining TokenMod or StatusInfo interoperability work.
- Preserved `!ga-config modules` as the detailed per-module configured/runtime/dependency view.
- Preserved `!ga-metrics` as the longer persisted activity history.
- Preserved captured `R20_ON` routing and the refusal to replace Roll20 global `on` or `off`.

### Version and MECHSUITS records

- Advanced the script header, MECHSUITS banner `project_version`, prose guarantee, visible license banner, runtime `VERSION`, README, smoke-test target, and `script.json` to `0.1.4.6`.
- Added `0.1.4.5` to `script.json.previousversions`.
- Updated `[GAMEASSIST:CORE]` because the runtime version changed.
- Updated `[GAMEASSIST:CORE:OBJECT]` because failed dependency enable attempts now preserve the module's existing configured intent.
- Updated `[GAMEASSIST:INTERFACES:COMMANDS]` because `!ga-status` output, health interpretation, dependency scoping, and public `--details` behavior changed.
- Updated `[GAMEASSIST:BOOTSTRAP]` because startup now preserves configured intent for dependency-skipped modules and checks deliberate disables before dependency diagnostics.
- Left POLICY, APP utilities, queue, compatibility, state, event interface, and all six gameplay-module sections unchanged.
- Preserved the literal `GAMEASSIST` codename, all section tags, and the file-scoped canonical tree.

### Documentation

- Updated `README.md` with the simple/details status split, command syntax, health interpretation, troubleshooting workflow, upgrade path, current release posture, and release summary.
- Updated `Smoketest.md` with DM-readable expected output, button checks, details-panel checks, variable-counter guidance, dependency interpretation, and the corrected unavailable-duration display.
- Updated `ROADMAP.md` to move Issue #23 to sandbox verification while leaving Issue #24 planned separately.
- Added a standalone Issue #23 Roll20 test script and concise acceptance checklist outside the repository working tree.

### Release artifacts

The current repository script and versioned artifact share this Git-normalized SHA-256:

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `859FE5A08516EEBE42D7BB2C05733AE28E5DD49E5954045C4A9D4CA7EC44EAEF` |
| `GameAssist-v0.1.4.6` | `859FE5A08516EEBE42D7BB2C05733AE28E5DD49E5954045C4A9D4CA7EC44EAEF` |

Local Roll20 test copy:

| Artifact | SHA-256 |
| --- | --- |
| `outputs/GameAssist-v0.1.4.6-issue23-test.js` | `233C20EB6AC6011E8BF26AE8828738C6C8B85E8BBDCD072759F2369786FFEF01` |

### Verification

| Check | Result |
| --- | --- |
| JavaScript syntax for repository, versioned, local Roll20, and harness artifacts | Passed |
| `script.json` parse and version/previous-version metadata | Passed |
| Default, detailed, action-strip, confirmed, unverifiable, missing, startup-skipped, refused-enable, skipped-disable, deliberately-disabled, recorded-error, numeric-duration, and command-boundary status scenarios | Passed (57 assertions) |
| `GameAssist`, `GameAssist-v0.1.4.6`, and local Roll20 test copy normalized identity | Passed |
| Unchanged v0.1.4.5 leaf sections: POLICY, APP utilities, queue, compatibility, state, event interface, and all modules | Passed (12 sections) |
| Prior command-literal preservation | Passed |
| MECHSUITS section pairing and proper nesting | Passed (19 sections) |
| Global Roll20 `on`/`off` non-override contract | Passed |
| `git diff --check` | Passed |
| Roll20 chat rendering and button acceptance | Pending DM smoke test |

The Roll20 API sandbox remains the final acceptance environment for default-template rendering and clickable chat buttons.

---

## [0.1.4.7] – 2026-07-17

### Release definition

v0.1.4.7 is the focused standalone-interoperability release for Issue #24 and the final planned implementation pass in the `v0.1.4.x` line. It keeps TokenMod and StatusInfo as separately installed Roll20 Mod/API scripts while strengthening the way GameAssist detects, authorizes, verifies, and explains marker operations.

The release does not embed either upstream script, introduce the future MarkerService architecture, or replace TokenMod marker mutation with direct `token.set('statusmarkers', ...)` calls. NPCManager and ConcentrationTracker continue sending marker work through TokenMod so StatusInfo can receive TokenMod's observer notifications.

### Issue addressed

- [#24](https://github.com/Mord-Eagle/GameAssist/issues/24) — Stabilize standalone TokenMod and StatusInfo interoperability across the `v0.1.4.x` release line.

### Supported standalone baselines

| Script | Supplied baseline | Contract used by GameAssist |
| --- | --- | --- |
| TokenMod | `0.8.88` | `TokenMod.ObserveTokenChange`, `API_Meta.TokenMod.version`, `--api-as`, `--ids`, and `--set statusmarkers` |
| StatusInfo | `0.3.11` | Optional `StatusInfo` public object/version plus its existing subscription to `TokenMod.ObserveTokenChange` |

These versions remain independently authored and licensed upstream. GameAssist does not copy or modify their source in this release.

### Diagnosed — script-originated TokenMod authorization

- GameAssist previously generated commands in this form:

  ```text
  !token-mod --ids <token-id> --set statusmarkers|+dead
  ```

- A command generated through `sendChat('api', ...)` reaches TokenMod with the API pseudo-player rather than a normal GM player id.
- TokenMod `0.8.88` discards `--ids` targets for a non-GM caller unless either:
  - TokenMod's player-facing `players-can-ids` option is enabled; or
  - the script-originated command uses TokenMod's documented `--api-as <player-id>` option to select a GM identity.
- GameAssist now discovers a campaign GM player id and uses the documented `--api-as` path. Internal marker automation therefore no longer depends on enabling `players-can-ids` for players.
- If no GM identity can be found, GameAssist falls back only when TokenMod explicitly reports `playersCanUse_ids=true`; otherwise it refuses the request and gives the GM an actionable warning.

### Added — standalone contract evidence

- Added shared TokenMod evidence collection in `[GAMEASSIST:APP:UTILS]`:
  - confirms the public `ObserveTokenChange` contract when visible;
  - reads the upstream version from `API_Meta.TokenMod.version` when available;
  - reads the TokenMod `playersCanUse_ids` state only as fallback authorization evidence;
  - does not treat stale persistent TokenMod state by itself as proof that the script is currently installed.
- Added optional StatusInfo evidence:
  - confirms the public StatusInfo object and observer contract when visible;
  - reports `StatusInfo.version`;
  - reports whether `state.STATUSINFO.config.showDescOnStatusChange` is enabled, disabled, or unavailable.
- Updated core dependency checks to use confirmed public TokenMod evidence before falling back to Roll20's sometimes-unavailable internal script list.
- Preserved the three dependency states `confirmed`, `missing`, and `unverifiable`; absence of public evidence remains non-fatal when Roll20 cannot expose a definitive script list.

### Added — marker-result verification

- Added one shared standalone TokenMod request helper for NPCManager and ConcentrationTracker.
- Each request:
  - validates the token and resolved stored marker id;
  - avoids sending work when the token already has the requested state;
  - sends the exact built-in id or custom stored tag through TokenMod;
  - uses `--api-as <GM player id>` whenever a GM identity is available;
  - waits one second, then rereads the token's actual `statusmarkers` value;
  - remains quiet when TokenMod reached the requested state;
  - warns the GM when the state did not change as requested.
- Failure warnings name the token, distinguish add from remove failures, and provide a direct command such as:

  ```text
  !token-mod --ids @{selected|token_id} --set statusmarkers|+dead
  ```

- Pending verification is keyed by token and marker. A newer request supersedes an older pending check so a rapid add/remove sequence does not report the stale request as a failure.
- Verification is delayed with `POLICY.standaloneInterop.markerVerificationDelayMs`; normal Roll20 event execution and the explicit queue model are unchanged.

### Changed — NPCManager 1.1.1

- Advanced NPCManager's independent module version from `1.1.0` to `1.1.1`.
- Routed death-marker add, revival-marker removal, and module-teardown removal through the shared verified TokenMod request helper.
- Corrected the NPCHPRoller auto-roll-on-add initialization race:
  - Roll20 can expose blank or zero placeholder HP while a newly added token is still being initialized;
  - NPCManager now opens a two-second, POLICY-owned setup window when NPCHPRoller `autoRollOnAdd=true`;
  - placeholder HP changes during that window do not add the death marker or create death/revival history;
  - an unknown or blank previous HP value is not treated as proof that a living NPC crossed below 1 HP;
  - later known-positive-to-zero and zero-to-positive changes remain ordinary tracked deaths and revivals.
- Preserved death-history behavior independently of visual marker success:
  - a qualifying death is still recorded in Campaign, Chapter, Section, and Session buckets;
  - revival annotations remain independent of marker removal;
  - Arc and handout behavior is unchanged.
- Teardown no longer reports that markers were already cleared immediately after asynchronous TokenMod commands. It now reports how many removals were requested and states that results will be verified.
- The default built-in death marker remains the literal `dead` id.

### Changed — ConcentrationTracker 0.1.0.6

- Advanced ConcentrationTracker's independent module version from `0.1.0.5` to `0.1.0.6`.
- Routed concentration marker add, `--off` removal, failed-save removal, and module-teardown removal through the shared verified TokenMod request helper.
- Preserved exact custom marker behavior from v0.1.4.3:
  - configured display names resolve through the campaign registry;
  - exact stored tags remain usable without registry access;
  - built-in ids remain literal and exact;
  - `!concentration --status` continues reading token markers directly rather than depending on TokenMod.
- Teardown now reports requested removals without claiming completion before marker verification.

### Preserved — StatusInfo observation path

- Token mutation remains inside standalone TokenMod.
- TokenMod continues calling its registered `ObserveTokenChange` handlers after applying token changes.
- StatusInfo `0.3.11` already registers a TokenMod observer and routes those notifications through its status-marker change handler.
- GameAssist does not emit a second condition description or call StatusInfo internals directly.
- `!ga-status --details` reports StatusInfo evidence, but live condition-description behavior remains a Roll20 smoke-test requirement because campaign condition definitions are user-configurable.

### Changed — troubleshooting status

- Added a `Standalone Integrations` row to `!ga-status --details`.
- When evidence is available, the row reports:
  - detected TokenMod version and that authorized marker requests are verified;
  - detected optional StatusInfo version;
  - whether StatusInfo condition descriptions are enabled.
- The default `!ga-status` panel remains short and unchanged in purpose.
- StatusInfo remains optional and does not affect overall GameAssist health.

### Compatibility boundaries

- Preserved all existing GameAssist command literals.
- Preserved standalone TokenMod as the required marker dependency for NPCManager and ConcentrationTracker.
- Preserved standalone StatusInfo as an optional condition-description and menu script.
- Did not add integrated `[GAMEASSIST:MODULES:TOKENMOD]`, `[GAMEASSIST:MODULES:STATUSINFO]`, or `[GAMEASSIST:CORE:MARKERSERVICE]` sections; those remain assigned to the `v0.1.5.x` roadmap.
- Did not modify `state.TokenMod` or `state.STATUSINFO` beyond read-only interoperability diagnostics.
- Did not change GameAssist's persistent state schema or configuration snapshot schema.
- Did not route marker verification through the serialized queue.

### Version and MECHSUITS records

- Advanced the script header, MECHSUITS banner `project_version`, prose guarantee, visible release banner, runtime `VERSION`, README, smoke-test target, and `script.json` to `0.1.4.7`.
- Added `0.1.4.6` to `script.json.previousversions`.
- Updated `[GAMEASSIST:POLICY]` for the marker-verification delay and NPC HP initialization grace period.
- Updated `[GAMEASSIST:APP]` and `[GAMEASSIST:APP:UTILS]` for external evidence, TokenMod authorization, outcome verification, and StatusInfo observer preservation.
- Updated `[GAMEASSIST:CORE]` and `[GAMEASSIST:CORE:OBJECT]` for the release version and public-contract dependency confirmation.
- Updated `[GAMEASSIST:INTERFACES:COMMANDS]` for the new troubleshooting evidence.
- Updated `[GAMEASSIST:MODULES:NPCMANAGER]` for verified marker requests, new-token initialization suppression, and its independent module patch version; updated `[GAMEASSIST:MODULES:CONCENTRATIONTRACKER]` for verified marker requests and its independent module patch version.
- Updated `[GAMEASSIST:BOOTSTRAP]` for the v0.1.4.7 startup version record without changing lifecycle order.
- Preserved the literal `GAMEASSIST` codename, existing tag names, nesting, and file-scoped canonical tree.

### Documentation

- Updated `README.md` with:
  - TokenMod `0.8.88` and StatusInfo `0.3.11` supported baselines;
  - standalone installation boundaries;
  - `players-can-ids` clarification;
  - direct failure-recovery commands;
  - module version updates;
  - v0.1.4.6 to v0.1.4.7 upgrade and rollback guidance.
- Updated `Smoketest.md` with:
  - expected contract-aware dependency results;
  - the new `Standalone Integrations` troubleshooting row;
  - an initial `players-can-ids` OFF-state isolation pass followed, when applicable, by a restored campaign-setting compatibility pass;
  - TokenMod direct-command isolation;
  - optional StatusInfo observer checks;
  - add/remove/teardown and delayed-warning acceptance checks;
  - an NPCHPRoller auto-roll-on-add check that refuses false death/revival history while preserving later gameplay transitions.
- Updated `ROADMAP.md` to move Issue #24 into live Roll20 acceptance while keeping integrated TokenMod, StatusInfo, and MarkerService work in `v0.1.5.x`.

### Roll20 API sandbox acceptance

- Completed the focused v0.1.4.7 acceptance pass with standalone TokenMod `0.8.88` and optional StatusInfo `0.3.11` behavior enabled for the campaign.
- Confirmed GameAssist health and standalone-integration diagnostics respond with the expected module/dependency posture.
- Confirmed NPCManager adds and removes the built-in `dead` marker, records genuine death/revival history, and completes audit/report/teardown workflows.
- Confirmed NPCHPRoller auto-roll-on-add establishes a new NPC's starting HP without flashing the death marker or creating a false death/revival pair.
- Confirmed a later genuine positive-to-zero change on that auto-rolled NPC is still recorded and a later positive-HP change is still annotated as revival.
- Confirmed ConcentrationTracker marker add, direct status reading, removal, and teardown behavior.
- Confirmed StatusInfo continues observing the relevant TokenMod marker changes without duplicate GameAssist condition output.
- Confirmed the marker workflows remain functional after restoring the campaign's normal TokenMod `players-can-ids` setting.

### Release artifacts

The repository script and versioned artifact share this Git-normalized SHA-256:

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `ADBC0F18CD3517E50A91CEBAA05D83ABD531F9595130F2EF3B750548C05D4953` |
| `GameAssist-v0.1.4.7` | `ADBC0F18CD3517E50A91CEBAA05D83ABD531F9595130F2EF3B750548C05D4953` |

Local Roll20 test copy:

| Artifact | SHA-256 |
| --- | --- |
| `outputs/GameAssist-v0.1.4.7-issue24-test.js` | `0E3D0CE9C97B6A9EACB587C3486E2ABC774A876D8160499EF4BF3FF604AF903C` |

### Verification

| Check | Result |
| --- | --- |
| JavaScript syntax for repository, versioned, local Roll20, and both harness artifacts | Passed |
| Existing status/lifecycle regression harness | Passed (57 assertions) |
| Focused TokenMod/StatusInfo interoperability and NPC initialization harness | Passed (31 assertions) |
| Built-in `dead` add/remove with `players-can-ids=false` | Passed in simulation |
| NPCHPRoller auto-roll-on-add placeholder HP suppression | Passed in simulation |
| Genuine post-initialization NPC death/revival tracking | Passed in simulation |
| Custom concentration tag add/remove/status | Passed in simulation |
| NPCManager and ConcentrationTracker teardown marker requests | Passed in simulation |
| Deliberately failed TokenMod mutation and actionable warning | Passed in simulation |
| TokenMod observer notification path used by StatusInfo | Passed in simulation |
| `script.json` parse and version/previous-version metadata | Passed |
| `GameAssist`, `GameAssist-v0.1.4.7`, and local Roll20 test copy normalized identity | Passed |
| MECHSUITS section pairing, proper nesting, metadata, footers, and canonical-tree agreement | Passed (19 sections; 19 canonical-tree entries) |
| Unchanged implementation-section regression | Passed (8 sections) |
| Prior command-literal preservation | Passed (135 unique literals) |
| Global Roll20 `on`/`off` non-override contract | Passed |
| `git diff --check` | Passed |
| Roll20 API sandbox acceptance with TokenMod and optional StatusInfo | Passed |

The Roll20 API sandbox acceptance pass confirmed real `sendChat` routing, TokenMod timing, token marker persistence, StatusInfo condition-description behavior, and NPCHPRoller/NPCManager initialization ordering for this release candidate.

---

## [0.1.5.0] – 2026-07-18

### Release definition

GameAssist v0.1.5.0 is the integrated marker, token, and condition architecture release. Its automated, upgrade, lifecycle, documentation, artifact, review, and Roll20 acceptance gates are complete. MarkerService, TokenAssist, and ConditionAssist replace standalone TokenMod and StatusInfo for supported GameAssist workflows.

The completed checkpoints implement [Issue #25](https://github.com/Mord-Eagle/GameAssist/issues/25), MarkerService and migration of existing marker consumers; [Issue #26](https://github.com/Mord-Eagle/GameAssist/issues/26), ConditionAssist and supported `!condition` workflows; [Issue #27](https://github.com/Mord-Eagle/GameAssist/issues/27), TokenAssist and its initial branded token-control surface; [Issue #28](https://github.com/Mord-Eagle/GameAssist/issues/28), integrated stabilization; and [Issue #29](https://github.com/Mord-Eagle/GameAssist/issues/29), the final release audit. These were checkpoints within `v0.1.5.0`, not separate public versions.

### Added – CORE:MARKERSERVICE

- Added the properly nested `[GAMEASSIST:CORE:MARKERSERVICE]` section.
- Added `GameAssist.MarkerService` as toggleable core infrastructure with independent service version `1.0.0`.
- Added built-in marker resolution for Roll20's standard marker identifiers.
- Added custom marker resolution through Roll20's documented `Campaign().get('token_markers')`, with `Campaign().get('_token_markers')` retained as a compatibility fallback, including:
  - exact display-name matches;
  - case-folded display-name fallback;
  - stored custom tags;
  - direct `Name::id` tags that do not depend on successful registry parsing.
- Preserved the prior precedence rule in which a literal lowercase built-in id such as `dead` selects the built-in marker before a same-named custom display marker.
- Added structured marker reads that retain:
  - the complete stored marker string;
  - marker order;
  - duplicate entries;
  - custom tags;
  - number overlays.
- Added `resolve`, `read`, `inspect`, `has`, `add`, `remove`, `toggle`, `set`, `observe`, `clearObservers`, `getRegistry`, and `normalizeId`.
- Added explicit operation results containing success state, stable error code, diagnostic message, changed/verified state, resolved marker identity, and before/after entries.
- Added one shared `change:graphic:statusmarkers` observation contract for integrated modules and future consumers.

### Advanced – MarkerService 1.0.1

- Added `artwork(marker)` as a presentation-neutral metadata API.
- Added Roll20 built-in color, `dead`, and status-sheet artwork metadata.
- Retained campaign custom-marker image URLs from Roll20's documented `token_markers` registry or `_token_markers` compatibility fallback so consuming modules can display registered custom artwork.
- Kept artwork lookup non-fatal: marker behavior continues when artwork is unavailable, and chat consumers can fall back to a readable marker name.
- Kept MarkerService free of module-specific chat HTML; ConditionAssist remains responsible for rendering its own panels.

### MarkerService lifecycle and dependency safeguards

- Registered MarkerService as a first-class core service visible through `!ga-config modules` and ConfigUI.
- Added `!ga-enable MarkerService` and `!ga-disable MarkerService` support through the existing lifecycle commands.
- Declared ConditionAssist, TokenAssist, NPCManager, ConcentrationTracker, and DebugTools as MarkerService dependents.
- Disabling MarkerService first disables those dependent modules so their teardown can use marker access for cleanup, then disables the service itself.
- CritFumble, ConfigUI, and NPCHPRoller remain available while MarkerService is off.
- Re-enabling a dependent module is refused until MarkerService is enabled.
- A sandbox reload preserves the DM's disabled MarkerService choice and turns off any inconsistent dependent configuration left enabled in persistent state.
- MarkerService operations return `UNAVAILABLE` with an actionable enable command while the service is disabled.
- The disable notice explains that standalone TokenMod by The Aaron and StatusInfo by Robin Kuiper provide separate token-marker and condition tools but do not restore GameAssist death-history or concentration features.
- Lifecycle component names resolve case-insensitively, and unknown names are reported as missing GameAssist modules or services rather than treating every lifecycle target as a module.
- Marker observer registrations pause while MarkerService is disabled and resume after re-enable, preserving once-wired dependent observers.

### Added – ConditionAssist 1.0.0

- Added the properly nested `[GAMEASSIST:MODULES:CONDITIONASSIST]` section and exposed `GameAssist.ConditionAssist` version `1.0.0`.
- Added the ConditionAssist module name, public API, state branch, and MECHSUITS section.
- Preserved supported `!condition` compatibility workflows:
  - selected-token condition menu;
  - quick-start help;
  - direct condition descriptions;
  - add, remove, and toggle actions for one or more conditions;
  - GM settings and condition-definition management;
  - guarded reset, export, and validated import.
- Added separate GM controls for player description access and player token-condition changes.
- Added 15 concise, original GameAssist condition summaries with established StatusInfo marker associations as the compatibility foundation.
- Supported built-in ids, custom display names, exact stored custom tags, and numbered markers in condition definitions.
- Routed every condition marker read, add, remove, toggle, and marker-change observation through MarkerService.
- Added marker-change descriptions while suppressing repeated descriptions produced by one short burst of equivalent changes.
- Added `GameAssist.ConditionAssist.getCondition`, `getConditions`, and `apply` for validated programmatic use.
- Protected the condition-definition and migration-record maps from generic `!ga-config set` replacement.

### ConditionAssist migration and compatibility

- Added a non-destructive first-start migration from valid `state.STATUSINFO` configuration and condition definitions.
- Preserved the legacy `state.STATUSINFO` branch for rollback rather than deleting or moving it.
- Recorded migration source, timestamp, copied setting names, and copied definition count under ConditionAssist configuration.
- Normalized upstream `icon` fields into ConditionAssist `marker` fields and retained numbered/custom values.
- Added whole-payload import validation, unsafe-key refusal, definition-count and content-length limits, and apply-only-after-complete-validation behavior.
- Added an explicit startup warning when standalone StatusInfo is detected because both tools respond to `!condition` and condition-marker changes.
- Compared the supplied StatusInfo `0.3.11` baseline with the published `0.3.12` package. The package still declares internal version `0.3.11`; its only executable difference is the character-sheet identification lookup, which ConditionAssist does not adapt.
- Pinned the published comparison to Roll20 repository snapshot `9d634d3149985dcf10333920b3f4c41f215f39fc` and file blob `d3054aa8660f1eda47c424c4984e1850760e5c1a`.
- Preserved Robin Kuiper attribution, the Roll20 API Scripts MIT notice, upstream links, adapted concepts, and GameAssist implementation details in `ATTRIBUTIONS.md`.

### Advanced – ConditionAssist 1.0.1

- Corrected selected-token active-condition reporting. `MarkerService.has()` returns a boolean; the menu had incorrectly treated that boolean as a structured inspection object, causing real markers to display as `No tracked conditions` even though add/remove/toggle behavior worked.
- Added GM-only `!condition status` and `!condition --status` commands plus a **Condition Status** menu button.
- The current-page status roster lists linked characters and NPCs that have at least one marker, reports configured ConditionAssist definitions under **Conditions**, and keeps death, concentration, counters, or other active markers under **Other markers** rather than mislabeling them as conditions.
- Unmarked tokens are omitted, marked unlinked scenery/labels/props are counted separately, and the chat roster is bounded by POLICY so a crowded page cannot produce an unbounded panel. The complete roster is written to the `GameAssist Condition Status` handout.
- Added the dynamic, read-only, case-insensitive `!cond-<condition>` command family. Commands such as `!cond-prone`, `!COND-EXHAUSTION`, and a DM-created condition key show the active configured wording without selecting a token or changing marker state.
- Preserved the existing description permission boundary: players may use the short references only when **Players may view descriptions** is enabled; GMs retain access while the module is running.
- Replaced the initial ConditionAssist default catalog with the complete fifteen-condition SRD catalog:
  - added Exhaustion;
  - removed Inspiration from clean defaults because Inspiration is not an SRD condition;
  - retained the established built-in marker choices for the other conditions;
  - assigned `half-haze` as the default Exhaustion marker.
- Added selectable rules-wording profiles:
  - **2014 SRD** is the clean-install and reset default;
  - **2024 SRD** applies SRD 5.2.1 condition mechanics and wording;
  - **Campaign Custom** identifies a definition set after the GM manually edits a description or imports definitions without an explicit SRD profile.
- Made wording profile changes non-destructive. Switching between 2014 and 2024 updates only the fifteen official condition names and descriptions while preserving:
  - existing marker assignments, including custom tags and numbered markers;
  - additional campaign-defined conditions;
  - unrelated ConditionAssist permissions and command configuration.
- Added a confirmation prompt before an SRD profile replaces the official descriptions.
- Added automatic upgrade recognition for untouched ConditionAssist 1.0.0 defaults. Only an exact match is replaced with the complete 2014 catalog; any edited or migrated map is retained and labeled Campaign Custom.
- Editing a condition description now changes `rulesProfile` to `custom`, making the Settings panel accurately identify the source of the active wording.
- Advanced ConditionAssist configuration schema from version 1 to version 2 and included `rulesProfile` in validated exports and imports.
- Protected `rulesProfile` from generic `!ga-config set` replacement so profile changes use the guarded ConditionAssist settings workflow.
- Added a definition-menu warning when multiple configured conditions resolve to the same marker. The warning identifies the affected conditions because one marker addition can legitimately produce more than one matching description.
- Added built-in marker artwork and registered campaign custom-marker images to condition panels. Conditions continue to display readable marker names when exact custom-tag artwork cannot be recovered from Roll20's registry.
- Added a GM-only `!condition announce` workflow:
  - captures up to twelve selected linked character tokens before later menu clicks;
  - lists every configured official or campaign-created condition;
  - waits until the GM chooses a final delivery button before changing token state;
  - toggles the configured marker exactly once on every captured token and verifies the stored result through MarkerService;
  - reports one neutral character-first statement for every verified token, including mixed selections;
  - offers public updates and targeted whispers to non-GM character controllers;
  - offers exact condition wording in public chat or controller whispers;
  - refuses a player-whisper action before changing markers when none of the selected characters has a non-GM controller;
  - omits failed token changes from success announcements and gives the GM the verification failure details.
- Added the case-insensitive `!c-a` and `!cond-!` aliases for the same GM announcement workflow. The symbolic alias is handled deliberately inside the existing `!cond-<condition>` route so it cannot become an accidental condition lookup.
- Changed announcement result wording to one character-first statement per verified token: **Character is Condition** when applied and **Character is no longer Condition** when removed.
- Added a narrow saved-definition repair that displays an exact **Concentration** condition name as **Concentrating** while preserving its existing key, marker, description, and legacy state source.
- Removed the unreleased `randomizeAnnouncements` setting and condition-agnostic creative narration after sandbox testing showed that universal flavor text became awkward or inaccurate across varied conditions.
- Suppressed ordinary marker-add descriptions during announcement-owned writes so one final action produces one deliberate result panel instead of a second automatic condition-description panel. Direct Roll20 marker changes continue to show descriptions when that setting is enabled.
- Added expiring, bounded **Read Exact Wording** buttons. A player who clicks a GM-issued button receives the exact condition text privately without receiving permanent access to unrestricted condition commands.
- Corrected controller-targeted delivery to use Roll20's documented Player `_displayname` field, retaining `displayname` as a compatibility fallback. This prevents **Toggle & Whisper** and **Toggle & Whisper Wording** from falling back to the GM when a controlling player's legacy display-name field is absent.
- Added clear diagnostics for unlinked selections, duplicate character selections, oversized selections, and characters without non-GM controllers.
- Updated the public API to report component version `1.0.1`, schema version `2`, and expose the active profile through `rulesProfile()`.
- Added the required SRD 5.1 and SRD 5.2.1 Creative Commons Attribution 4.0 notices to `ATTRIBUTIONS.md` and documented that non-SRD sourcebook condition text is not included.

### Added – TokenAssist 1.0.1

- Added the properly nested `[GAMEASSIST:MODULES:TOKENASSIST]` section and exposed `GameAssist.TokenAssist` version `1.0.1`.
- Added TokenAssist, `GameAssist.TokenAssist`, and the MECHSUITS tag `[GAMEASSIST:MODULES:TOKENASSIST]`.
- Preserved compatible settings from earlier v0.1.5.0 development builds before startup auditing while leaving malformed or unrelated unknown state available to the warning-only auditor.
- Established `!token-assist`, `!ta`, and `!ta-*` as the primary command families.
- Kept older supported `!token-mod` macros available temporarily through v0.1.x with a warning and a v0.2.0 removal deadline.
- Added the `!token-assist` command family:
  - `!token-assist help` opens a concise selected-token guide with common examples and configuration buttons;
  - `!token-assist about` summarizes TokenAssist capabilities, TokenMod credit, and current limits;
  - `!token-assist config` opens TokenAssist configuration.
- Added `!ta` as a short full-parser alias and `!ta-on`, `!ta-off`, `!ta-flip`, `!ta-set`, `!ta-move`, `!ta-order`, `!ta-report`, `!ta-ids`, `!ta-config`, and help aliases for fast table use.
- Added case-insensitive command routing for the TokenAssist commands and deprecated alias with exact token/prefix boundaries, avoiding partial matches against longer unrelated commands.
- Preserved normal direct execution for token commands; TokenAssist does not route ordinary token mutations through GameAssist's explicit queue.

### TokenMod credit and provenance

- Selected TokenMod `0.8.88` by The Aaron, Arcane Scriptomancer, as the compatibility and design baseline.
- Pinned the consulted source to:
  - repository: `Roll20/roll20-api-scripts`;
  - commit: `9d634d3149985dcf10333920b3f4c41f215f39fc`;
  - path: `TokenMod/0.8.88/TokenMod.js`;
  - blob: `fc6c9cb45ec2f2ee254a24f849e089507a0e610a`.
- Added the pinned provenance to the in-file MECHSUITS footer, public `GameAssist.TokenAssist.reference` metadata, README, roadmap, and `ATTRIBUTIONS.md`.
- Preserved the applicable Roll20 API Scripts MIT copyright and permission notice.
- Recorded the TokenMod compatibility concepts used by TokenAssist separately from GameAssist lifecycle, parser, validation, diagnostics, state migration, collision handling, MarkerService integration, help presentation, and public API behavior.

### Supported TokenAssist command surface

- Added selected-token targeting for tokens available through Roll20's normal selection controls.
- Added explicit `--ids` targeting for token ids and represented-character ids.
- Preserved the TokenMod authorization distinction:
  - GMs may use explicit ids;
  - players may use selected tokens;
  - players may use explicit ids only when `playersCanUseIds` is enabled;
  - refusing player ids does not remove valid selected-token targets.
- Added `--api-as <player-id>` for commands whose Roll20 sender is `API`, allowing script-to-script callers to apply the effective player's explicit-id authorization boundary.
- Added `--ignore-selected`, `--current-page`, and `--active-pages` target filters.
- Added inline-roll total substitution for `$[[n]]` values before command parsing.
- Added quoted values for token names, tooltips, reports, and other values containing spaces.
- Added `--on`, `--off`, and `--flip` for supported boolean token fields, including visibility, edit permissions, auras, drawing state, token-menu controls, flips, movement locks, overlap/scenery controls, and legacy/current lighting booleans.
- Preserved TokenMod's same-command boolean precedence: `--on` wins over `--off`, and either explicit state wins over `--flip`.
- Added `--set property|value` and `property#value` parsing for common token fields.
- Added common TokenMod aliases such as `bar1_current`, `bright_vision`, `night_distance`, `light_color`, `lock_movement`, `disable_snapping`, and `fadeopacity`.
- Added `bar1` through `bar4` meta-properties that set both the matching value and maximum.
- Added `scale` as a width-and-height meta-property.
- Added direct support for names, tooltips, bars, auras, colors, layers, position, dimensions, rotation, vision, light, token/character links, controller ids, and common Roll20 display options.
- Normalized aura shape aliases to Roll20's stored `circle` or `square` values, including blank-to-circle behavior.
- Added TokenMod-compatible `!number` toggling for blank-capable distance values such as `aura1_radius|!20`.
- Corrected the acceptance example to set aura radius, color, and shape together so the test produces a visible aura instead of changing only an invisible aura's color.
- Added relative numeric operations using `+`, `-`, `*`, and `/`, with leading `=` for exact assignment where a signed value would otherwise be relative.
- Added pixel, grid (`g`), unit (`u`), and common page-unit conversion using the target token's page scale and snapping increment.
- Added `--move <distance>` and `--move <angle|distance>`:
  - an omitted angle follows the token's facing;
  - an unprefixed angle is relative to current facing;
  - a leading `=` uses an absolute angle;
  - a trailing `!` updates token facing;
  - `lastmove` records only positions created by the current command and does not inherit an older Roll20 trail.
- Corrected single-command movement so Roll20's movement display no longer draws back to a stale original starting point when `lastmove` already contains an earlier path.
- Added `--order tofront|toback`, including the familiar `front` and `back` spellings.
- Added `--report recipients|message` with `gm`, `player`, `all`, `token`, `character`, and `control` recipient groups.
- Added report substitution for `{property}`, `{property:before}`, `{property:change}`, and `{property:abschange}`.
- Added linked-bar writes through `setWithWorker` when Roll20 exposes the linked attribute, preserving character-sheet worker behavior.
- Preserved represented-character controller updates when `controlledby` is changed on a linked token.

### MarkerService-backed status commands

- Routed every TokenAssist `statusmarkers` read and mutation through `GameAssist.MarkerService`; TokenAssist does not contain a competing marker parser or direct marker writer.
- Added familiar status operations:
  - an unprefixed marker or `+marker` adds it idempotently;
  - `-marker` removes every matching stored instance;
  - `!marker` toggles it;
  - `=marker` resolves the replacement, clears the prior list, then adds the replacement;
  - `=` clears the complete marker list.
- Added numbered built-in marker syntax such as `red:3`.
- Added registered custom display names and exact `Name::id` tags.
- Added query/button-friendly custom syntax such as `Name;;id;3` for an exact numbered custom marker.
- Preserved unrelated markers, marker order, and number overlays during ordinary add/remove/toggle operations.
- Added replacement preflight so an unrecognized `=marker` cannot erase the existing marker list before the requested replacement resolves.
- Returned token-specific marker failure details instead of reporting a partial operation as complete.

### State migration, lifecycle, and collision safeguards

- Added `state.GameAssist.TokenAssist` with protected configuration schema version `1`.
- Added guarded migration for compatible state from earlier v0.1.5.0 development builds; valid destination values win, missing source values are retained, and malformed state remains visible to the auditor.
- Added a one-time, non-destructive migration of valid `state.TokenMod.playersCanUse_ids` into `TokenAssist.config.playersCanUseIds`.
- Recorded whether legacy state was found, its schema version, copied keys, migration timestamp, and source-preservation status.
- Left the complete `state.TokenMod` branch unchanged for rollback and migration diagnosis.
- Added `warnOnStandalone`, defaulting to `true`.
- Declared `dependsOn: ['MarkerService']`; disabling MarkerService now also disables TokenAssist before the marker authority closes.
- Preserved TokenAssist migration/runtime records across deliberate module disable/re-enable cycles.
- Added standalone TokenMod detection through its public observer contract or `API_Meta.TokenMod` version evidence.
- When standalone TokenMod is detected:
  - TokenAssist records the detected version when available;
  - startup warns the GM about the overlapping command surface;
  - TokenAssist leaves the deprecated `!token-mod` alias to the standalone script;
  - repeated collision commands do not produce repeated warning noise;
  - branded `!token-assist`, `!ta`, and `!ta-*` commands remain available.
- Updated `!ga-status --details` standalone diagnostics to explain whether the deprecated alias is available through TokenAssist or has been left to standalone TokenMod.

### Token-change observer replacement

- Added `GameAssist.TokenAssist.observeTokenChange(callback, options)` with owner metadata and an unsubscribe handle.
- Added `GameAssist.TokenAssist.ObserveTokenChange` as a compatibility spelling on the GameAssist-owned API object.
- Added `clearObservers(owner)` for owner-scoped or complete observer cleanup.
- TokenAssist observers receive the changed token, a prior-property snapshot, and command/source context after a successful TokenAssist mutation.
- Did not create a global object named `TokenMod`; integrations requiring every status-marker change use `GameAssist.MarkerService.observe(...)` instead.

### Explicit TokenAssist 1.0.1 limits

- TokenAssist does not claim complete TokenMod compatibility.
- Image-side stack editing through `imgsrc` or `sides` is not implemented.
- Default-token writes are not implemented.
- Computed and name-resolved attribute handling is not implemented; direct linked attribute ids remain supported.
- Advanced controller-list name resolution and incremental add/remove operations are not implemented; direct controller-id assignment remains supported.
- Advanced relative color arithmetic is not implemented; direct transparent, hex, rgb/rgba, and hsv/hsva values are supported.
- Dimming night-vision effect parameters are not implemented; direct None and Nocturnal values are supported.
- Relative/random multi-sided-token selection is not implemented; direct absolute `currentSide` selection remains supported.
- TokenMod's distinct `token`, `character`, and combined `control` report-recipient behavior is not reproduced exactly; TokenAssist currently resolves controller delivery through its combined controller set.
- Duplicate-index marker operations such as `marker[]` or `marker[2]` are not implemented.
- Conditional marker-count operations are not implemented.
- TokenMod's generated help handout and `--rebuild-help` workflow are not implemented; TokenAssist uses chat help panels.
- Unsupported properties and marker forms return clear diagnostics before unrelated order or linked-object side effects occur.

### Marker mutation behavior

- Marker add is idempotent when the requested marker already exists.
- Explicit removal clears every duplicate instance of the requested marker so the requested absent state is complete.
- Unrelated markers, their ordering, and their number overlays are preserved.
- Supplying a marker number updates only the first matching requested marker and leaves unrelated duplicates untouched.
- Marker numbers are validated as integers from 0 through 9.
- Unsupported actions, invalid tokens, unknown markers, unavailable registries, rejected token writes, and failed verification return explicit diagnostics instead of silent success.
- Direct token writes remain synchronous; ordinary GameAssist event handlers are not routed through the explicit task queue.

### Changed – NPCManager 1.2.1

- Advanced NPCManager from module version `1.1.1` through `1.2.0` to `1.2.1`.
- Routed death-marker resolution, presence checks, add/remove operations, audits, and teardown through MarkerService.
- Removed NPCManager's standalone TokenMod dependency declaration and dependency-skip path.
- Preserved configured numbered death-marker overlays such as `dead@2` when requesting marker writes.
- Kept death-history recording independent from marker-write success so Campaign, Chapter, Section, Session, and Arc records continue describing HP events.
- Preserved NPCHPRoller initialization protection, known-positive-to-zero death detection, revival annotation, auto-hide behavior, report writing, hierarchical clearing, and Arc management.
- Teardown now reports markers actually removed rather than a delayed external request count.
- Kept `!npc-death-audit` strictly read-only and added a **Review Marker Repairs** action only when recognizable marker mismatches exist.
- Added the separate GM-only `!npc-death-repair` preview and `!npc-death-repair --confirm` mutation path. The preview explains that current bar 1 HP controls the proposed marker result and changes nothing.
- Confirmation performs a fresh page scan before acting, verifies every MarkerService add/remove result, preserves unrelated markers, and reports remaining failures.
- Repair changes neither HP nor NPC death history, Campaign/Chapter/Section/Session buckets, or Arc records. This preserves the DM's ability to treat a mismatch as HP housekeeping instead of automatically accepting marker state as authoritative.
- Blank or non-numeric HP is reported separately and excluded from automatic marker repair rather than being coerced to zero.

### Changed – ConcentrationTracker 0.2.0

- Advanced ConcentrationTracker from module version `0.1.0.6` to `0.2.0`.
- Routed configured-marker resolution, status scans, roll-result mutation, `--off`, and teardown through MarkerService.
- Removed ConcentrationTracker's standalone TokenMod dependency declaration and dependency-skip path.
- Preserved configured numbered concentration-marker overlays such as `Concentrating@2` when requesting marker writes.
- Replaced TokenMod-specific repair wording with campaign marker-library and exact stored-tag guidance.
- Preserved `!concentration`, `!cc`, `--damage`, `--mode`, `--last`, `--off`, `--status`, randomization configuration, and `!ga-conc-status`.

### Changed – DebugTools 0.2.0

- Advanced DebugTools from module version `0.1.0` to `0.2.0`.
- Routed marker inspection, dry-run descriptions, and applied add/remove/toggle actions through MarkerService.
- Preserved the GM-only, disabled-by-default, and explicit `--apply` safeguards.
- Improved applied-marker records so `lastAction` stores the resolved marker id and actual operation.

### Dependency and compatibility boundary

- Standalone TokenMod is no longer required for TokenAssist, NPCManager, ConcentrationTracker, or DebugTools operations supported by GameAssist.
- The final v0.1.5.0 release replaces standalone TokenMod and StatusInfo for supported GameAssist token and condition workflows; it does not retain a legacy marker-dispatch path to those scripts.
- Campaigns that deliberately disable MarkerService may use unrelated standalone marker tools while continuing to use GameAssist modules that do not depend on MarkerService.
- ConditionAssist under Issue #26 and TokenAssist 1.0.1 under Issue #27 completed their focused and full-suite Roll20 sandbox acceptance.
- Existing scripts that independently modify the same marker, NPC HP/bar 1, or natural-1 workflow remain feature-level conflict risks.

### State and migration impact

- Added the `state.GameAssist.ConditionAssist` branch for validated ConditionAssist configuration and ordinary runtime state.
- Valid legacy `state.STATUSINFO` data may be copied into ConditionAssist once; the legacy branch remains intact.
- Added the `state.GameAssist.TokenAssist` branch for TokenAssist configuration and migration evidence.
- Valid legacy `state.TokenMod.playersCanUse_ids` may be copied into TokenAssist once; the complete legacy branch remains intact.
- Existing module configuration and runtime branches remain in place.
- Existing NPCManager bucket, handout, Arc, and revival records are preserved.
- Existing ConcentrationTracker `lastDamage` entries retain their established repair and compatibility behavior.
- MarkerService keeps its registry cache and observer subscriptions in sandbox memory rather than persistent state; subscriptions survive intentional MarkerService off/on cycles within the same sandbox.
- Rolling back code does not automatically reverse marker changes or persistent records created while v0.1.5.0 was active.

### MECHSUITS records

- Added `[GAMEASSIST:CORE:MARKERSERVICE]`, `[GAMEASSIST:MODULES:CONDITIONASSIST]`, and `[GAMEASSIST:MODULES:TOKENASSIST]` to the file-scoped canonical tree and declared runtime order.
- Updated the CORE parent contract to include MarkerService as the single marker authority.
- Updated APP and APP:UTILS contracts to remove marker ownership.
- Updated CORE:OBJECT to expose `GameAssist.MarkerService`.
- Updated MODULES, ConditionAssist, TokenAssist, NPCManager, ConcentrationTracker, DebugTools, ConfigUI, POLICY, APP:UTILS, CORE:COMPAT, CORE:OBJECT, INTERFACES:COMMANDS, and BOOTSTRAP metadata and footers under the Meaningful Change Rule.
- Replaced CORE:COMPAT's obsolete TokenMod dependency advice with the current `!token-mod` command-overlap and MarkerService ownership guidance.
- Preserved the literal `GAMEASSIST` codename, existing section identifiers, public commands, and prior section notes.

### Documentation

- Updated the README overview, installation, architecture, module guides, developer API, troubleshooting, upgrade path, roadmap summary, and compact release history.
- Added a dedicated MarkerService developer API reference with structured result and observation examples.
- Rebuilt the smoke-test dependency section around no-TokenMod operation, custom markers, exact stored tags, and unrelated numbered-marker preservation.
- Reorganized `Smoketest.md` by component so Core, MarkerService, ConfigUI, CritFumble, ConditionAssist, TokenAssist, ConcentrationTracker, NPCManager, NPCHPRoller, and DebugTools each have a purpose, reason, skip rule, basic check, and expanded troubleshooting checks.
- Added a self-contained Issue #25 MarkerService acceptance sequence covering no-TokenMod startup, numbered built-in and custom markers, unrelated-marker preservation, module teardown, reload, persistence, and restoration.
- Corrected duplicated installation and MECHSUITS contribution text in the README.
- Added the byte-identical `GameAssist.js` One-Click publication mirror named by `script.json` while retaining `GameAssist` as the canonical development source.
- Added `previousversions/GameAssist v0.1.4.7` so every manifest `previousversions` entry has a corresponding preserved repository artifact.
- Updated `script.json` to document ConditionAssist, TokenAssist, their command families, the release's empty production dependency list, expanded token-property write surface, and named/behavioral overlap warnings.
- Updated `ROADMAP.md` so Issues #25 through #29 are checkpoints within one unreleased v0.1.5.0 train rather than separate v0.1.5.x releases.
- Updated `ATTRIBUTIONS.md` with source provenance, license text, contributor credits, and rules-content licensing.
- Removed release gates, upstream comparison work, publication checks, and maintainer guidance from public-facing documents.
- Restored a warmer, visually guided README quick start and removed internal packaging instructions and editorial troubleshooting language from the public guide.

### Release artifacts

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `DEDDDBD189ADBDD8ACA75E664100B71BDB51050E7D3A5CE8EC4CA62C559B5C72` |
| `GameAssist.js` | `DEDDDBD189ADBDD8ACA75E664100B71BDB51050E7D3A5CE8EC4CA62C559B5C72` |
| `GameAssist-v0.1.5.0` | `DEDDDBD189ADBDD8ACA75E664100B71BDB51050E7D3A5CE8EC4CA62C559B5C72` |

The repository source, One-Click publication mirror, and versioned Roll20 test artifact are byte-identical.

### Verification

| Check | Result |
| --- | --- |
| JavaScript parse/compile | Passed |
| Mocked Roll20 ready initialization and MarkerService lifecycle | Passed (24/24 focused checks); ConditionAssist and TokenAssist lifecycle coverage is reported separately below |
| Mocked ConditionAssist clean installation | Passed (58/58 checks), including documented registry preference, invalid-registry built-in/exact-tag independence and diagnostics, the complete 2014 catalog, selected-token multi-condition recognition, GM-only current-page condition/other-marker status and complete handout, case-insensitive official/custom `!cond-<condition>`, both announcement aliases, built-in/custom artwork and readable fallback, 2024/custom profiles, captured-character announcement menus, verified mixed-state marker toggling, character-first public/controller-whisper reporting, partial and absent controller handling, duplicate-description suppression, bounded private references without general permission leakage, duplicate-marker warning, schema-v2 export, capacity refusal, marker preservation, and lifecycle cascade |
| Mocked ConditionAssist legacy migration and MarkerService lifecycle | Passed (35/35 checks), including `_token_markers` compatibility fallback, non-destructive migration, active-condition menu/status recognition, Concentrating display repair, custom-profile identification, case-insensitive `!cond-<condition>`, descriptions, add/remove/toggle, protected config, imports, cascade disable, re-enable, MarkerService 1.0.1 API reporting, and observer recovery |
| Mocked TokenAssist branded-command workflow | Passed (45/45 checks), including pinned provenance, pre-release identity migration, legacy configuration migration/source retention, full/short/case-insensitive help, deprecation warning, visible aura storage, hex/RGB/HSV color normalization, stale movement-origin replacement, booleans, quoted text, relative values, MarkerService-backed built-in/custom/numbered marker operations, safe marker replacement, order, reports, linked bars, player id authorization, selected-token use, page filtering, unsupported-feature refusal, observers, and MarkerService cascade disable/re-enable |
| Mocked standalone TokenMod collision workflow | Passed (12/12 checks), including detection, suspended legacy-alias mutation, actionable warning, and continued TokenAssist command/help access |
| Marker mutation refresh after lifecycle changes | Passed (18/18 checks) for built-in/custom resolution, numbered/duplicate handling, toggle/set, and unrelated-marker preservation |
| Mocked marker-consumer workflow | Passed (22/22) across NPCManager, ConcentrationTracker, DebugTools, teardown, and re-enable |
| Startup errors | 0 |
| Chat-generated `!token-mod` commands | 0 |
| Focused MarkerService regression checks | Passed (23/23) |
| Built-in marker resolution | Passed |
| Documented `token_markers` lookup and `_token_markers` compatibility fallback | Passed |
| Custom display-name and direct stored-tag resolution | Passed |
| Direct stored tag during invalid registry data | Passed |
| Numbered and duplicate marker parsing | Passed |
| Configured numbered-marker pass-through from NPCManager and ConcentrationTracker | Passed |
| Requested duplicate removal | Passed |
| Unrelated numbered-marker preservation | Passed |
| Idempotent add and toggle behavior | Passed |
| Marker observation delivery | Passed |
| MECHSUITS parent/child topology | Passed |
| Single GameAssist status-marker write authority | Passed |
| `script.json` parse, version, command count, and dependency metadata | Passed |

### Roll20 acceptance

Issues #25, #26, and #27 completed their focused MarkerService, ConditionAssist, and TokenAssist checkpoints on 2026-07-19. Their automated suites cover the marker, status, announcement, aura, movement, and command corrections made during those checkpoints. Issue #32 additionally verified the documented `token_markers` registry path, `_token_markers` fallback, exact-tag independence, built-in independence, and invalid-registry diagnostics.

Issue #28's upgrade/lifecycle harness executes the preserved v0.1.4.7 artifact, carries the resulting state into v0.1.5.0, and verifies configuration retention, non-destructive TokenMod/StatusInfo migration, conservative malformed-state repair, unknown-state preservation, read-only NPC death auditing, confirmation-gated marker repair in both directions, HP/history preservation, MarkerService opt-out, dependent shutdown, ordered restoration, and reload persistence.

The complete Roll20 clean-install and upgrade smoke tracks passed, including the final selected-token condition display, current-page condition status handout, read-only NPC death audit, and separately confirmed marker repair checks. Issue #29's documentation, attribution, metadata, artifact, and review audit also passed. The v0.1.5.0 release candidate is accepted for publication.

Deferred TokenAssist expansion is tracked outside the v0.1.5.0 gate: Issue #42 covers advanced marker expressions, #43 covers attribute/controller/report resolution, #44 covers visual and multi-sided controls, and #45 covers token-image/default-token asset updates. TokenMod help-handout rebuilding and a global `TokenMod` compatibility object are not planned.

Issues #25 through #29 are complete. Publication remains the repository release/merge action rather than an additional implementation checkpoint.

---

## [0.1.5.1] – 2026-07-19

### Release definition

GameAssist v0.1.5.1 is a focused table-time release. It adds one GM-selected IANA timezone for human-facing GameAssist dates, clocks, and date-managed NPC Sessions while preserving the absolute ISO instants already stored with events. It does not change marker ownership, TokenAssist commands, ConditionAssist definitions, queue behavior, or the accepted v0.1.5.0 integration architecture.

The release implements [Issue #35](https://github.com/Mord-Eagle/GameAssist/issues/35). NPCManager advances from `1.2.1` to `1.3.0`; ConfigUI advances from `0.1.0` to `0.2.0`. Other feature-module versions remain unchanged.

### Added – Campaign timezone controls

- Added the GM-only `!ga-timezone` command family:
  - `!ga-timezone` and `!ga-timezone help` open the table-time menu;
  - `!ga-timezone set <IANA timezone>` validates and saves a named region;
  - `!ga-timezone clear`, `default`, or `sandbox` restores the Roll20 sandbox clock.
- Added `!ga-config timezone` as a discoverable entry point to the same menu.
- Added common buttons for US Eastern, US Central, US Mountain, US Pacific, UTC, London, Paris, and Sydney, plus a custom IANA-name prompt.
- Added clear current-setting, current-time, and current-Session-date output.
- Added timezone access to both `!ga-status` views and every ConfigUI page.
- Invalid names are refused before state changes. A malformed saved value produces an actionable warning and falls back to sandbox time without deleting the saved evidence.

### Added – Shared time contract

- Added validated timezone helpers in `[GAMEASSIST:APP:UTILS]` for:
  - IANA-name validation and canonicalization;
  - active setting and fallback diagnostics;
  - date/time parts in a selected region;
  - numeric UTC-offset calculation;
  - full human-facing timestamps;
  - compact log times;
  - local `YYYY-MM-DD` date keys;
  - dynamic rendering of stored absolute timestamps.
- Exposed the supported helper surface as `GameAssist.Time` with version `1.0.0`:
  - `validateTimeZone(...)`;
  - `getInfo()`;
  - `formatDateTime(...)`;
  - `formatTime(...)`;
  - `dateKey(...)`.
- Named regions use the runtime's IANA rules and therefore follow daylight-saving changes. Fixed numeric offsets were rejected because they become inaccurate when a region changes between standard and daylight time.
- Forced 24-hour offset calculations to use the `h23` hour cycle so midnight cannot be represented as hour `24` and produce a false one-day offset.
- Reused timezone validation and display formatters through a 32-entry LRU cache. Repeated log and menu rendering no longer reconstructs `Intl.DateTimeFormat`, while arbitrary custom timezone input cannot grow sandbox memory without a bound.

### Changed – Human-facing timestamps

- Routed GameAssist log clocks through the selected timezone.
- Routed simple and detailed status timestamps through the selected timezone.
- Routed configuration snapshot handout headers through the selected timezone while preserving the snapshot's absolute `generatedAt` ISO value.
- Routed condition-status and NPC audit handout update times through the selected timezone.
- Routed concentration activity display times through the selected timezone.
- Routed NPC death, revival, bucket, report, and Arc display times through the selected timezone.
- Historical NPC entries with a valid stored ISO timestamp are formatted dynamically. Changing timezone updates their presentation without changing the event's identity or instant.
- Legacy entries that contain only a preformatted display string retain that string because no reliable absolute instant exists to reinterpret.

### Changed – NPCManager 1.3.0

- Date-managed Session names now follow the configured GameAssist timezone rather than an assumed sandbox/UTC date.
- Setting or clearing the timezone asks a running NPCManager instance to refresh the active date-managed Session immediately.
- NPCManager continues checking the date before report, bucket, Arc, audit, repair, and tracked HP activity so the first event after local midnight enters the new Session.
- A deliberately named Session remains stable across timezone and date changes. **Reset Session Date** restores automatic date management.
- Campaign, Chapter, Section, Session, Arc, death, and revival records are preserved during timezone changes.
- Added `GameAssist.NPCManager.refreshSessionDate(...)` as the narrow internal/public integration hook used by the timezone command.

### State and migration impact

- Added `state.GameAssist.config.timezone`.
- Clean installations and upgraded campaigns default this value to `null`, meaning **Sandbox default**.
- The state self-healer seeds the missing key without replacing any existing root or module configuration.
- Valid saved IANA names survive sandbox reloads.
- Invalid saved names remain visible for diagnosis while runtime formatting safely falls back to sandbox time.
- Existing ISO timestamps, module runtime records, marker state, NPC history, and configuration snapshots are not migrated or rewritten.
- Rolling back to v0.1.5.0 leaves the extra root timezone key inert.

### MECHSUITS records

- Advanced banner `project_version` and runtime `VERSION` to `v0.1.5.1`.
- Updated the meaningful-change metadata and footers for `[GAMEASSIST:POLICY]`, `[GAMEASSIST:APP]`, `[GAMEASSIST:APP:UTILS]`, `[GAMEASSIST:CORE]`, `[GAMEASSIST:CORE:OBJECT]`, `[GAMEASSIST:INTERFACES:COMMANDS]`, `[GAMEASSIST:MODULES:CONFIGUI]`, and `[GAMEASSIST:MODULES:NPCMANAGER]`.
- Preserved the literal `GAMEASSIST` codename and the existing file-scoped section tree; no tag was added, removed, or renamed.
- Added the internal MECHSUITS-framed Issue #35 harness with explicit refusal to contact or substitute for Roll20.

### Documentation and metadata

- Added a readable table-time explanation, Quick Start step, command reference, NPC Session behavior, status description, and release-history summary to `README.md`.
- Added a focused v0.1.5.1 smoke test to `Smoketest.md`, including persistence, invalid input, Kiritimati/Honolulu date crossover, custom Session retention, and safe restoration of the intended timezone.
- Updated `ROADMAP.md` with the Issue #35 implementation and focused Roll20 completion gate.
- Updated `script.json` to advertise v0.1.5.1, expose the timezone commands, describe table-time behavior, include v0.1.5.0 in `previousversions`, and declare both the documented `campaign.token_markers` read and compatibility `_token_markers` read.
- Preserved the accepted `GameAssist-v0.1.5.0` artifact and added a separate v0.1.5.1 artifact.

### Release artifacts

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `561B1FC1311F2F251F215BF7B85FB96AF6A6CCC19423732AFA275D164887B24C` |
| `GameAssist.js` | `561B1FC1311F2F251F215BF7B85FB96AF6A6CCC19423732AFA275D164887B24C` |
| `GameAssist-v0.1.5.1` | `561B1FC1311F2F251F215BF7B85FB96AF6A6CCC19423732AFA275D164887B24C` |
| `previousversions/GameAssist v0.1.5.0` | `254087C9F87E2539F1A6CEBFF5FFAE25D4AA31E65A2DA76D5FACE69D7778CBE7` |

The development source, One-Click publication mirror, and v0.1.5.1 Roll20 test artifact are byte-identical. The preserved v0.1.5.0 previous-version artifact matches the accepted v0.1.5.0 hash.

### Automated verification

| Check | Result |
| --- | --- |
| JavaScript parse/compile | Passed |
| Clean-install sandbox-clock fallback | Passed |
| IANA validation and persisted command setting | Passed |
| Winter Eastern offset (`-0500`) | Passed |
| Summer Eastern offset (`-0400`) | Passed |
| Bounded `Intl.DateTimeFormat` reuse | Passed |
| UTC-midnight to prior local-date crossover | Passed |
| Immediate date-managed Session alignment | Passed |
| Next-activity local-midnight rollover | Passed |
| Deliberately named Session retention | Passed |
| Invalid input refusal without configuration loss | Passed |
| Unsupported saved-value fallback and status diagnostic | Passed |
| Sandbox reload persistence | Passed |
| Historical report reformatting after timezone change | Passed |
| Absolute ISO timestamp preservation | Passed |
| Focused Issue #35 harness | Passed (23/23) |
| v0.1.5.0 upgrade/lifecycle regression | Passed (46/46) |

### Roll20 acceptance

The focused Roll20 v0.1.5.1 timezone smoke test passed on 2026-07-19. The owner tested the timezone workflow rather than rerunning the complete manual v0.1.5.1 suite; non-timezone confidence remains grounded in the automated regression results above. This release record therefore claims focused timezone acceptance, not a second full live regression of every module.

---

## [0.1.6.0] – 2026-07-19

### Release definition

GameAssist v0.1.6.0 adds a native Roll20 Turn Tracker foundation and the first InitiativeAssist release. InitiativeAssist supports encounters containing both **D&D 5E by Roll20 (2014)** and **D&D 2024 by Roll20** characters, uses the case-insensitive `!Init-` command family, and keeps initiative setup and rerolls compact enough for active play.

This release implements [Issue #47](https://github.com/Mord-Eagle/GameAssist/issues/47). `TurnTrackerService 1.0.0` becomes a new toggleable core service and `InitiativeAssist 1.0.0` becomes the ninth independently configurable GameAssist module. InitiativeAssist starts disabled so installing or upgrading GameAssist cannot unexpectedly take ownership of an active tracker.

Round counting, automatic turn advancement, status-duration countdowns, current-turn visuals, encounter lifecycle automation, and end-of-turn effects remain outside InitiativeAssist. Those combat-flow responsibilities are deferred to [Issue #48](https://github.com/Mord-Eagle/GameAssist/issues/48) for a future CombatAssist module.

### Added – TurnTrackerService 1.0.0

- Added `[GAMEASSIST:CORE:TURNTRACKERSERVICE]` as the single GameAssist owner of native Turn Tracker reads, observations, and guarded writes.
- Added immutable tracker snapshots containing:
  - the resolved active initiative page and its source;
  - the exact raw `turnorder` value;
  - parsed entries with original indices;
  - a revision fingerprint used to detect concurrent changes.
- Added compatibility resolution for campaigns where Roll20 exposes an open Turn Tracker as boolean `true` rather than a page id. Existing tracker tokens establish the encounter page; an empty tracker falls back to the Player Ribbon page; genuinely mixed-page token rows are refused with an actionable warning. Before a compatible write, the resolved page id is synchronized first and the dedicated `turnorder` property is then written and verified.
- Added structural row classification for custom rows, missing-token rows, current-page token rows, and off-page token rows without assigning D&D rules inside the core service.
- Added preservation-first mutations. A consumer supplies a narrow transformation and TurnTrackerService confirms that the page and source revision still match, synchronizes a compatibility-resolved page when needed, writes `turnorder` through the established dedicated campaign property, and verifies the resulting page and rows.
- Added observation of `change:campaign:turnorder` and `change:campaign:initiativepage` through Roll20's captured event seam.
- Added own-write echo suppression so GameAssist observers do not process the same service-authored update twice.
- Added the frozen `GameAssist.TurnTrackerService` integration surface for snapshots, classification, guarded application, and observer registration.
- Registered TurnTrackerService with the existing GameAssist lifecycle. Disabling it automatically disables InitiativeAssist while leaving unrelated modules available.

### Added – InitiativeAssist 1.0.0

- Added a case-insensitive `!Init-` namespace with a Guide, action-focused Control Center, quick Status Summary, detailed private chat Review, public initiative calls, player rolls, GM page-roster controls, rerolls, saved groups, and Manager/Observer modes.
- Added `!Init-Go` for a concise public **Roll for initiative** invitation.
- Added `!Init-Go!` for a rotating set of light, table-friendly initiative announcements.
- Added public buttons that let a player roll initiative for one eligible character or every eligible selected character they control. Player authorization and token eligibility are checked again when each button is used rather than trusted from the original chat message.
- Added `!Init-Roll-Selected` for GMs and players who control multiple characters. It deduplicates the current selection, accepts characters that are not yet in Turn Order, refuses uncontrolled or stale targets, and adds or updates every remaining eligible character in one bounded batch.
- Added a private **GM Initiative Roster** after every `!Init-Go` or `!Init-Go!` call. It separately lists current-page PCs, object-layer NPCs, and GM-layer NPCs, marks entries that need attention, and provides individual and bounded batch controls.
- Expanded `!Init-Start` with `all`, `npc`, `gm-npc`, and `all-npc` scopes. The controls add or update eligible object-layer characters, object-layer NPCs, GM-layer NPCs, or NPCs across both layers while leaving dead NPCs, attention items, custom rows, and counters unchanged.
- Added private-by-default NPC initiative evidence. `!Init-NPC-Rolls hidden|public` controls whether object-layer NPC inline rolls and readable result panels are GM-only; GM-layer NPC evidence always remains private.
- Added pre-tracker page discovery. A controlled, linked object-layer token may roll from the public invitation before it has a Turn Order row; the completed roll adds that token to Roll20's tracker.
- Added player-specific panels for choices, setup guidance, and refusals while retaining public initiative invitations and completed results.
- Added a staged player options panel that carries all prior choices forward. A player chooses normal, advantage, or disadvantage, may enter a bounded flat adjustment, and may then roll immediately or add one or two bounded bonus dice. These choices are cumulative rather than mutually exclusive.
- Added common `d4`, `d6`, `d8`, `d10`, and `d12` buttons plus a bounded custom die-side prompt. Two-die rolls collect each die separately so combinations such as advantage plus a flat adjustment, `1d6`, and `1d4` remain easy to build.
- Added detailed result messages containing both d20s for advantage or disadvantage, any exposed bonus dice, the final total, and the complete formula. PC results remain public; NPC evidence follows the configured privacy rule. InitiativeAssist verifies that Roll20 retained a page-owned tracker row before announcing success. A failed or unavailable modifier lookup produces a clear response rather than inserting an initiative value of zero.
- Added six score-aware result-prose ranges for rolls requested through `!Init-Go!`: 0-5, 6-12, 13-19, 20-25, 26-34, and 35+. The direct `!Init-Go` workflow remains neutral.
- Added `!Init-RR` to reroll every eligible living NPC and every Player Character already represented in the active tracker.
- Added narrower reroll choices for PCs, NPCs, selected tracker tokens, individual tracker tokens, and saved encounter groups.
- Added page-scoped group creation, renaming, rerolling, and removal from selected tracker tokens. Groups store token identities, not copies of tracker rows, remain bounded by policy limits, and stay out of other encounter-page menus.
- Added a GM status panel that summarizes the active tracker, linked characters available on the tracker page, eligible actors, rows kept unchanged, service availability, and current Manager/Observer mode.
- Added a detailed read-only `!Init-Audit` chat review with separate Turn Tracker and not-yet-in-tracker character details. The review is whispered to the GM, changes no tracker data, and creates no persistent handout. An empty tracker reports the characters available to roll instead of presenting a zero-row success with no context.
- Added `GameAssist.InitiativeAssist.getRoster()` as a narrow read-only integration surface for future GameAssist features.

### Changed – Live sandbox corrections

- Synchronized Roll20's `initiativepage` with a newly saved Turn Order row when the sandbox exposes the open tracker as boolean `true`. This prevents a successful chat roll from being detached from the visible native tracker.
- Added Roll20's `_pageid` field to every GameAssist-created or repaired character turn. Live testing showed that a row could be retained in campaign JSON yet remain absent from the visible Turn Order when this page-ownership field was omitted.
- Changed TurnTrackerService to write `turnorder` as a dedicated campaign property, matching established Roll20 initiative implementations rather than bundling it with an optional page normalization update.
- Added post-write verification for the complete `turnorder` value, resolved tracker page, target initiative value, and target-row `_pageid` before a player result is announced.
- Replaced the mutually exclusive Roll Options paths with a short staged builder that combines d20 mode, flat adjustment, and up to two bonus dice.
- Replaced the total-only result sentence with a concentration-style `Roll(s) … → total (from formula)` presentation.
- Changed successful `!Init-RR` output from a public summary to a bounded GM whisper containing each updated character's roll evidence.
- Changed the roll callback itself, not only the final panel, to use a GM whisper for hidden NPCs so concealed modifiers and bonus dice cannot leak through Roll20's inline-roll message.

### Added – Mixed 2014/2024 sheet adapters

- Added D&D 5E by Roll20 (2014) initiative resolution using the represented character's `npc` and `initiative_bonus` attributes.
- Added D&D 2024 by Roll20 initiative resolution through Roll20's asynchronous Computed/Beacon access when available.
- Added 2024 character-type checks using supported sheet data and player-controller evidence rather than assuming every unfamiliar character is an NPC.
- Added mixed encounters: 2014 PCs, 2014 NPCs, 2024 PCs, and 2024 NPCs may appear in the same tracker and reroll batch.
- Added conservative sheet-data probing when Roll20 omits or changes a character's `charactersheetname`: valid 2014 `npc`/`initiative_bonus` attributes or valid 2024 Beacon fields may establish the supported adapter without converting missing values to zero.
- Added a conservative unavailable-data path. If the 2024 sheet interface cannot provide initiative data, InitiativeAssist retains the existing row and explains that it needs attention.

### Changed – Safe reroll behavior

- `!Init-RR` rolls once for each unique eligible token. If the same token appears more than once in the tracker, each duplicate receives the same new result.
- Sorting is limited to tracker slots owned by the eligible reroll targets. InitiativeAssist does not globally reorder the tracker.
- Custom rows, round counters, objects, dead NPCs, HP/marker disagreements, stale references, off-page rows, and unknown rows retain their original positions and values.
- Unknown properties on rerolled tracker entries are preserved.
- NPCs are treated as living only when HP or marker evidence supports that conclusion. Missing or contradictory death evidence is reported for attention rather than guessed.
- InitiativeAssist verifies the active initiative page after asynchronous modifier resolution and aborts without writing if the page changed.
- InitiativeAssist verifies target-row priorities before applying a completed reroll and aborts without writing if another script or GM changed those targets in the meantime.
- InitiativeAssist verifies the completed tracker write before announcing an individual result; a missing or rejected row produces an actionable retry message instead of a false success.
- Batch sizes, group counts, group-name lengths, picker sizes, and custom die sizes use bounded policy values.

### Added – Coexistence controls and diagnostics

- Added **Manager mode** for deliberate InitiativeAssist tracker writes.
- Added **Observer mode** for menus, status, and audits without tracker mutation.
- Expanded compatibility diagnostics for GroupInitiative, CombatMaster, CombatTracker, InitiativeTrackerPlus, RoundMaster, TurnMarker1, and AddCustomTurn.
- Compatibility messages describe the overlapping responsibility: initiative rolling, tracker ordering, custom rows, round ownership, or combat-flow management.
- `!ga-status --details` now reports TurnTrackerService availability and InitiativeAssist mode/lifecycle state.
- `!ga-config modules` continues to show the detailed enabled/running state for both the service and module.

### State and migration impact

- Added `state.GameAssist.TurnTrackerService.config.enabled`, defaulting to enabled.
- Added `state.GameAssist.InitiativeAssist.config.enabled`, defaulting to disabled.
- Added `state.GameAssist.InitiativeAssist.config.mode`, defaulting to `manager` for use after the GM explicitly enables the module.
- Added `state.GameAssist.InitiativeAssist.config.hideNpcRolls`, defaulting to `true`; the Control Center and GM roster expose the same setting in table language.
- Added bounded InitiativeAssist runtime storage for named encounter groups.
- Existing GameAssist configuration, runtime data, timezone selection, marker state, condition definitions, NPC history, and TokenAssist state are preserved.
- No existing Roll20 Turn Tracker rows are migrated, rewritten, or normalized during startup.
- Rolling back to v0.1.5.1 leaves the new service/module branches inert.

### MECHSUITS records

- Advanced banner `project_version` and runtime `VERSION` to `v0.1.6.0`.
- Added `CORE:TURNTRACKERSERVICE` and `MODULES:INITIATIVEASSIST` to the file-scoped `canonical_tree` with literal `GAMEASSIST` identifiers.
- Added complete parent-owned section frames, section metadata, narratives, meaningful-change records, decision logs, and required Notes & Comments footers.
- Updated affected ancestor contracts and bootstrap ordering to initialize TurnTrackerService before InitiativeAssist.
- Mechanically verified 24 declared section tags against 24 actual section frames with balanced parent nesting, matching `area` metadata, `last_updated_version` records, and footer records.

### Documentation and metadata

- Expanded `README.md` with InitiativeAssist onboarding, commands, mixed-sheet behavior, player options, reroll preservation rules, configuration, compatibility guidance, macros, troubleshooting, upgrade steps, developer APIs, and the CombatAssist boundary.
- Rebuilt `Smoketest.md` around v0.1.6.0 clean-install and v0.1.5.1-upgrade tracks, then added dedicated TurnTrackerService and InitiativeAssist component tests.
- Added focused tests for mixed-sheet and unlabeled-sheet actors, visible `_pageid`-owned pre-tracker rows, dedicated campaign turnorder writes, hidden/public NPC evidence, GM-layer NPC batches, selected-character authorization, GM page-roster controls, player-specific response routing, advantage/disadvantage d20 evidence, cumulative roll options, six score-aware narration ranges, GM-whispered reroll summaries, page-id and boolean tracker states, ambiguous multi-page refusal, empty-tracker chat reviews, duplicate entries, custom rows, counters, dead NPCs, off-page rows, player authorization, page changes, concurrent priority changes, Observer mode, service disable cascade, malformed tracker data, and no-handout review behavior.
- Updated `ROADMAP.md` with the completed implementation scope for Issue #47 and the deferred CombatAssist scope in Issue #48.
- Updated `script.json` to advertise v0.1.6.0, list the InitiativeAssist command family, include v0.1.5.1 in `previousversions`, declare Turn Tracker and sheet-data access, and describe initiative conflicts in user-facing terms.
- Preserved `GameAssist-v0.1.5.1` and added `previousversions/GameAssist v0.1.5.1` before generating the new versioned artifact.

### Release artifacts

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `E20FCF251620407710DB87042674D8993704E12559321047968170180D005F04` |
| `GameAssist.js` | `E20FCF251620407710DB87042674D8993704E12559321047968170180D005F04` |
| `GameAssist-v0.1.6.0` | `E20FCF251620407710DB87042674D8993704E12559321047968170180D005F04` |
| `previousversions/GameAssist v0.1.5.1` | `561B1FC1311F2F251F215BF7B85FB96AF6A6CCC19423732AFA275D164887B24C` |

The development source, One-Click publication mirror, and v0.1.6.0 Roll20 test artifact are byte-identical. The preserved v0.1.5.1 previous-version artifact matches its recorded release hash.

### Automated verification

| Check | Result |
| --- | --- |
| JavaScript parse/compile | Passed |
| MECHSUITS hierarchy and metadata audit | Passed (24/24 declared and actual sections) |
| InitiativeAssist focused harness | Passed (105/105) |
| ConditionAssist regression harness | Passed (35/35) |
| TokenAssist regression harness | Passed (45/45) |
| v0.1.5.0 integration/lifecycle regression | Passed (46/46) |
| v0.1.5.1 timezone regression | Passed (23/23) |
| `script.json` parse validation | Passed |
| Current release artifact identity | Passed (3/3 byte-identical) |
| Preserved v0.1.5.1 artifact identity | Passed |

### Roll20 acceptance gate

Automated verification is complete. The focused and established regression harnesses pass 254 checks in total. Live Roll20 testing has confirmed the native tracker population, reroll, invitation, detailed-roll, and GM-roster foundation. Focused acceptance remains open for private/public NPC evidence, GM-layer NPC batches, selected-character batches, and the complete clean-install and v0.1.5.1-upgrade tracks in `Smoketest.md`. Issue #47 remains open until those live checks pass.

---

## [0.1.6.1] – 2026-07-20

### Release definition

GameAssist v0.1.6.1 adds a private GM entry point to the accepted InitiativeAssist workflow and introduces the optional WelcomeAssist module. The release preserves the native Turn Tracker behavior from v0.1.6.0 while giving a GM a private copy of the initiative controls and a deliberate, configurable way to greet the table after GameAssist starts successfully.

InitiativeAssist advances to module version 1.0.1. WelcomeAssist launches at module version 0.1.0 and remains disabled by default. No CombatAssist responsibilities, automatic turn advancement, round ownership, duration countdowns, or end-of-turn effects are included.

### Added – InitiativeAssist 1.0.1

- Added the case-insensitive `!Init-GM` command.
- `!Init-GM` opens the neutral Roll for Initiative panel and the complete GM Initiative Roster as GM whispers. No invitation or roster is posted to players.
- The private roster reuses the same current-page discovery, actor classification, eligibility checks, individual controls, batch controls, NPC-layer groups, and hidden-roll policy as `!Init-Go`.
- Added **GM-Only Start** to the InitiativeAssist Control Center and documented the distinction among `!Init-Go`, `!Init-Go!`, and `!Init-GM` in the Guide.
- Made a linked character's **Controlled By** setting authoritative for player initiative permission. A stale controller saved only on the represented token can no longer authorize a player whom the linked character does not name.
- Preserved all v0.1.6.0 public invitation, player authorization, native tracker population, mixed 2014/2024 sheet, selected-character, GM-layer NPC, hidden-roll, saved-group, audit, and reroll behavior.

### Added – WelcomeAssist 0.1.0

- Added an independently configurable WelcomeAssist module that starts disabled and can be enabled through the normal GameAssist module controls.
- Added four greeting modes:
  - `default` uses one professional table greeting;
  - `builtin` chooses from the included greeting library;
  - `custom` chooses from the campaign's saved greetings;
  - `mixed` combines the professional greeting, all built-in greetings, and two copies of each custom greeting so campaign-specific text has greater individual weight.
- Set `mixed` as the default mode once the GM enables the module.
- Added GM-only help, status, preview, and configuration responses. Only an explicit announcement or the post-bootstrap automatic greeting is public.
- Added `!welcome-assist announce` for an immediate public greeting. A manual announcement cancels any pending automatic greeting and consumes the automatic opportunity for that sandbox lifecycle, preventing a delayed duplicate.
- Added bounded configuration commands for mode, startup delay, visible header, professional default text, and campaign-specific greetings.
- Limited campaign greetings to ten entries of 240 characters each, removed duplicates case-insensitively, and required an exact list number for removal.
- Included a curated library of original table humor.

### Changed – Startup and health behavior

- Added a post-bootstrap WelcomeAssist hook after GameAssist has attempted to initialize every configured component and recorded final startup metrics.
- Enabling WelcomeAssist during a live sandbox does not post a greeting. This lets the GM configure and preview the module before reloading.
- On reload, an enabled WelcomeAssist waits for its configured delay and confirms that every other configured GameAssist component is active.
- If another configured component is still inactive, WelcomeAssist waits for a bounded additional health window. It then skips the public greeting and privately names the blocking component instead of announcing that the suite is ready.
- Automatic output is limited to one greeting per sandbox lifecycle.

### Added – Chat safety and configuration limits

- Custom and default greeting text is normalized at configuration and escaped again when rendered.
- Roll20 inline-roll, attribute, ability, macro-query, and template directive characters are neutralized before user-authored text reaches public chat.
- Header text is limited to 80 characters, custom greetings to 240 characters, and the saved custom library to ten entries.
- Startup delay is clamped to the policy range of 1–60 seconds; the default is 3 seconds.
- Timer and current-sandbox announcement bookkeeping use the existing GameAssist clock and lifecycle seams.

### State and migration impact

- Added `state.GameAssist.WelcomeAssist.config.enabled`, defaulting to `false`.
- Added WelcomeAssist configuration for `mode`, `delayMs`, `showHeader`, `header`, `defaultGreeting`, and `customGreetings`.
- Added a small runtime record for the latest completed greeting. Current-sandbox announcement state remains in memory so a reload cannot mislabel an earlier greeting as current.
- Existing GameAssist configuration, initiative groups, tracker data, timezone settings, marker state, conditions, NPC history, and TokenAssist state are preserved.
- Rolling back to v0.1.6.0 leaves the WelcomeAssist state branch inert. InitiativeAssist's new command has no persistent-state requirement.

### MECHSUITS records

- Advanced banner `project_version` and runtime `VERSION` to `v0.1.6.1`.
- Added `MODULES:WELCOMEASSIST` to the file-scoped `canonical_tree` with the literal `GAMEASSIST` codename.
- Added a complete WelcomeAssist section frame with metadata, narrative, guarantees, dependency declarations, risks, decisions, and a required Notes & Comments footer.
- Updated the affected POLICY, MODULES wrapper, InitiativeAssist, and BOOTSTRAP contracts and meaningful-change records.
- Preserved physical parent wrapping and strict ancestor-only overlap for all 25 sections.

### Documentation and metadata

- Updated `README.md` with WelcomeAssist onboarding, commands, configuration, safety behavior, troubleshooting, upgrade guidance, and macro recipes.
- Updated InitiativeAssist documentation with the private `!Init-GM` workflow.
- Expanded `Smoketest.md` with a focused GM-only initiative test and a complete WelcomeAssist section covering disabled startup, previews, modes, custom text, directive safety, timer behavior, and health-gated output.
- Updated `ROADMAP.md` with the v0.1.6.1 release stage and the continuing boundary between InitiativeAssist and the deferred CombatAssist module.
- Updated `script.json` to version 0.1.6.1, add the new commands and module, preserve v0.1.6.0 in `previousversions`, and describe the startup-greeting overlap with other Mods in end-user terms.

### Release artifacts

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `165E62A05ABBCCFE420BFCF84B4567D72D462F966EE95457726EA3499A9A1EF7` |
| `GameAssist.js` | `165E62A05ABBCCFE420BFCF84B4567D72D462F966EE95457726EA3499A9A1EF7` |
| `GameAssist-v0.1.6.1` | `165E62A05ABBCCFE420BFCF84B4567D72D462F966EE95457726EA3499A9A1EF7` |
| `GameAssist-v0.1.6.0` | `E20FCF251620407710DB87042674D8993704E12559321047968170180D005F04` |
| `previousversions/GameAssist v0.1.6.0` | `E20FCF251620407710DB87042674D8993704E12559321047968170180D005F04` |

The development source, One-Click publication mirror, and v0.1.6.1 Roll20 test artifact are byte-identical. Both copies of v0.1.6.0 remain unchanged as the prior release checkpoint.

### Automated verification

| Check | Result |
| --- | --- |
| JavaScript parse/compile | Passed (3/3 current artifacts) |
| MECHSUITS hierarchy and metadata audit | Passed (25/25 declared and actual sections) |
| InitiativeAssist focused harness | Passed (108/108) |
| WelcomeAssist focused harness | Passed (20/20) |
| ConditionAssist regression harness | Passed (35/35) |
| TokenAssist regression harness | Passed (45/45) |
| Integration and lifecycle regression | Passed (46/46) |
| Timezone regression | Passed (23/23) |
| `script.json` parse validation | Passed |
| Current release artifact identity | Passed (3/3 byte-identical) |
| Preserved v0.1.6.0 artifact identity | Passed |

The focused and established automated suites pass 277 checks in total.

### Roll20 acceptance gate

The v0.1.6.0 native tracker population, reroll, invitation, detailed-roll, and GM-roster workflow is accepted as the foundation for this release. The focused v0.1.6.1 Roll20 pass also confirmed that `!Init-GM` remains private and that WelcomeAssist stays silent while disabled, keeps setup and preview private, posts once after a healthy enabled reload, and suppresses a delayed duplicate after manual announcement.

---

## [0.1.7.0] – 2026-07-25

### Release definition

GameAssist v0.1.7.0 introduces **CombatAssist 1.0.5**, a disabled-by-default encounter-flow module that works as an optional layer over Roll20's native Turn Tracker after initiative has been established. It provides a deliberate encounter lifecycle, recognized native round-counter authority, conservative fallback counting, guarded movement, stale-safe configurable timers, private-safe native pings, one-step tracker recovery, ordered player completion prompts, compact navigation, and a persistent on-demand user manual without taking initiative rules away from InitiativeAssist. The completed release also standardizes module-specific `GM` and `DM` interaction screens, adds equivalent NPCManager and Concentration command families, advances InitiativeAssist to 1.0.4, and advances WelcomeAssist to 0.1.4.

This release implements the tracker-integrity and first turn-awareness stages of [Issue #48](https://github.com/Mord-Eagle/GameAssist/issues/48), [Issue #54](https://github.com/Mord-Eagle/GameAssist/issues/54), and [Issue #55](https://github.com/Mord-Eagle/GameAssist/issues/55), then completes the project-wide navigation and manual work in [Issue #58](https://github.com/Mord-Eagle/GameAssist/issues/58) and [Issue #59](https://github.com/Mord-Eagle/GameAssist/issues/59). It does not automatically end turns, alter conditions or markers, apply persistent token highlights, play music, or write NPC history. NPCManager handoff and music remain separately scoped because their cross-module and Jukebox ownership rules differ from tracker observation.

### Added – CombatAssist 1.0.2

- Added the complete `[GAMEASSIST:MODULES:COMBATASSIST]` section beneath the existing MODULES wrapper.
- Added the literal, case-insensitive `!Combat-` command family:
  - `!Combat-Menu` and `!Combat-GM` open the action-focused Control Center;
  - `!Combat-Help` and `!Combat-Guide` open the plain-language Quick Guide;
  - `!Combat-Manual` creates or updates the complete `GameAssist Guide - CombatAssist` handout;
  - `!Combat-Info` whispers the abbreviated purpose and ordinary table workflow;
  - `!Combat-Start` records an explicit round-1 encounter baseline;
  - `!Combat-Start --confirm` deliberately replaces an existing or attention-state baseline;
  - `!Combat-Next` rotates the native tracker forward by exactly one row;
  - `!Combat-Prev` rotates the native tracker backward by exactly one row without changing the round;
  - `!Combat-End-Turn --token <ID>` is generated for the current controlling player in Whispers mode and advances only after current-turn and control permissions are rechecked;
  - `!Combat-Adopt` keeps the current readable native tracker and recorded round, then begins a fresh cycle from the current first entry;
  - `!Combat-Restore` previews one complete saved tracker checkpoint and requires a matching revision plus explicit confirmation before restoring it;
  - `!Combat-Pause` suspends counting before tracker edits;
  - `!Combat-Resume` preserves the round and accepts the current order as a fresh baseline;
  - `!Combat-Status` reports lifecycle state, page, round, current turn, announcement audience, readable tracker state, and available recovery;
  - `!Combat-Audit` performs the same current tracker and encounter inspection with an explicit read-only result;
  - `!Combat-End` opens a confirmation prompt;
  - `!Combat-End --confirm` clears only the CombatAssist encounter record;
  - `!Combat-Announce gm|public|whispers|off` selects the audience for automatic turn notices;
  - `!Combat-Confirm standard|varied` selects one direct private player acknowledgement or a warmer rotation containing the Standard sentence exactly once.
- Added `GameAssist.CombatAssist.version` and defensive `getStatus()` inspection for future integrations. The public object does not expose an unguarded tracker mutator.

### Added – CombatAssist 1.0.3 native rounds, timers, and pings

- Recognizes exactly one native custom round row when its complete normalized label is `Round`, `Rounds`, `Round Count`, `Round Counter`, `Round Number`, `Round Tracker`, `Combat Round`, or `Current Round`.
- Uses the recognized row's positive whole-number initiative value as the encounter round and reports the native source in Start, Status, Audit, and Control Center panels.
- Applies a recognized counter's simple signed whole-number Round Calculation, including `+1`, when `!Combat-Next` or an authorized End My Turn moves that row to the top.
- Does not apply the calculation during backward movement. Multiple plausible counters and non-whole-number values are refused with an actionable explanation instead of being guessed.
- Leaves ordinary custom entries such as `Round Reminder`, lair actions, objects, and effect timers outside round-counter recognition.
- Adds disabled-by-default turn timers through `!Combat-Timer`:
  - duration is bounded from 10 to 3600 seconds;
  - the deadline audience can be GM, current controlling player, both, or public;
  - up to five early reminders each store their own seconds-remaining point and audience;
  - reminder removal and confirmed clearing are available from the timer panel;
  - no timer path advances initiative.
- Binds each scheduled callback to the encounter start, recorded round, current row identity, exact Turn Tracker revision, and absolute deadline. Native movement, CombatAssist movement, InitiativeAssist rebasing, End My Turn, pause, attention, encounter end, and module disable invalidate the prior schedule.
- Restricts player-targeted timer notices to visible linked Objects-layer character turns. Hidden, unlinked, and custom entries stay with the GM even when a broader player recipient was configured.
- Resumes a still-valid absolute deadline after sandbox reload. A deadline that expired while the sandbox was unavailable produces no late player reminder and gives the GM a concise reload notice.
- Adds disabled-by-default native current-turn pings through `!Combat-Cue off|gm|players|both|public`.
- Pings never recenter a map and never change token position, aura, tint, markers, or other token properties. Hidden or GM-layer turns are restricted to GM visibility regardless of the selected audience; custom rows receive no token ping.

### Refined – WelcomeAssist 0.1.2 commands

- Makes `!Welcome` and the case-insensitive `!Welcome-Help`, `!Welcome-Status`, `!Welcome-Preview`, `!Welcome-Announce`, `!Welcome-Mode`, `!Welcome-Delay`, `!Welcome-Header`, `!Welcome-Default`, and `!Welcome-Custom` commands the primary menu and documentation surface.
- Retains the complete `!welcome-assist ...` command family for existing campaign macros.
- Prevents the retained `!welcome-assist` command from being processed a second time by the broader `!Welcome-` prefix handler.

### Refined – Project-wide navigation and manuals

- Advanced the affected module revisions without changing their established gameplay responsibilities:
  - ConfigUI 0.2.2;
  - CritFumble 0.2.5.1;
  - ConditionAssist 1.0.3;
  - TokenAssist 1.0.3;
  - InitiativeAssist 1.0.4;
  - CombatAssist 1.0.5;
  - WelcomeAssist 0.1.4;
  - NPCManager 1.3.2;
  - ConcentrationTracker 0.2.2;
  - NPCHPRoller 0.1.1.2;
  - DebugTools 0.2.2.
- Standardized a compact navigation vocabulary through each module's existing command prefix: **Guide/Help**, **Menu/GM/DM**, **Status**, **Info**, **Audit**, and **Manual**.
- Defined `GM` and `DM` as equal role aliases for each module's primary Game Master interaction screen. They are not alternate names for a generic menu.
- Kept established specialized commands intact. In particular, `!Init-GM` and `!Init-DM` open the private GM initiative roster, `!critfail` remains the direct player picker, and existing concentration `--option` commands remain accepted.
- Added equivalent NPCManager command families through `!NPC-<command>`, `!NPC-Death-<command>`, and `!NPCManager-<command>` without creating separate state or behavior paths.
- Added equivalent ConcentrationTracker command families through `!Con-<command>` and `!Concentration-<command>` while retaining `!concentration`, `!con`, and `!cc` compatibility.
- Made audits explicitly read-only and ensured they always explain that no configuration, token, marker, tracker, HP, table, or history data was changed.
- Added friendly recovery for unrecognized module commands. The response identifies the problem and provides a direct **Open Guide** button instead of failing silently or opening an unrelated action.
- Added `GameAssist.writeModuleManual(...)`, which creates or updates one stable, reserved `GameAssist Guide - <Module>` handout and refuses ambiguous duplicate ownership.
- Added stable user manuals for CritFumble, ConditionAssist, TokenAssist, InitiativeAssist, CombatAssist, WelcomeAssist, NPCManager, and ConcentrationTracker.
- Kept ConfigUI, NPCHPRoller, and DebugTools guidance in chat because their complete safe-use instructions fit in their compact panels; their Manual commands explain that choice rather than creating redundant handouts.
- Added focused regression checks for every new guide, status, audit, manual, and unknown-command path, including repeated manual writes that must update rather than duplicate a handout.

### Added – Exact tracker transition model

- CombatAssist assigns a stable identity to each tracker row:
  - token rows use the exact token id;
  - custom rows use the exact custom label;
  - initiative priority and unknown fields remain data rather than row identity.
- One exact left rotation is a forward turn.
- One exact right rotation is a backward turn.
- A round advances only after an uninterrupted, unambiguous sequence of forward turns returns to the encounter's recorded anchor.
- Backward movement resets forward-cycle progress and never advances or decrements the saved round.
- Undoing a backward step cannot manufacture a round increment. CombatAssist requires a later complete forward cycle before counting another round.
- A valid combatant addition or removal, InitiativeAssist reroll, initiative-priority edit, or manual reorder preserves the recorded round and establishes a fresh counting anchor from Roll20's current first entry.
- CombatAssist accepts those native edits without rewriting them. The GM receives a plain-language summary and an optional one-step undo control.

### Added – Native tracker maintenance and guarded recovery

- CombatAssist retains the current accepted tracker and one complete previous checkpoint, including every row object and unknown field.
- Restore is previewed before mutation, requires the current TurnTrackerService revision, and restores through the guarded core service rather than writing `turnorder` directly.
- The GM may keep the current readable tracker with `!Combat-Adopt`, preserving the round and beginning a fresh cycle without a tracker write.
- CombatAssist enters an explicit `attention` state only when reliable observation is unavailable or ambiguous, including when:
  - the Turn Tracker closes;
  - the tracker page changes;
  - tracker JSON is malformed;
  - a token reference is stale or off-page;
  - a row has no usable identity;
  - duplicate token rows or duplicate custom labels are indistinguishable;
  - a native two-row movement cannot be identified as forward or backward.
- Attention output explains what stopped counting and offers current-tracker adoption, saved-tracker restoration, status review, and a separately labeled round-1 restart.
- Pause remains available for several quiet edits but is no longer required for ordinary additions, removals, rerolls, or reordering.

### Added – Two-row direction safeguard

- A two-row tracker is allowed, but Roll20's native forward and backward arrows produce the same resulting order.
- CombatAssist refuses to infer native arrow direction for that ambiguous case.
- `!Combat-Next` and `!Combat-Prev` carry explicit direction through TurnTrackerService, so two-row encounters can move safely when the GM uses CombatAssist controls.
- The Quick Guide, start panel, README, and troubleshooting guidance all disclose this limitation and recovery path.

### Added – Guarded turn controls

- `!Combat-Next` and `!Combat-Prev` are GM-only.
- Before rotating, CombatAssist re-reads the current tracker, verifies the page and exact expected order, and refuses an attention or stale state.
- The update uses `GameAssist.TurnTrackerService.apply(...)` with the current revision. CombatAssist never writes `Campaign().set('turnorder', ...)` directly.
- The forward transformation moves only the first array element to the end; the backward transformation moves only the last element to the front. Every row object, custom entry, priority, unknown field, and externally owned value is retained unchanged.
- TurnTrackerService verifies the saved page and serialized rows before CombatAssist reports the new turn.
- The Whispers-mode End My Turn button is bound to the exact current token. CombatAssist rechecks the clicking player's control through the linked character and refuses stale or unauthorized controls without changing the tracker.

### Added – Encounter lifecycle and presentation

- CombatAssist starts disabled so an upgrade cannot adopt an already open tracker.
- Start, status, setup, warning, confirmation, backward-movement, and end panels remain GM-only.
- Turn notices default to GM-only and may be public, sent as separate GM/current-player whispers, or disabled.
- GM turn whispers include Next Turn, Previous Turn, and Open Menu. In Whispers mode, each controlling non-GM player receives a separate private current-turn panel with End My Turn.
- A successful player End My Turn click receives a private acknowledgement that reports the next initiative without implying that the recipient controls it.
- When one player controls consecutive characters, the outgoing **Turn Complete** acknowledgement is emitted before the next character's **Your Turn** prompt, preserving the intended A-B-A reading order.
- Linked tokens visible on the objects layer may be named in that acknowledgement. GM-layer tokens, unlinked objects, and custom rows use a generic continuation message so hidden or non-character initiative identities are not exposed.
- The GM can choose one Standard message or a warmer Varied rotation. The Standard sentence appears exactly once as one library choice; the remaining choices add restrained warmth without addressing the recipient as the next character.
- A stale End My Turn button receives a friendly private notice that the tracker has already advanced; the old click makes no further change.
- Pause and resume do not write tracker data. Resume keeps the current round and deliberately establishes a new anchor and order from the current tracker.
- End requires confirmation and removes only `state.GameAssist.CombatAssist.runtime.encounter`.
- Disabling CombatAssist preserves its encounter record and leaves Roll20's tracker unchanged. If the tracker changed while CombatAssist was unavailable, the restored module enters attention rather than attempting to reconstruct missed history.
- Expanded `!ga-status --details` now reports whether CombatAssist is disabled, idle, active, paused, or awaiting attention, and identifies both InitiativeAssist and CombatAssist when TurnTrackerService is unavailable.

### State and migration impact

- Added `state.GameAssist.CombatAssist.config.enabled`, defaulting to `false`.
- Added `state.GameAssist.CombatAssist.config.announcements`, defaulting to `gm`.
- Added `state.GameAssist.CombatAssist.config.playerConfirmations`, defaulting to `standard` with supported `standard` and `varied` values. Saved pre-release `fun` values migrate to `varied`.
- Invalid saved announcement values self-heal to the documented GM-only default without changing valid `gm`, `public`, `whispers`, or `off` choices.
- Added one module-owned `runtime.encounter` record containing lifecycle state, page, round, current turn position, anchor, current and baseline row identities, transition direction, revision, timestamps, the current accepted complete tracker, and one bounded previous checkpoint.
- Valid CombatAssist 1.0.0 encounter records self-heal by seeding the accepted tracker from the matching current native tracker. Malformed recovery data is discarded without deleting otherwise valid configuration.
- Existing GameAssist state, InitiativeAssist groups, Roll20 tracker rows, marker state, NPC history, configuration snapshot schema, and metrics schema are not migrated or rewritten.
- Rolling back to v0.1.6.1 leaves the CombatAssist branch inert. Ending the encounter before rollback is optional because the earlier release does not read that branch.

### Compatibility and ownership boundary

- InitiativeAssist remains the owner of D&D 2014/2024 initiative calculation, player roll options, NPC privacy, tracker population, and rerolls.
- TurnTrackerService remains the single authority for native tracker parsing, page resolution, observations, revision guards, and writes.
- CombatAssist owns only the explicit encounter lifecycle, conservative interpretation of exact tracker rotations, and preserved-round handling of valid native tracker maintenance.
- TurnTrackerService is CombatAssist's baseline prerequisite. No other baseline GameAssist module requires CombatAssist, and disabling it leaves InitiativeAssist, the native Turn Tracker, and unrelated GameAssist features available.
- Optional future interoperability may name another module as a prerequisite for that individual feature. An unavailable prerequisite must disable only the dependent feature and must not prevent either module's baseline operation.
- Roll20's native forward and backward tracker controls remain valid inputs. CombatAssist observes exact rotations and adds guarded controls; it does not replace the tracker interface.
- Another Mod may coexist when it does not also advance turns, reorder tracker rows, manage rounds, or mutate custom counter rows during an active CombatAssist encounter. Campaigns should choose one active encounter-flow owner.
- Disabling TurnTrackerService cascades to both InitiativeAssist and CombatAssist while leaving the native tracker unchanged.

### MECHSUITS records

- Advanced banner `project_version`, runtime `VERSION`, and release prose to `v0.1.7.0`.
- Added `[GAMEASSIST:MODULES:COMBATASSIST]` to the banner order, observability spans, canonical tree, and physical MODULES nesting.
- Updated POLICY with bounded CombatAssist tracker-row limits and advanced its meaningful-change record.
- Updated CORE and MODULES wrapper contracts where release identity or ownership changed.
- Advanced InitiativeAssist to 1.0.2 with a compact root guide and focused topic panels while preserving initiative calculation, permissions, privacy, and tracker behavior.
- Added a complete CombatAssist section header, narrative, guarantees, dependencies, independent module version, teaching commentary, decision log, and Notes & Comments footer.

### Refined – Help and command recovery

- Rebuilt the InitiativeAssist root Guide as a compact action and navigation page. Detailed starting, roll-option, reroll, NPC-privacy, and troubleshooting guidance now appears only after the reader chooses that topic.
- Rebuilt the CombatAssist Quick Guide as a compact Control Center/Status launcher with focused topics for encounter flow, tracker recovery, player messages, and attention states.
- Changed **What does CombatAssist do?** to create or update one persistent `GameAssist Guide - CombatAssist` handout. Its confirmation offers **Open Manual**, **Whisper Short Version**, and **Open Control Center**.
- Added CombatAssist `Status`, `Guide`/`Help`, `GM`/`Menu`, `Info`, and read-only `Audit` navigation aliases as the reference implementation for the project-wide command convention.
- Advanced WelcomeAssist to 0.1.1 and replaced its long setup page with a compact action panel plus focused setup, mode, campaign-greeting, appearance, and safety topics.
- Added a WelcomeAssist unknown-command response that explains the command was not recognized and provides an **Open Guide** button, matching the recovery style already used by CombatAssist and InitiativeAssist.
- Completed [Issue #58](https://github.com/Mord-Eagle/GameAssist/issues/58) across all eleven feature modules while preserving each module's established prefix and specialized controls.
- Completed [Issue #59](https://github.com/Mord-Eagle/GameAssist/issues/59) with stable on-demand manuals for substantial workflows and explicit in-chat guidance for brief modules.

### CombatAssist expansion records

- Implemented and live-tested the configurable timers and stale-safe reminder contract tracked by [Issue #54](https://github.com/Mord-Eagle/GameAssist/issues/54), including recipient selection, stale reminder cancellation, and the rule that a deadline never advances initiative.
- Implemented and live-tested the non-centering native-ping portion of [Issue #55](https://github.com/Mord-Eagle/GameAssist/issues/55) with GM-layer privacy. Persistent token-property highlights remain conditional on exact Legacy and Jumpgate restoration evidence.
- Added [Issue #56](https://github.com/Mord-Eagle/GameAssist/issues/56) for an explicit, optional CombatAssist-to-NPCManager encounter-summary handoff that does not duplicate death or revival history.
- Added [Issue #57](https://github.com/Mord-Eagle/GameAssist/issues/57) for opt-in combat music hooks that preserve unrelated Roll20 Jukebox playback.
- Deferred Issues #56 and #57 so optional cross-module history and Jukebox behavior do not block the next module phase.
- Updated held-action [Issue #53](https://github.com/Mord-Eagle/GameAssist/issues/53) to inherit Standard/Varied wording and the same hidden/custom next-initiative privacy rule.

### Documentation and metadata

- Expanded `README.md` with CombatAssist onboarding, module guide, commands, configuration, developer API, macros, troubleshooting, upgrade steps, roadmap state, ownership boundaries, and current non-goals.
- Expanded `Smoketest.md` with a dedicated CombatAssist component section and v0.1.7.0 clean-install and upgrade acceptance requirements.
- Updated `ROADMAP.md` to record completed live acceptance for Issues #54, #55, #58, and #59 and explicitly defer #42, #43, #44, #45, #50, #52, #56, and #57.
- Added [Issue #60](https://github.com/Mord-Eagle/GameAssist/issues/60) for a later compatibility-preserving migration from inherited module names to the GameAssist naming family, including the NPCHPRoller consolidation decision.
- Updated `script.json` to advertise v0.1.7.0, eleven modules, the expanded module navigation commands, the complete `!Combat-` family, short `!Welcome` commands, native encounter-flow safeguards, and Turn Tracker ownership conflicts in end-user language.
- Added v0.1.6.1 to `previousversions` and retained its publication artifact as the rollback checkpoint.

### Release artifacts

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `C4385006210235C4C8B1BEBA5704E5420249CBF54F638EBA3230EA5DD01DCE6C` |
| `GameAssist.js` | `C4385006210235C4C8B1BEBA5704E5420249CBF54F638EBA3230EA5DD01DCE6C` |
| `GameAssist-v0.1.7.0` | `C4385006210235C4C8B1BEBA5704E5420249CBF54F638EBA3230EA5DD01DCE6C` |
| `GameAssist-v0.1.6.1` | `165E62A05ABBCCFE420BFCF84B4567D72D462F966EE95457726EA3499A9A1EF7` |
| `previousversions/GameAssist v0.1.6.1` | `165E62A05ABBCCFE420BFCF84B4567D72D462F966EE95457726EA3499A9A1EF7` |

The development source, One-Click publication mirror, and v0.1.7.0 Roll20 test artifact are byte-identical. The preserved v0.1.6.1 previous-version artifact matches its original release artifact.

### Automated verification

| Check | Result |
| --- | --- |
| JavaScript parse/compile | Passed for all current and preserved release artifacts |
| CombatAssist focused harness | Passed (145/145) |
| InitiativeAssist focused harness | Passed (116/116) |
| WelcomeAssist focused harness | Passed (30/30) |
| ConditionAssist clean-install harness | Passed (59/59) |
| ConditionAssist migrated-state and cross-module navigation harness | Passed (81/81) |
| TokenAssist regression harness | Passed (45/45) |
| Timezone regression harness | Passed (23/23) |
| Integration and lifecycle regression | Passed (46/46) against the preserved v0.1.4.7 baseline |
| CombatAssist dependency-direction audit | Passed: TurnTrackerService is the sole baseline prerequisite; no other baseline module requires CombatAssist |
| MECHSUITS hierarchy and metadata audit | Passed: 26 framed sections and 26 matching canonical-tree entries |
| `script.json` parse validation | Passed |
| Current release artifact identity | Passed |
| Preserved v0.1.6.1 artifact identity | Passed |

The eight automated behavior tracks pass 545 assertions in total. The structural, metadata, syntax, and artifact-identity gates also pass.

### Roll20 acceptance

The dedicated live Roll20 pass completed successfully. It confirmed native round-counter `+1`, fallback round counting, backward safety, preserved-round tracker edits, stale timer cancellation, deadline non-advancement, ping audiences and hidden-turn privacy, recovery, GM/current-player controls, A-B-A delivery, privacy-safe confirmations, the persistent manual, unreadable-state attention, two-row behavior, disable/reload behavior, and unchanged InitiativeAssist operation. The same pass accepted compact module navigation, read-only audit wording, unknown-command recovery, stable non-duplicating manuals, equal `GM`/`DM` module screens, and the NPCManager and Concentration command aliases.
