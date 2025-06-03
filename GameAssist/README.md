
# GameAssist – Modular API Framework for Roll20  
**Version 0.1.1.1** | © 2025 Mord Eagle · MIT License  
**Lead Dev:** [@Mord-Eagle](https://github.com/Mord-Eagle)  

---

## 0 · What is GameAssist (in one paragraph)?

GameAssist is a **Roll20 API modular Framework**: one script that drops into your API sandbox and spins up a guarded event-queue, metrics board and watchdog. Currently it has four bundled modules—CritFumble, Concentration Tracker, NPC Manager and NPC HP Roller—that hook into that queue, giving you automated fumble tables, concentration checks, death-marker hygiene and one-click HP randomization. Hot-reload, per-task time-outs and state audits let you run marathon sessions without reloading the sandbox.

---

## 1 · TL;DR Cheat Sheet

| Category | Highlights |
| -------- | ---------- |
| Core Lift | Serialised queue, per-task timeout, watchdog auto-recovery, state auditor, live metrics. |
| 30-Second Install | ① Paste **GameAssist.js** ② One-Click **TokenMod** ③ Add **seven** roll-tables (list below) ④ `!ga-status` = green. |
| Flagship Player Commands | `!concentration`, `!cc`, `!critfail` |
| Flagship GM Commands | `!npc-hp-all`, `!npc-hp-selected`, `!npc-death-report` |
| Admin Controls | `!ga-config list\|get\|set\|modules`, `!ga-enable`, `!ga-disable`, `!ga-status` |
| Safety Nets | FIFO queue + watchdog + auditor → zero silent failures. |
| Extensibility | `GameAssist.register('MyModule', initFn, { events:['chat:message'], prefixes:['!mymod'] });` |
| Backup Utility | `!ga-config list` produces a hand-out containing the full JSON config. |

> **Required Roll-Tables:** CF-Melee, CF-Ranged, CF-Thrown, CF-Spell, CF-Natural, Confirm-Crit-Martial, Confirm-Crit-Magic  


---

## 2 · Table of Contents
> 3. [Overview](#3-overview) 4. [Quick Start](#4-quick-start) 5. [Deep-Dive Architecture](#5-deep-dive-architecture) 6. [Module Guides](#6-module-guides)  

> 7. [Installation](#7-installation) 8. [Command Matrix](#8-command-matrix) 9. [Configuration Keys](#9-configuration-keys) 10. [Developer API](#10-developer-api)  

> 11. [Roll-Table Cookbook](#11-roll-table-cookbook) 12. [Macro Recipes](#12-macro-recipes) 13. [Performance Benchmarks](#13-performance-benchmarks)  

> 14. [Troubleshooting](#14-troubleshooting) 15. [Upgrade Paths](#15-upgrade-paths) 16. [Contributing](#16-contributing)  

> 17. [Roadmap](#17-roadmap) 18. [Changelog](#18-changelog) 19. [Glossary](#19-glossary)

---

## 3 · Overview <a id="3-overview"></a>

GameAssist’s micro-kernel wraps the Roll20 event bus and exposes:

* **Task Queue** – serialises async work (`sendChat`, `findObjs`, …) and times out stalled jobs.  
* **Watchdog** – detects a hung task > `DEFAULT_TIMEOUT × 2` and restarts the queue.  
* **State Manager** – namespaced storage (`state.GameAssist.<Module>`) with auto-seed and orphan purge.  
* **Metrics Board** – live counters (`commands`, `errors`, `avgTaskMs`) surfaced through `!ga-status`.  
* **Hot Reload** – `!ga-enable|disable` detaches listeners, resets state and re-inits without a sandbox restart.  
* **Compatibility Audit** – toggle `GameAssist.flags.DEBUG_COMPAT` to see a list of known and unknown scripts.

Design goal: **zero GM downtime**.

---

## 4 · Quick Start <a id="4-quick-start"></a>

```text
📥 1  Copy GameAssist.js → API editor → Save
🛠 2  Install TokenMod (no config needed)
📜 3  Create 7 roll-tables (see § 9: Roll-Table Cookbook)
🔄 4  Type !ga-status  → each module should report “Ready”
🎲 5  Test  • !critfail  • !concentration --damage 14
````

---

## 5 · Deep-Dive Architecture <a id="5-deep-dive-architecture"></a>

### 5.1 Event Pipeline

Every inbound Roll20 event is wrapped so the kernel can tally metrics, enforce ACLs and guarantee FIFO execution with a timeout watchdog.

### 5.2 Fail-Safe Scenarios

| Scenario                     | Kernel Response                                |
| ---------------------------- | ---------------------------------------------- |
| Uncaught exception in module | Error logged, queue continues.                 |
| Infinite `sendChat` loop     | Watchdog kills task after 60 s (configurable). |
| State manually corrupted     | Auditor deletes branch and re-seeds defaults.  |

---

## 6 · Module Guides <a id="6-module-guides"></a>

### 6.1 CritFumble

Natural-1 detection on the standard `atk`, `atkdmg`, `npcatk`, `spell` templates. Auto-prompts attacker with a chat-button menu; GM can trigger manually with `!critfail`. Internals:

* Helper commands: `!critfumble help`, `!critfumble-<type>`, `!critfumblemenu-<player>`, `!Confirm-Crit-Martial`, `!Confirm-Crit-Magic`.
* Config: `debug`, `useEmojis`, `rollDelayMs`.

### 6.2 Concentration Tracker
*(Requires TokenMod API for automated marker/status integration.)*

`!concentration` or the alias `!cc` opens buttons for normal/adv/dis rolls or takes flags:

```
            
            "• --help  		→ Whispers Concentration 'Help' message",
            "• --damage X           → Roll vs DC = max(10,⌊X/2⌋),
            "• --mode normal|adv|dis→ Set roll mode",
            "• --last               → Repeat last check",
            "• --off                → Remove marker from selected tokens",
            "• --status             → Who is concentrating",
            "• --config randomize on|off → Toggle emote randomization"
```

Config keys: `marker`, `randomize`.

### 6.3 NPC Manager
*(Requires TokenMod API for automated marker/status integration.)*

Watches `change:graphic:bar1_value`. When an NPC’s HP drops below 1 the `deadMarker` is applied via TokenMod, and removed when HP rises. `!npc-death-report` audits for mismatches. Config keys: `autoTrackDeath`, `deadMarker`.

### 6.4 NPC HP Roller
*(Requires TokenMod API for automated marker/status integration.)*

`!npc-hp-all` rolls HP for every NPC on the player page; `!npc-hp-selected` works on a token-selection. Parses any `NdM±K` formula stored in `npc_hpformula`. Optional future flag `autoRollOnAdd` (present but currently false by default as it is a work in progress).

---

## 7 · Installation <a id="7-installation"></a>

I. In Roll20, open **Game Settings → API Scripts**.  
II. Create a new script, paste in your `GameAssist.js` file and click **Save Script**.  
III. From the Mod Library, install **TokenMod** (required by several modules).  
IV. Using the Rollable Table tool, create these seven tables by name:  
   - CF-Melee  
   - CF-Ranged  
   - CF-Spell  
   - CF-Natural  
   - CF-Thrown  
   - Confirm-Crit-Martial  
   - Confirm-Crit-Magic  
V. Click **Save Script** again to reload the API. As GM, open your chat whisper window and confirm you see one “ready” message for GameAssist itself and one for each module. It will look roughly like this:  

> (From GameAssist): ℹ️ [10:53:56 PM] [Core] GameAssist v0.1.1.1 ready; modules: CritFumble, NPCManager, ConcentrationTracker, NPCHPRoller

VI. To verify end-to-end, type `!ga-status` as GM. You’ll receive a whispered summary of GameAssist’s internal metrics (commands processed, active listeners, queue length, etc.), which confirms the system is up and running.  

---

## 8 · Command Matrix <a id="8-command-matrix"></a>

| Scope      | Command                                                     | Parameters / Flags                                                                      | Purpose                                                  |
|------------|-------------------------------------------------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------|
| **Admin**  | `!ga-config list`                                           | —                                                                                       | Write full JSON config to a “GameAssist Config” handout  |
|            | `!ga-config get <Module> <key>`                             | —                                                                                       | Whisper the current value of one config key              |
|            | `!ga-config set <Module> <key>=<value>`                     | —                                                                                       | Persistently set one config key                         |
|            | `!ga-config modules`                                        | —                                                                                       | List all modules with enabled/initialized status icons   |
|            | `!ga-enable <Module>` / `!ga-disable <Module>`              | —                                                                                       | Enable or disable a module                               |
|            | `!ga-status`                                                | —                                                                                       | Whisper live metrics (commands, messages, errors, etc.)  |
| **GM**     | `!npc-hp-all`                                               | —                                                                                       | Roll & set HP for all NPC tokens on the current page     |
|            | `!npc-hp-selected`                                          | —                                                                                       | Roll & set HP for the currently selected NPC tokens      |
|            | `!npc-death-report`                                         | —                                                                                       | Report NPC tokens whose HP/“dead” marker states mismatch |
|            | `!critfail`                                                 | —                                                                                       | Manual fumble prompt menu for active players             |
|            | `!critfumble help`                                          | —                                                                                       | Whisper CritFumble help panel                            |
| **Player** | `!critfumble-<type>`                                        | `<type>` ∈ {melee, ranged, thrown, spell, natural}                                       | Trigger the fumble‐type menu for your character          |
|            | `!confirm-crit-martial` / `!confirm-crit-magic`             | —                                                                                       | Roll the corresponding confirmation table                |
|            | `!concentration` / `!cc`                                    | `--damage X`, `--mode normal\|adv\|dis`, `--last`, `--off`, `--status`, `--config randomize on\|off`, `--help` | Open UI buttons or perform a concentration save         |

---

## 9 · Configuration Keys <a id="9-configuration-keys"></a>

| Module                   | Key             | Type    | Default             |
|--------------------------|-----------------|---------|---------------------|
| **CritFumble**           | `debug`         | bool    | `true`              |
|                          | `useEmojis`     | bool    | `true`              |
|                          | `rollDelayMs`   | number  | `200`               |
| **ConcentrationTracker** | `marker`        | string  | `"Concentrating"`   |
|                          | `randomize`     | bool    | `true`              |
| **NPCManager**           | `autoTrackDeath`| bool    | `true`              |
|                          | `deadMarker`    | string  | `"dead"`            |
| **NPCHPRoller**          | `autoRollOnAdd` | bool    | `false` (future)     |


---

## 10 · Developer API <a id="10-developer-api"></a>

| Category               | Method                                                                   | Description                                                                                                   |
|------------------------|--------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| **Module Registration** | `GameAssist.register(name, initFn, options)`                              | Register a new module. `name`: unique ID; `initFn`: init callback; `options`: `{ enabled: bool, events: [], prefixes: [], teardown: fn }` |
| **Command Handling**   | `GameAssist.onCommand(prefix, handler, moduleName, opts)`               | Listen for API chat commands; `opts`: `{ gmOnly: bool, acl: [playerIDs] }`                                       |
| **Event Handling**     | `GameAssist.onEvent(eventName, handler, moduleName)`                    | Listen for Roll20 events (e.g. `chat:message`, `change:graphic:bar1_value`)                                    |
| **Listener Cleanup**   | `GameAssist.offCommands(moduleName)` / `GameAssist.offEvents(moduleName)` | Remove all commands or events registered by the given module                                                  |
| **Module Control**     | `GameAssist.enableModule(name)` / `GameAssist.disableModule(name)`       | Enable or disable a module at runtime, running its `initFn` or `teardown`                                      |
| **Logging & Errors**   | `GameAssist.log(moduleName, message, level?, opts?)`                    | Whisper a log to GM; `level` defaults to `'INFO'`; `opts`: `{ startup: bool }`                                   |
|                        | `GameAssist.handleError(moduleName, error)`                             | Increment error metric and log an `'ERROR'`-level message                                                      |
| **State Management**   | `getState(moduleName)`                                                   | Retrieve (and auto-create) persistent state branch: returns `{ config, runtime }`                              |
|                        | `saveState(moduleName, data)`                                            | Merge and persist additional data into a module’s state branch                                                |
|                        | `clearState(moduleName)`                                                 | Delete a module’s persistent state branch                                                                     |
| **Metrics Inspection** | `GameAssist._metrics`                                                    | Live metrics: counts of commands, messages, errors, state audits, task durations, plus `lastUpdate`            |

> **Note:** `DEFAULT_TIMEOUT` and `WATCHDOG_INTERVAL` are internal constants and not part of the public API.  


---

## 11 · Roll-Table Cookbook <a id="11-roll-table-cookbook"></a>

Sample **CF-Melee** roll table:

| Die Roll | Weight | Effect                                                                                                                         |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 1        | 1      | **Sweaty Grip** – Disadvantage on next attack                                                                                  |
| 2–4      | 3      | **Weapon Twists** – Attack deals half damage                                                                                  |
| 5–6      | 2      | **Off-Balance** – You fall prone                                                                                                |
| 7        | 1      | **Lost Grip** – Weapon drops at the foot of your opponent; picking it up requires an action or provokes an opportunity attack |
| 8        | 1      | **Double Trouble** – Roll twice; both effects apply (rerolls of 8 count as new rolls)                                           |


---

## 12 · Macro Recipes <a id="12-macro-recipes"></a>

### 12.1 GM Panic – disable every module

```roll20chat
!ga-disable CritFumble
!ga-disable ConcentrationTracker
!ga-disable NPCManager
!ga-disable NPCHPRoller
```

---

## 13 · Performance Benchmarks <a id="13-performance-benchmarks"></a>

These measurements reflect real-world performance on the specified hardware and chart the end-to-end runtime for `!npc-hp-all` across a moderate token load.

| CPU / RAM                           | Ryzen 7 7735HS @ 3.2 GHz · 16 GB DDR5-4800                    |
| OS / Browser                        | Windows 11 Home 24H2 (build 26100.4061) · Chrome 137.0.7151.55 |
| Roll20 sandbox                      | “Experimental” channel – 2025-04-09 build                     |
| Dataset                             | 25 NPC tokens on one page                                     |

**Timing results (`!npc-hp-all`, 25 tokens)**  

| Run group | Samples | Mean | Median | σ (stdev) | Min – Max         |
| --------- | :-----: | ---- | ------ | --------- | ----------------- |
| Warm sandbox (runs 1–24)                 | 24 | **280 ms** | 268 ms | 24 ms | 253 – 337 ms |
| Fresh sandbox (runs 25–34)<br><small>(immediately after Restart Sandbox)</small> | 10 | **355 ms** | 350 ms | 18 ms | 330 – 387 ms |
| **Combined**                             | **34** | **298 ms** | 300 ms | 39 ms | 253 – 387 ms |

---

## 14 · Troubleshooting <a id="14-troubleshooting"></a>

- **GameAssist appears unresponsive**  
  Run `!ga-status` and look at **Queue Length** and **Last Update**.  
  - If **Queue Length** keeps climbing while **Last Update** does not change, a module is stuck.  
  - To resolve: either increase `DEFAULT_TIMEOUT` in the code or disable modules one by one (`!ga-disable <Module>`) until you identify the problematic one.

- **Module not enabled**  
  Use `!ga-config modules` to view each module’s enabled/initialized status.  
  - If a module shows ❌, enable it with `!ga-enable <Module>`.  
  - If you never see a “Ready: …” message for a module during startup, confirm that its `enabled` key in state is `true` (run `!ga-config get <Module> enabled`).

- **API command not working**  
  Many common pitfalls:  
  - Ensure you type commands in lowercase (e.g. `!concentration`, `!critfail`).  
  - For ConcentrationTracker, verify the code is using `GameAssist.onEvent('chat:message', handler)` and converting `msg.content.toLowerCase()` before matching against `['!concentration','!cc']`.  
  - If you forked or edited the module, compare against the official GameAssist (or related module) code to confirm you didn’t accidentally remove key lines.

- **Rollable tables missing or typo**  
  CritFumble relies on exactly these table names (case-sensitive):  
  - `CF-Melee`  
  - `CF-Ranged`  
  - `CF-Spell`  
  - `CF-Natural`  
  - `CF-Thrown`  
  - `Confirm-Crit-Martial`  
  - `Confirm-Crit-Magic`  
  If any of these do not exist (or are spelled differently), fumble menus and confirm commands will fail. Use the Roll20 Rollable Table tool to create or correct them.

- **TokenMod errors or missing**  
  NPCManager and ConcentrationTracker both call `!token-mod`. Make sure you have TokenMod installed (from the Mod Library) and that it appears **above** GameAssist in your API Scripts list. If TokenMod is missing, you will see errors in the API log when running NPCManager or ConcentrationTracker commands.

- **No debug output for a module**  
  To enable compatibility logs for conflicting scripts, open the API Console (press F12 in the API Editor) and enter:  
  ```js
  GameAssist.flags.DEBUG_COMPAT = true;

 Then click Save Script to reload.

- For module-specific debugging, whisper to GM:
    ```js
  !ga-config set <Module> debug=true

 That will emit detailed debugLog whispers whenever that module runs.

- Markers not toggling correctly  
  -  For ConcentrationTracker, run !concentration --off on a selected token to clear its marker.  
  - If markers persist, check which token is selected and whether its status name matches the configured marker key. You can verify via:
    ```js
    !ga-config get ConcentrationTracker marker
  
  -  For NPCManager, HP <1 should apply the deadMarker. If tokens aren’t getting the “dead” marker, confirm:
  ```js
  !ga-config get NPCManager deadMarker

- Re-enabling after a Panic disable
  If you used a “GM Panic” macro that ran:
> !ga-disable CritFumble
> !ga-disable NPCManager
> !ga-disable ConcentrationTracker
> !ga-disable NPCHPRoller

  bring everything back online by executing:
> !ga-enable CritFumble
> !ga-enable NPCManager
> !ga-enable ConcentrationTracker
> !ga-enable NPCHPRoller

- Still stuck?
  Check the API Log (visible in the Roll20 API Editor) for red error messages. If you see a “SyntaxError” or “ReferenceError,” copy the exact text and search or post on the Roll20 Community API Forum, including your GameAssist version and which module triggered the error.

---

## 15 · Upgrade Paths <a id="15-upgrade-paths"></a>

When a new release appears on GitHub, follow these steps:

I. **Backup Your Current Environment**  
   	a. In Roll20, open **Game Settings → API Scripts**.  
   	b. Select your existing GameAssist script, copy all its contents, and paste them into a local file (e.g. `GameAssist-backup.js`).  
   	c. (Optional) Attempt to back up your current configuration by running `!ga-config list`.  
      - **NOTE:** At the time of writing, `!ga-config list` may output an empty JSON (`{}`) instead of your full settings. If you see `{}`, open the API Console (F12 → “API” tab), then copy the entire `state.GameAssist` JSON branch to a local file (e.g. `GameAssist-state-backup.json`).  
   	d. Confirm you have the script backup (and optionally a state/handout backup) before proceeding.

II. **Fetch the Latest Release from GitHub**  
   	a. Visit the [GameAssist repository](https://github.com/Mord-Eagle/GameAssist) on GitHub and select the latest tagged release (e.g. `v0.1.1.1 → v0.1.1.2`).  
   	b. Download or copy the raw contents of the new `GameAssist.js` to your clipboard.

III. **Replace the Script in Roll20**  
   	a. In **Game Settings → API Scripts**, select your current GameAssist entry.  
   	b. Delete all existing code from that script.  
   	c. Paste in the new `GameAssist.js` from GitHub.  
   	d. Click **Save Script**.

IV. **Verify Core Loading**  
   	a. Watch your GM Whisper window—look for a banner such as:  
      ```
      GameAssist v0.1.1.2 ready; modules: CritFumble, NPCManager, ConcentrationTracker, NPCHPRoller
      ```  
   	b. Run `!ga-status` to confirm there are no errors and that all modules report as active.  
   	c. If you do not see the “ready” banner or encounter errors, immediately revert by replacing the script contents with your `GameAssist-backup.js` and clicking **Save Script**.

V. **Quick Module Smoke Test**  
   	a. **CritFumble:** Roll a natural-1 on an attack or type `!critfail`. The fumble menu should appear.  
   	b. **NPCManager:** Drag an NPC token below 1 HP or run `!npc-death-report`. Verify correct marker state or mismatches.  
   	c. **ConcentrationTracker:** Type `!concentration --status`; you should receive a whisper listing who is concentrating.  
   	d. **NPCHPRoller:** Select an NPC token and run `!npc-hp-selected`; the token’s HP bar should update.

VI. **Verify Configuration Keys Persist**  
   	a. Your existing settings in `state.GameAssist.config` should carry over automatically.  
   	b. To double-check a few common values, run:  
      ```roll20chat
      !ga-config get CritFumble debug
      !ga-config get NPCManager deadMarker
      !ga-config get ConcentrationTracker marker
      !ga-config get NPCHPRoller autoRollOnAdd
      ```  
   	c. If any values look incorrect or missing (possibly due to the `!ga-config list` bug), restore your saved `state.GameAssist` JSON via the API Console.

VII. **Rollback Plan (if needed)**  
   	a. If an upgrade fails—missing “ready” banner, unexpected errors—open **API Scripts** and paste in your `GameAssist-backup.js`.  
   	b. Click **Save Script** to revert to the last working version.  
   	c. Open the API Console, paste in your saved `state.GameAssist` JSON under the `state` object, and click **Save State**.  
   	d. Run `!ga-status` to verify you’re back to the previous stable environment.

> **Summary:** Upgrading is simply:  
> **Copy → Paste → Save → Verify → (optional Rollback).**  

---

## 16 · Contributing <a id="16-contributing"></a>

Thank you for your interest in improving GameAssist. Please follow these guidelines to streamline reviews and maintain consistency across the codebase.

I. **Reporting Issues**  
   a. Before creating a new issue, search existing issues to ensure it hasn’t already been reported or resolved.  
   b. When reporting a bug:  
      - Provide a clear, descriptive title (e.g. “NPCManager does not set dead marker when HP < 1”).  
      - In the description, include:  
        1. Steps to reproduce the problem in a minimal scenario.  
        2. The exact GameAssist version and Roll20 environment (e.g. browser, API version).  
        3. Any error messages from the API Console or chat whispers.  
      - If you have a temporary workaround or suspect a specific module/file, include that detail.  
   c. When suggesting a new feature or enhancement:  
      - Describe the problem you’re trying to solve or the use case you envision.  
      - Outline exactly what new commands, configuration keys, or behaviors you propose.  
      - If possible, sketch example API signatures or sample usage to illustrate your idea.

II. **Development Environment & Coding Style**  
   a. **JavaScript Standards**  
      1. Use ES6+ syntax (e.g., `const`/`let`, arrow functions, template literals).  
      2. Maintain the existing indentation (4 spaces per level) and brace style.  
      3. Keep helper functions, constants, and variables scoped inside the `GameAssist.register(…)` callback whenever possible—avoid top-level declarations.  
   b. **Module Structure**  
      1. Each new or modified module should use `GameAssist.register(name, initFn, options)`.  
         - `name` must be unique.  
         - `initFn` contains all initialization logic.  
         - `options` should specify `{ enabled: bool, events: [eventNames], prefixes: [chatPrefixes], teardown: fn }`.  
      2. Follow the established pattern:  
         - **Helper functions** and constants at the top of the callback.  
         - **Core handler functions** in the middle.  
         - `GameAssist.onEvent(…)` or `GameAssist.onCommand(…)` at the end.  
         - A final `GameAssist.log(...)` announcing readiness.  
      3. If adding a new module, always call `getState(moduleName)` to create your own `{ config, runtime }` branch. Do not overlap or delete another module’s state.  
   c. **Linting & Testing**  
      1. Although we don’t enforce a linter or automated tests, please manually verify your changes by:  
         - Loading the updated script in Roll20’s API Editor.  
         - Observing the “ready” banner in GM whispers.  
         - Running `!ga-status` to confirm no errors.  
         - Testing any new commands in a sandbox game.  
      2. If you introduce new Rollable Tables, update the README’s **Roll-Table Cookbook** (§11) with exact table names and sample entries.

III. **Pull Request Workflow**  
   a. **Fork & Branch**  
      1. Fork the GameAssist repository on GitHub.  
      2. Clone your fork locally and create a branch named for your change (e.g. `fix-npc-death-marker`, `feature-add-concentration-log`).  
   b. **Commit Messages**  
      1. Use short, imperative titles (e.g. “Fix: NPCManager missing dead marker”).  
      2. In the body, explain what changed and why. Reference issue numbers like “Closes #123” or “Fixes #123” when applicable.  
   c. **Submitting a Pull Request**  
      1. Push your branch to your fork.  
      2. Open a PR against the `main` branch of the upstream GameAssist repository.  
      3. In the PR description, include:  
         - A summary of your changes.  
         - Any new commands, configuration keys, or table names introduced.  
         - Steps for reviewers to verify (e.g., “Install TokenMod, create a rollable table named `CF-NewFeature`, and run `!newfeature-test`).  
      4. Respond promptly to review feedback and adjust your branch as needed.

IV. **Documentation & Examples**  
   a. If you add or change a command, update the **Command Matrix** (§8) to include syntax, parameters, and purpose.  
   b. For any new roll‐table requirements, append them to the **Roll-Table Cookbook** (§11) with sample entries.  
   c. If you modify or add configuration keys, reflect them in the **Configuration Keys** table (§9) with type and default values.  
   d. Wherever possible, include a one‐or‐two‐line example usage in the appropriate README section (e.g. “Macro Recipes” or “Troubleshooting”).

V. **Communication & Etiquette**  
   a. Keep feedback constructive, focusing on solutions rather than blame. We aim to help contributors improve.  
   b. If a proposed change is large or architectural, open a discussion issue first. Community input can guide major decisions.  
   c. Follow the Code of Conduct: be courteous, inclusive, and respectful of everyone’s time and effort.

By adhering to these guidelines, you’ll help keep GameAssist’s codebase clean, consistent, and accessible—whether you’re an experienced developer or new to Roll20’s API. We appreciate your contributions!  

---

## 17 · Roadmap <a id="17-roadmap"></a>

Below is a list of upcoming ideas and planned improvements for GameAssist. This isn’t a strict to-do list—priorities may shift as new needs arise and the community offers feedback. 

As you browse this list you will notice that, while some of these ideas are well within reach and could be implemented in the next few updates, others are “pie-in-the-sky” concepts that may prove too complex or simply outside my current bandwidth. I want to be transparent: I’ll do my best to tackle each item, but I can’t guarantee every suggestion will make it into the code. If you see something here that sparks questions or if you have a new idea altogether, please let me know—whether it’s to request an addition, raise a concern, or even contribute code. Your collaboration and feedback help shape where GameAssist goes next.

1. **Auto HP Roll on NPC Token Add**  
   - Automatically roll and assign HP whenever a new NPC token is placed on the map.  

2. **Spell-Specific Concentration Integration**  
   - Automatically apply the “Concentrating” marker when a concentration spell is cast.  
   - Include the spell name (and optionally an icon) in concentration check results and in the `--status` report.  
   - Track spell duration or expiration by round, and send optional reminders in chat.  
   - Automatically clear the “Concentrating” marker if the token’s HP drops to 0 or below.  

3. **Expanded Module Suite**  
   - **Cooldown Tracker**: Prototype a module that monitors ability recharge timers (e.g., Legendary Actions, spell slots) and whispers reminders when those resources become available again.  
   - **Encounter Assistant**: Tools for initiative tracking, managing enemy waves, and quick loot distribution.  
   - **Resource Tracker**: A unified way to track spell slots, ki points, sorcery points, and other character resources directly from tokens.  
   - **Condition Effect Automator**: Automatically apply and remove condition markers (e.g., stunned, poisoned) based on triggers or API calls.  
   - **Rest & Recovery Module**:  
     - Allow the GM to apply a short or long rest to all player characters with a single command.  
     - Include an “alternate (gritty) rest” option for rules that use longer rest periods.  
     - Provide customizable, homebrew-friendly rest rules for campaigns that use nonstandard recovery mechanics.  
   - **Roll Table Integration**: Enable quick import/export of custom Rollable Tables so GMs can share or backup table data easily.  
   - **Dynamic Location Detection**: Automatically manage Auras and Area-of-Effect visuals based on token position and map geometry.  

4. **Modular Component Registry & Discovery**  
   - Implement a lightweight “plugin loader” system so third-party modules can register themselves with minimal boilerplate.  
   - Allow users to enable or disable modules simply by dropping files into a designated folder or directory structure.  

5. **Configuration & State Editor**  
   - Provide a structured JSON export/import for `state.GameAssist` so GMs can back up, share, or restore entire configuration snapshots in one step.  

6. **Documentation, Examples & Community Resources**  
   - Build a gallery of real-world macro recipes (e.g., auto-casting spells, sequenced multi-attack workflows) that demonstrate best practices with GameAssist modules.  
   - Expand the “Roll-Table Cookbook” with templates for common third-party content (e.g., random NPC generation, trap effects, ambient encounters).  
   - Offer suggestions and recommendations for introducing new features to players—tips for communicating changes so everyone stays on the same page.  

7. **System Enhancements**  
   - **Session Metrics & Logging**: Track and display per-session statistics (command usage, error rates, module performance) to help diagnose issues or identify hot spots.  
   - **Verbose Mode**: Add a runtime toggle that captures more detailed diagnostics—useful when debugging or troubleshooting complex scenarios.  

> **Note on Feedback:**  
> I’m eager to hear your thoughts, new ideas, bug reports, concerns, or general feedback. While I can’t promise immediate implementation or a fixed timeline, every request will be reviewed and considered. If you have something to add or see an area that needs improvement, please open an issue or join the discussion—your contributions are what make GameAssist better for everyone.  


---

## 18 · Changelog <a id="18-changelog"></a>

See `CHANGELOG.md`.

---

## 19 · Glossary <a id="19-glossary"></a>

Below are key terms used throughout GameAssist documentation. Each entry includes a friendly, approachable definition to help you understand how everything fits together.

- **API Command**  
  A chat message beginning with an exclamation mark (`!`) that the GameAssist kernel listens for. When a player or GM types something like `!critfail`, GameAssist intercepts it and calls the appropriate module. Think of it as a “chat shortcut” that triggers a module action.

- **Command Handler**  
  A JavaScript function registered by a module to respond to specific API commands. Under the hood, `GameAssist.onCommand(...)` wraps your handler so that when someone types the matching prefix (e.g. `!concentration`), GameAssist routes the message into your code.

- **Event Handler**  
  A JavaScript function that runs when a certain Roll20 event occurs (for example, a token’s HP changes or someone sends a chat message). Modules register event handlers via `GameAssist.onEvent(...)`, and GameAssist makes sure they only fire after the system has fully initialized.

- **Kernel**  
  The central GameAssist engine that manages the task queue, watchdog timer, metrics collection, and overall coordination between modules. You can think of it as the “operating system” for all GameAssist features.

- **Marker**  
  A Roll20 token status icon (e.g., “dead,” “Concentrating,” or any other colored dot or symbol). Modules like NPCManager or ConcentrationTracker toggle these markers on tokens to visually show conditions without manual clicking.

- **Module**  
  A self-contained feature package that plugs into the GameAssist kernel. Each module is registered with a unique name and an initialization function—the kernel calls that function when it’s time to turn the module on. Examples include CritFumble, NPCManager, ConcentrationTracker, and NPCHPRoller.

- **Persistent State**  
  The JSON object stored in `state.GameAssist` where each module keeps its configuration and runtime data. This state persists between API script reloads so modules can “remember” settings like whether they’re enabled or when a player last took damage.

- **Prefixes**  
  The string or strings (like `!critfumble` or `!cc`) that identify module-specific commands. GameAssist collects all prefixes when you register a module, deduplicates them, and listens for chat messages that start with any of those prefixes.

- **Roll-Table (Rollable Table)**  
  A built-in Roll20 feature where you define a list of outcomes (entries) each tied to die roll ranges (e.g., “2–4 → Weapon Twists”). Modules like CritFumble automatically roll on these tables (e.g., `1t[CF-Melee]`) to generate a random effect or flavor text.

- **Task**  
  An asynchronous job placed on GameAssist’s internal queue (via `_enqueue`). Tasks can be anything from initializing a module to running a delayed table roll. The kernel serializes tasks, enforces timeouts, and uses a watchdog to prevent the queue from stalling.

- **Teardown Function**  
  An optional function a module provides when registering. Called by `GameAssist.disableModule(...)`, teardown typically cleans up event listeners, removes markers, and restores any state to its pre-initialized form.

- **Watchdog**  
  A periodic check (running every 15 seconds by default) that ensures the task queue isn’t stuck. If a task processor takes longer than twice the default timeout, the watchdog forces a reset so subsequent tasks can continue.

- **Watchdog Interval**  
  The frequency (in milliseconds) at which the watchdog timer inspects the queue. By default, it’s set to 15,000 ms (15 seconds). If a task hasn’t finished within `DEFAULT_TIMEOUT * 2`, the watchdog logs a warning and resets the busy flag.

- **Workspace**  
  Your Roll20 game’s API Scripts area where you paste and save `GameAssist.js`. This is where the kernel lives, alongside any TokenMod or third-party modules you install via the Mod Library.

> **Tip:** Whenever you see a new term you’re not sure about, check this glossary first. It’s designed to give you the big-picture context without diving straight into code.  If the term is not here, please let me know that it ought to be.

```

---
