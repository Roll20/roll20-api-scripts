# SwapTokenPositions

**SwapTokenPositions** is a Roll20 API script that allows GMs and players to quickly swap the positions of two selected tokens on the same page. It features a modern design with customizable animation effects, persistent settings, and clear chat feedback.

## Features

- **Seamless Swapping**: Select exactly two tokens on the same page and run `!swap-tokens` to switch their positions.
- **Staged Animation Pipeline**:
  - `origin`: Point FX at starting positions.
  - `travel`: Beam FX and optional travel visibility behavior.
  - `destination`: Point FX after swap completes.
- **Customizable FX**: Choose from a wide variety of point and beam effects.
- **Persistent Settings**: GMs can customize staged defaults (FX, travel mode, timing/delays) and save them permanently.
- **One-Time Overrides**: Players and GMs can use command flags to customize a single swap without changing global defaults.
- **Styled Feedback**: Professional arcane-themed message boxes for success, errors, and settings.
- **Macro Installation**: Automatically create a global "SwapTokens" macro for your game.
- **Preset Support**: Includes `portal`, `lightning`, `shadow`, `fire`, `magic`, `transport`, and `none` presets.
- **Legacy Compatibility**: Supports deprecated `--duration`, `--beam-fx`, and `--burst-fx` flags with warnings.

## Contributor Docs

This README focuses on Roll20 command usage. For contributor-oriented details, use these docs:

- [DEVELOPERS.md](DEVELOPERS.md) for setup, build, watch mode, troubleshooting, and contributor workflow.
- [TESTING.md](TESTING.md) for the manual Roll20 validation checklist.

## v1 to v2 Migration Notes

The v2 series keeps the same core command (`!swap-tokens`) but changes how animation is configured.

- `--mode` (`beams|transport`) is still accepted as a deprecated legacy flag and maps to presets:
  - `--mode beams` -> `--preset lightning`
  - `--mode transport` -> `--preset transport`
- New commands should use `--preset` and staged flags directly.
- `--beam-fx` still works as a deprecated alias for `--travel-fx`.
- `--burst-fx` still works as a deprecated alias for `--destination-fx`.
- `--duration` still works as a deprecated alias for `--swap-delay`.
- v2 explicitly rejects cross-page token pairs.

## Roll20 VTT Commands

### Basic Usage

`!swap-tokens`
Swaps the two currently selected tokens using the default settings.

### Acceptable Parameters for Customization (Available to Everyone)

- `--help`: Displays the help menu.
- `--instant`: Skips all FX and timing and swaps immediately.
- `--preset <value>`: Applies a preset.
  - Values: `portal`, `lightning`, `shadow`, `fire`, `magic`, `transport`, `none`
- `--origin-fx <value>`: Point FX at both origin positions.
- `--travel-fx <value>`: Beam FX between positions during travel stage.
- `--destination-fx <value>`: Point FX at both destination positions.
- `--travel-mode <value>`: Visibility behavior during travel stage.
  - Values: `normal`, `invisible`
- `--origin-time <0-10>`: Seconds to wait after origin FX.
- `--travel-time <0-10>`: Duration in seconds for the travel animation stage.
- `--destination-time <0-10>`: Additional wait before destination FX is shown.
- `--swap-delay <0-10>`: Extra delay between origin and travel stages.
- `--destination-delay <0-10>`: Extra delay before destination FX is shown.

### Examples of Customization

- `!swap-tokens --preset portal` Applies the portal preset for one swap.
- `!swap-tokens --preset transport` Applies a Star Trek-style transporter shimmer preset with hidden travel.
- `!swap-tokens --preset transport --travel-mode normal` Uses transport visuals but keeps tokens visible during travel.
- `!swap-tokens --preset lightning --travel-time 1` Applies lightning preset with explicit travel timing override.
- `!swap-tokens --origin-fx nova-magic --travel-fx beam-fire --destination-fx explode-fire` Uses custom FX for each stage.
- `!swap-tokens --origin-time 1 --swap-delay 0.5 --destination-delay 1` Uses explicit stage timing.
- `!swap-tokens --instant` Swaps immediately regardless of saved defaults.
- `!swap-tokens --beam-fx beam-fire --duration 2` Uses deprecated flags (still supported) and shows deprecation notices.

### Global Configuration (GM Only)

- `--save`: Commits provided customization flags as the new global defaults.
- `--show-settings`: Displays the current persistent defaults in chat.
- `--check-settings`: Validates current persistent defaults and reports issues.
- `--reset-settings`: Restores the script to its factory defaults.
- `--install-macro`: Automatically creates a global "SwapTokens" macro in your campaign.

### Deprecated Flags

The following flags are still supported for backward compatibility but are deprecated:

- `--mode` (use `--preset`; `beams` maps to `lightning`, `transport` maps to `transport`)
- `--duration` (use `--swap-delay`)
- `--beam-fx` (use `--travel-fx`)
- `--burst-fx` (use `--destination-fx`)

## License

This script is licensed under the MIT License.
