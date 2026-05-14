# Condition Tracker

**Condition Tracker** is a Roll20 API Mod for GMs who want to track token-focused conditions and custom effects as separate Turn Tracker rows. It applies configured token markers, announces changes in chat, stores active effects in `state.ConditionTracker`, and removes effects manually, through cleanup, on duration expiry, or when a tracked target reaches 0 HP.

## Features

- Applies standard D&D-style conditions to target tokens with `!condition-tracker`.
- Supports custom effect types: **Spell**, **Ability**, **Advantage**, **Disadvantage**, and **Other** (Booming Blade, Hunter's Mark, Hex, concentration effects, homebrew conditions, etc.).
- Multi-target wizard (`--multi-target`): select tokens on the board before running the macro to apply a condition to all of them at once.
- Adds custom Turn Tracker rows directly beneath the affected target token when possible.
- Applies and safely removes configured token markers.
- Prevents exact duplicate conditions while allowing the same condition from different sources.
- Tracks durations including until removed, end of target/source next turn, and numeric round counts.
- Provides GM-only chat menus, a removal menu, configuration commands, and cleanup tools.
- Automatically prunes conditions when a source or target token is deleted.
- Creates or updates the `ConditionTrackerWizard` and `ConditionTrackerMultiTarget` GM macros on install.
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
- `!condition-tracker --source <token_id> --target <token_id> --condition <condition> --other <text> --duration <duration>`
- `!condition-tracker --lang <locale>`
- `!condition-tracker --remove <condition_id>`
- `!condition-tracker --cleanup`
- `!condition-tracker --reinstall-macro`
- `!condition-tracker --reinstall-handout`
- `!condition-tracker --config`
- `!condition-tracker --config marker Grappled=grab`
- `!condition-tracker --config useMarkers true|false`
- `!condition-tracker --config icons true|false`
- `!condition-tracker --config subjectPromptBypass true|false`
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

Roll20 Mods cannot create true native dialogs, so Condition Tracker uses macros and chat menus. On install, the mod creates or updates two GM macros:

- **`ConditionTrackerWizard`** (`!condition-tracker --prompt`) — launches the step-by-step condition wizard. No token selection required beforehand.
- **`ConditionTrackerMultiTarget`** (`!condition-tracker --multi-target`) — select one or more tokens on the board first, then run the macro. The wizard applies the chosen condition to all selected tokens at once.

If either macro is missing, use `!condition-tracker --reinstall-macro` to recreate both for all current GM players.

If the help handout is missing, duplicated, or out of date, use `!condition-tracker --reinstall-handout` to recreate/update the localized handout.

Run `ConditionTrackerWizard` to launch the wizard. If `Other` is selected, provide non-empty custom text. The mod ignores `--other` for standard conditions.

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

| Option                | Values                                     | Description                                                                       |
| --------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| `useMarkers`          | `true` / `false`                           | Apply Roll20 status markers to tokens when a condition is added                   |
| `useIcons`            | `true` / `false`                           | Show short icon codes (e.g. `[G]`) instead of emoji in Turn Tracker rows          |
| `subjectPromptBypass` | `true` / `false`                           | Skip the optional subject-token step for Spell / Ability / Other effects          |
| `healthBar`           | `bar1_value` / `bar2_value` / `bar3_value` | Token bar to watch; when it reaches 0 the GM is prompted to clean up conditions   |
| `language`            | Any supported locale                       | Output language for chat messages and the help handout                            |
| `marker`              | `<Condition>=<marker name>`                | Override the status marker for a specific condition (e.g. `marker Grappled=grab`) |

`subjectPromptBypass` defaults to `false`. Set `!condition-tracker --config subjectPromptBypass true` to skip the Subject prompt for custom effects and force Subject to None. For one-off runs, use `--subjectPromptBypass true|false` directly on the command.

Changing `language` updates both chat output and the generated help handout immediately.

Use `--lang <locale>` on any apply command to emit a second announcement in an additional locale (bilingual mode), without changing the saved language setting.

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

Custom markers must already exist in the Roll20 game. Roll20 exposes token markers as marker names/tags; Condition Tracker stores the value you configure and applies it to `statusmarkers`.

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

Token deletion is also handled proactively: when a tracked source or target token is deleted, related conditions are immediately pruned from state and their custom Turn Tracker rows are removed.

When the configured health bar reaches 0 or below for a tracked target, all active conditions on that target are removed, public removal messages are announced, Turn Tracker rows are removed, markers are removed when safe, and cleanup details are whispered to the GM.

## Known Limitations

- Roll20 Mods cannot create true native dialogs. The macro/chat menu approach is used instead.
- Turn Tracker entries are separate rows, not nested rows.
- Custom markers must already exist in the Roll20 game.
- The mod can only manipulate what the Roll20 API sandbox exposes.
- Duration expiry depends on Turn Tracker advancement events.

## License

This script is licensed under the MIT License.
