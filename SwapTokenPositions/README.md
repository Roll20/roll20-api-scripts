# SwapTokenPositions

**SwapTokenPositions** is a Roll20 API script that allows GMs and players to quickly swap the positions of two selected tokens on the same page. It features a modern design with customizable animation effects, persistent settings, and clear chat feedback.

## Features

- **Seamless Swapping**: Select exactly two tokens on the same page and run `!swap-tokens` to switch their positions.
- **Animation Styles**:
  - `beams`: Spawns arcane beams back and forth between the tokens before they swap.
  - `transport`: Spawns vertical light columns and shimmer effects at both locations.
- **Customizable FX**: Choose from a wide variety of beam and burst effects.
- **Persistent Settings**: GMs can customize the global defaults (duration, mode, FX) and save them permanently.
- **One-Time Overrides**: Players and GMs can use command flags to customize a single swap without changing global defaults.
- **Styled Feedback**: Professional arcane-themed message boxes for success, errors, and settings.
- **Macro Installation**: Automatically create a global "SwapTokens" macro for your game.

## Commands

### Basic Usage

`!swap-tokens`
Swaps the two currently selected tokens using the default settings.

### Acceptable Parameters for Customization (Available to Everyone)

- `--duration <1-10>`: Seconds to play the animation before swapping.
- `--mode <value>`: The animation style to use.
  - Values: `beams`, `transport`
- `--beam-fx <value>`: The beam FX type.
  - Values: `none`, `beam-magic`, `beam-acid`, `beam-charm`, `beam-fire`, `beam-frost`, `beam-holy`, `beam-death`
- `--burst-fx <value>`: The burst FX type.
  - Values: `none`, `burst-holy`, `burst-magic`, `burst-fire`, `burst-acid`, `burst-frost`, `burst-smoke`, `explode-fire`, `explode-holy`, `burn-fire`, `burn-holy`

### Examples of Customization

- `!swap-tokens --mode transport` Shows the tokens swapping using a Roll20 version of the transport FX.
- `!swap-tokens --mode beams` Shows the tokens swapping using the beams FX.
- `!swap-tokens --duration 5 --beam-fx beam-fire --mode beams` Shows the tokens swapping using the beams FX for 5 seconds with fire beams.
- `!swap-tokens --duration 2 --beam-fx beam-acid --mode beams` Shows the tokens swapping using the beams FX for 2 seconds with acid beams.
- `!swap-tokens --duration 10 --burst-fx burst-magic --mode transport` Shows the tokens swapping using a Roll20 version of the transport FX for 10 seconds with magic burst FX.
- `!swap-tokens --duration 3 --burst-fx explode-fire --mode transport` Shows the tokens swapping using a Roll20 version of the transport FX for 3 seconds with fire explode FX.
- `!swap-tokens --beam-fx none --burst-fx none` Swaps the two currently selected tokens without using any animation effects.

### Global Configuration (GM Only)

- `--save`: Commits any provided customization flags as the new global defaults. You must provide the customization flags you want to save, for example, just `--save --duration 5` will save the duration as the new default and keep the beam effect and swap mode as they are.
- `--show-settings`: Displays the current persistent defaults in chat.
- `--reset-settings`: Restores the script to its factory defaults.
- `--install-macro`: Automatically creates a global "SwapTokens" macro in your campaign.
- `--help`: Displays the help menu.

## License

This script is licensed under the MIT License.
