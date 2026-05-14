# Condition Tracker

**Condition Tracker** is a Roll20 API Mod for GMs who want to track token-focused conditions and custom effects as separate Turn Tracker rows. It applies configured token markers, announces changes in chat, stores active effects and saved long-term effects in `state.ConditionTracker`, and removes effects manually, through cleanup, on duration expiry, on token deletion, or when a tracked target reaches 0 HP.

## Features

- Applies standard D&D-style conditions to target tokens with `!condition-tracker`.
- Supports custom effect types: **Spell**, **Ability**, **Advantage**, **Disadvantage**, and **Other** (Booming Blade, Hunter's Mark, Hex, concentration effects, homebrew conditions, etc.).
- Multi-target wizard (`--multi-target`): select tokens on the board before running the macro to apply a condition to all of them at once.
- Token report (`--report-token`): select one or more tokens and receive a GM-only summary of conditions applied to and by each token.
- Saved effects (`--saved`): manage persistent long-term effects (curses, diseases, hidden debuffs) with public, masked, and GM-only visibility.
- Adds custom Turn Tracker rows directly beneath the affected target token when possible.
- Applies and safely removes configured token markers.
- Prevents exact duplicate conditions while allowing the same condition from different sources.
- Tracks durations including until removed, end of target/source next turn, and numeric round counts.
- Provides GM-only chat menus, a removal menu, configuration commands, and cleanup tools.
- Automatically prunes conditions when a source or target token is deleted.
- Creates or updates the `ConditionTrackerWizard`, `ConditionTrackerMultiTarget`, `ConditionTrackerReportToken`, `ConditionTrackerSaved`, and `ConditionTrackerClassify` GM macros on install.
- Multi-language output with localized chat, wizard, help, and handout content. Set with `--config language` or use `--lang` for per-command bilingual output.
- Uses a modular source tree and Rollup build to generate a paste-ready Roll20 script.

## Contributor Docs

This README focuses on Roll20 usage. Contributor-oriented details are in:

- [DEVELOPERS.md](DEVELOPERS.md) for setup, build, watch mode, and release workflow.
- [MOD_FILE_MAP.md](MOD_FILE_MAP.md) for a full developer inventory of mod files and responsibilities.
- [TESTING.md](TESTING.md) for manual Roll20 validation.
- [CHANGELOG.md](CHANGELOG.md) for release notes.

## Install and Build

From the `ConditionTracker` directory:

```bash
npm install
npm run build
```

The build writes:

- `ConditionTracker.js`
- `<version>/ConditionTracker.js` (version taken from `script.json`)

Paste the generated `ConditionTracker.js` file into Roll20 under **Game Settings -> Mod (API) Scripts**.

## Roll20 Commands

All commands are GM-only except `--help`.

- `!condition-tracker --help`
- `!condition-tracker --menu`
- `!condition-tracker --menu remove`
- `!condition-tracker --prompt`
- `!condition-tracker --multi-target`
- `!condition-tracker --prompt --condition <condition> --duration <duration>`
- `!condition-tracker --source <token_ref> --target <token_ref> --condition <condition> --other <text> --duration <duration>`
- `!condition-tracker --lang <locale>`
- `!condition-tracker --remove <condition_id>`
- `!condition-tracker --cleanup`
- `!condition-tracker --reorder-conditions`
- `!condition-tracker --reinstall-macro`
- `!condition-tracker --reinstall-handout`
- `!condition-tracker --report-token`
- `!condition-tracker --saved`
- `!condition-tracker --saved add`
- `!condition-tracker --saved edit <saved_id>`
- `!condition-tracker --saved remove <saved_id>`
- `!condition-tracker --saved promote <saved_id> --visibility public|masked|gm`
- `!condition-tracker --saved snooze <saved_id> --scope turn|rounds|combat --rounds <n>`
- `!condition-tracker --saved snooze-clear <saved_id>`
- `!condition-tracker --config`
- `!condition-tracker --config marker Grappled=grab`
- `!condition-tracker --config marker-pick <condition>`
- `!condition-tracker --config marker-clear <condition>`
- `!condition-tracker --config gameSystem <id>`
- `!condition-tracker --config useMarkers true|false`
- `!condition-tracker --config icons true|false`
- `!condition-tracker --config subjectPromptBypass true|false`
- `!condition-tracker --config suppressPublicChat true|false`
- `!condition-tracker --config enablePostApplyMacroButtons true|false`
- `!condition-tracker --config healthBar bar1_value|bar2_value|bar3_value`
- `!condition-tracker --config language <locale>`
- `!condition-tracker --config reset`

## Prompt UI

`!condition-tracker --prompt` opens a step-by-step chat wizard. Each step whispers clickable buttons to the GM — no extra click-to-load step.

1. **Condition** — buttons for every standard condition plus Spell, Ability, Advantage, Disadvantage, and Other.
2. **Subject** — for custom effect types (Spell, Ability, Advantage, Disadvantage, Other) only: all named tokens on the active page plus a **None** button.
3. **Source token** — all named tokens on the active page shown as buttons.
4. **Target token** — same named token list.
5. **Duration** — standard duration options as buttons; clicking one applies the condition immediately.

For **Spell**, **Ability**, and **Other** conditions, a button is shown that opens native Roll20 query dialogs to collect the effect description and duration. Standard conditions and Advantage/Disadvantage go directly to the duration buttons.

Passing extra flags pre-selects their values and skips the corresponding wizard step:

```text
!condition-tracker --prompt --condition Grappled --duration 2 rounds
```

This starts the wizard at the source token step, skipping the condition and duration steps.

You can also override Subject bypass for one run:

```text
!condition-tracker --prompt --subjectPromptBypass true
```

This forces Subject to None for that command only, regardless of the saved config.

If the source or target token ids are already known they can be passed directly, bypassing those token-selection steps:

```text
!condition-tracker --prompt --source <token_id> --target <token_id>
```

The main menu (`!condition-tracker --menu`) contains an **Open Wizard** button that starts the full wizard from the condition selection step.

## Macro Usage

Roll20 Mods cannot create true native dialogs, so Condition Tracker uses macros and chat menus. On install, the mod creates or updates five GM macros:

- **`ConditionTrackerWizard`** (`!condition-tracker --prompt`) — launches the step-by-step condition wizard. No token selection required beforehand.
- **`ConditionTrackerMultiTarget`** (`!condition-tracker --multi-target`) — select one or more tokens on the board first, then run the macro. The wizard applies the chosen condition to all selected tokens at once.
- **`ConditionTrackerReportToken`** (`!condition-tracker --report-token`) — select one or more tokens first, then run to get a GM whisper listing all conditions applied to and by each selected token.
- **`ConditionTrackerSaved`** (`!condition-tracker --saved`) — select a token first, then run to view/manage saved long-term effects for that token.
- **`ConditionTrackerClassify`** (`!condition-tracker --classify show`) — opens actor classification diagnostics for selected tokens.

If any macro is missing, use `!condition-tracker --reinstall-macro` to recreate all five for all current GM players.

If the help handout is missing, duplicated, or out of date, use `!condition-tracker --reinstall-handout` to recreate/update the localized handout.

Run `ConditionTrackerWizard` to launch the wizard. If `Other` is selected, provide non-empty custom text. The mod ignores `--other` for standard conditions.

## Name Matching for Source/Target/Subject

Direct apply arguments like `--source`, `--target`, and `--subject` support token references by:

- token id
- exact token name
- exact linked character name
- unique partial token/character name

Matching behavior:

- Matching is case-insensitive.
- Exact matches are checked first.
- If there is no exact match, partial matches are checked.
- If multiple tokens match, the command stops and asks for a more specific value (or a token id).

Examples:

```text
!condition-tracker --source "Sir Galahad" --target "Goblin Boss" --condition Grappled --duration 1 round
!condition-tracker --source gala --target boss --condition Prone --duration 1 round
```

## Output Examples

Standard condition Turn Tracker text:

```text
Nox grappled by Giant Crab
Nox restrained by Web Trap
```

Custom effect Turn Tracker text:

```text
Giant Crab affected by Booming Blade (Nox)
Giant Crab affected by Hunter's Mark (Ranger)
```

Chat examples:

```text
Giant Crab grapples Nox.
Nox applies Booming Blade to Giant Crab.
Nox is no longer grappled by Giant Crab.
Giant Crab is no longer affected by Booming Blade.
```

## Conditions

Standard conditions: Grappled, Restrained, Prone, Poisoned, Stunned, Blinded, Charmed, Frightened, Incapacitated, Invisible, Paralyzed, Petrified, and Unconscious.

Custom effect types: **Spell**, **Ability**, **Advantage**, **Disadvantage**, and **Other**.

- **Spell**, **Ability**, and **Other** require a free-text description supplied via `--other` or the wizard prompt.
- **Advantage** and **Disadvantage** are grouped under the source token in the Turn Tracker.
- **Other** is the catch-all for homebrew conditions, environmental effects, and anything that does not fit a predefined type.

## Configuration

Condition Tracker stores configuration in `state.ConditionTracker.config`.

Use `!condition-tracker --config reset` to restore all configurable settings and marker mappings back to the mod defaults.

| Option                        | Values                                     | Description                                                                                                                                                                                                                                                                                         |
| ----------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gameSystem`                  | System id (e.g. `dnd5e`, `pathfinder2e`)   | Set the active game system. Changes the condition list and resets markers to system defaults. See [Supported Game Systems](#supported-game-systems) for all valid ids.                                                                                                                              |
| `useMarkers`                  | `true` / `false`                           | Apply Roll20 status markers to tokens when a condition is added                                                                                                                                                                                                                                     |
| `useIcons`                    | `true` / `false`                           | Show short icon codes (e.g. `[G]`) instead of emoji in Turn Tracker rows                                                                                                                                                                                                                            |
| `subjectPromptBypass`         | `true` / `false`                           | Skip the optional subject-token step for Spell / Ability / Other effects                                                                                                                                                                                                                            |
| `suppressPublicChat`          | `true` / `false`                           | Suppress all public chat announcements (apply and remove messages). GM whispers are unaffected.                                                                                                                                                                                                     |
| `enablePostApplyMacroButtons` | `true` / `false`                           | Show **Create Macro** buttons in the apply confirmation whisper. When enabled, two buttons appear after each successful apply: **Create Macro (Target: ...)** replays the exact same target list, and **Create Macro (Selected Target)** applies to the currently selected token. Default: `false`. |
| `healthBar`                   | `bar1_value` / `bar2_value` / `bar3_value` | Token bar to watch; when it reaches 0 the GM is prompted to clean up conditions                                                                                                                                                                                                                     |
| `language`                    | Any supported locale                       | Output language for chat messages and the help handout                                                                                                                                                                                                                                              |
| `marker`                      | `<Condition>=<marker name>`                | Override the status marker for a specific condition (e.g. `marker Grappled=grab`)                                                                                                                                                                                                                   |
| `marker-pick`                 | `<Condition>`                              | Open a visual marker picker for the given condition. Displays all campaign token markers as clickable icon buttons — click a button to set that marker for the condition.                                                                                                                           |
| `marker-clear`                | `<Condition>`                              | Clear the configured status marker for the given condition, restoring the system default or leaving it unset.                                                                                                                                                                                       |

`subjectPromptBypass` defaults to `false`. Set `!condition-tracker --config subjectPromptBypass true` to skip the Subject prompt for custom effects and force Subject to None. For one-off runs, use `--subjectPromptBypass true|false` directly on the command.

`enablePostApplyMacroButtons` defaults to `false`. When enabled, each apply confirmation whisper includes two **Create Macro** buttons. Clicking either prompts for a macro name, then creates a GM-owned macro:

- **Create Macro (Target: ...)** — replays the exact same source and target token(s) as the original apply.
- **Create Macro (Selected Target)** — applies to whoever is currently selected (`@{selected|token_id}`), letting one macro work on any token.

If the requested name is already in use, the macro is created with an incremental suffix: `Name`, `Name (2)`, `Name (3)`, and so on. The confirmation whisper shows the final resolved name and a **Run Macro Now** button to execute the action immediately without reopening Collections.

Changing `gameSystem` also resets all token marker mappings to the new system's defaults. Active conditions are preserved.

Changing `language` updates both chat output and the generated help handout immediately.

Use `--lang <locale>` on any apply command to emit a second announcement in an additional locale (bilingual mode), without changing the saved language setting.

## Saved Effects

Saved effects let you track long-term status outside normal combat rows while still keeping a token-linked record.

- `public`: full label is visible in Turn Tracker and public chat when promoted.
- `masked`: a vague public label is visible; full details remain GM-only.
- `gm`: no Turn Tracker row is created; reminders are whispered to the GM when that token reaches the top of initiative.

Use `!condition-tracker --saved add` to create effects and `!condition-tracker --saved promote <saved_id> --visibility ...` to copy one into active tracking. Promotions copy saved effects; they do not remove the saved record.

Use `!condition-tracker --saved snooze ...` to suppress GM reminders for a turn, a number of rounds, or the current combat.

## Supported Game Systems

Use `!condition-tracker --config gameSystem <id>` to switch the active game system. The in-game help card and generated handout also list all ids.

| System ID       | Game System                        |
| --------------- | ---------------------------------- |
| `dnd5e`         | Dungeons & Dragons 5th Edition     |
| `dnd4e`         | Dungeons & Dragons 4th Edition     |
| `dnd35`         | Dungeons & Dragons 3.5 Edition     |
| `pathfinder1e`  | Pathfinder First Edition           |
| `pathfinder2e`  | Pathfinder Second Edition          |
| `starfinder`    | Starfinder                         |
| `13thage`       | 13th Age                           |
| `sotdl`         | Shadow of the Demon Lord           |
| `cyphersystem`  | Cypher System                      |
| `dcc`           | Dungeon Crawl Classics             |
| `ose`           | Old-School Essentials              |
| `bfrpg`         | Basic Fantasy RPG                  |
| `knave`         | Knave                              |
| `intotheodd`    | Into the Odd                       |
| `cairn`         | Cairn                              |
| `wwn`           | Worlds Without Number              |
| `swn`           | Stars Without Number               |
| `callofcthulhu` | Call of Cthulhu                    |
| `deltagreen`    | Delta Green                        |
| `vaesen`        | Vaesen                             |
| `brp`           | Basic Role-Playing                 |
| `vtm`           | Vampire: The Masquerade            |
| `wta`           | Werewolf: The Apocalypse           |
| `mta`           | Mage: The Ascension                |
| `htr`           | Hunter: The Reckoning              |
| `ctd`           | Changeling: The Dreaming           |
| `alienrpg`      | Alien RPG                          |
| `mothership`    | Mothership RPG                     |
| `traveller`     | Traveller                          |
| `cyberpunkred`  | Cyberpunk Red                      |
| `shadowrun`     | Shadowrun                          |
| `genesys`       | Genesys                            |
| `starwarsffg`   | Star Wars Roleplaying Game (FFG)   |
| `cortexprime`   | Cortex Prime                       |
| `gurps`         | GURPS                              |
| `herosystem`    | Hero System                        |
| `savageworlds`  | Savage Worlds Adventure Edition    |
| `wfrp4e`        | Warhammer Fantasy Roleplay 4e      |
| `wh40k`         | Warhammer 40,000 RPG               |
| `whaos`         | Warhammer Age of Sigmar: Soulbound |
| `generic`       | Generic / Other                    |

## Translations

Condition Tracker supports the same language set shown in Roll20 account creation:

| Locale  | Language              | Notes                               |
| ------- | --------------------- | ----------------------------------- |
| `af`    | Afrikaans             |                                     |
| `ca`    | Catalan               | Català                              |
| `zh-TW` | Chinese (Traditional) | `zh` is accepted as an alias        |
| `cs`    | Czech                 | Čeština                             |
| `da`    | Danish                | Dansk                               |
| `nl`    | Dutch                 | Nederlands                          |
| `en-US` | English               | `en` is accepted as an alias        |
| `fi`    | Finnish               | Suomeksi                            |
| `fr`    | French                | Français                            |
| `de`    | German                | Deutsch                             |
| `el`    | Greek                 | Ελληνικά                            |
| `he`    | Hebrew                | עברית; chat/help/handout render RTL |
| `hu`    | Hungarian             | Magyar                              |
| `it`    | Italian               | Italiano                            |
| `ja`    | Japanese              | 日本語                              |
| `ko`    | Korean                | 한국어                              |
| `pl`    | Polish                | Polski                              |
| `pt-PT` | Portuguese (Portugal) | `pt` is accepted as an alias        |
| `pt-BR` | Portuguese (Brazil)   | Português - Brasil                  |
| `ru`    | Russian               | Русский                             |
| `es`    | Spanish               | Español                             |
| `sv`    | Swedish               | Svenska                             |
| `tr`    | Turkish               | Türkçe                              |
| `uk`    | Ukrainian             | український                         |

The in-game help card and generated handout include an available-translations list with accessible flag images and language names shown in the currently configured language where available. Invalid locale warnings use the same two-column locale table.

### Translation Workflow

Use the scripts in the `ConditionTracker` folder to manage locale files:

- `npm run sync-locales` updates only the missing strings in each locale.
- `npm run regenerate-locales` re-translates every string and accepts either `-- --locale=<code>` or a positional locale like `npm run regenerate-locales uk` to target one locale.

These commands write directly to `src/locales/locale/<locale>.js`, format the files, and are no longer part of the build step.

### Correcting Translations

If a translation is incorrect, update the relevant file in `src/locales/locale/<locale>.js`.

- `conditions`, `condNames`, and `templates` control Turn Tracker text and apply/remove announcements.
- `ui` controls chat cards, menus, buttons, warnings, and config/help messages.
- `handout` controls the generated help handout and the help card tables that reuse handout rows.
- `languageNames` controls how the available-translations list names each language when this locale is active. Add or correct entries here if the locale list itself reads poorly.

Update `src/locales/metadata.js` only when adding/changing a supported locale code, alias, text direction, flag label, or source file path. After translation edits, run `npm run format` and `npm run build`, then test with `!condition-tracker --config language <locale>`, `!condition-tracker --help`, and `!condition-tracker --reinstall-handout`.

Default marker mappings:

- Grappled: `grab`
- Restrained: `padlock`
- Prone: `back-pain`
- Poisoned: `chemical-bolt`
- Stunned: `pummeled`
- Blinded: `bleeding-eye`
- Charmed: `chained-heart`
- Frightened: `screaming`
- Incapacitated: `interdiction`
- Invisible: `ninja-mask`
- Paralyzed: `frozen-orb`
- Petrified: `fossil`
- Unconscious: `sleepy`

Custom markers must already exist in the Roll20 game. Roll20 exposes token markers as marker names/tags; Condition Tracker stores the resolved tag and applies it to `statusmarkers`.

Use `!condition-tracker --config marker-pick <condition>` to browse all campaign markers as a visual icon grid — clicking any button sets the marker for that condition directly. Use `!condition-tracker --config marker-clear <condition>` to remove a custom mapping and restore the system default (or leave it unset). Marketplace markers with `name::id` tag formats are handled automatically.

## Duration Notes

Supported durations:

- `Until removed`
- `End of target's next turn`
- `End of source's next turn`
- `1 round`
- `2 rounds`
- `3 rounds`
- `10 rounds`
- Other positive numeric round counts such as `5 rounds`

Durations are updated when the Turn Tracker advances from one token to another. Round counts are anchored to the target token's turn.

## Cleanup Behavior

`!condition-tracker --cleanup` removes state entries whose source or target token no longer exists, removes orphaned Turn Tracker rows created by Condition Tracker, reconciles active state with the current Turn Tracker, and removes unused markers where safe. Cleanup details are whispered to the GM.

Token deletion is also handled proactively: when a tracked source or target token is deleted, related active conditions are immediately pruned from state, related custom Turn Tracker rows are removed, and any saved effects for that token are removed.

When the configured health bar reaches 0 or below for a tracked target, all active conditions on that target are removed, public removal messages are announced, Turn Tracker rows are removed, markers are removed when safe, and cleanup details are whispered to the GM.

## Known Limitations

- Roll20 Mods cannot create true native dialogs. The macro/chat menu approach is used instead.
- Turn Tracker entries are separate rows, not nested rows.
- Custom markers must already exist in the Roll20 game.
- The mod can only manipulate what the Roll20 API sandbox exposes.
- Duration expiry depends on Turn Tracker advancement events.

## License

This script is licensed under the MIT License.
