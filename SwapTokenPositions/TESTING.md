# SwapTokenPositions Manual Testing

This document provides a manual test plan for validating `SwapTokenPositions` in a live Roll20 VTT game before One-Click publication.

## Test Environment Setup

1. Build the script locally:

```bash
npm run build
```

2. In Roll20, open your game:
   - Go to **Game Settings -> Mod (API) Scripts**.
   - Open `SwapTokenPositions.js` from this repo.
   - Copy/paste the full generated file into the Roll20 script editor.
   - Save and restart the sandbox.

3. Prepare a map page with:
   - At least 2 graphic tokens on the same page.
   - At least 1 additional token on a different page (for cross-page sanity checks).
   - One GM account and one non-GM player account (or equivalent test users).

4. Open chat as GM and player so whispers and permission behavior can be verified.

## Baseline Sanity Checks

1. **Script ready message**
   - Action: Restart sandbox.
   - Expected:
     - API console logs script version and updated date.
     - GM receives the styled `MOD READY` whisper.

2. **Help command**
   - Action: Run `!swap-tokens --help` as GM and as player.
   - Expected:
     - Sender receives full help output.
     - No token selection required.

## Selection and Input Validation

1. **No selection**
   - Action: Run `!swap-tokens` with no selected token.
   - Expected: Sender gets `Selection Error` asking for exactly two tokens.

2. **One token selected**
   - Action: Select one token and run `!swap-tokens`.
   - Expected: Same `Selection Error`.

3. **Three+ tokens selected**
   - Action: Select three tokens and run `!swap-tokens`.
   - Expected: Same `Selection Error`.

4. **Broken selection reference**
   - Action: Select two tokens, delete one, then run command quickly.
   - Expected: Error that one or both tokens could not be found.

## Core Swap Behavior

1. **Immediate swap with defaults**
   - Action: Select two tokens and run `!swap-tokens`.
   - Expected:
     - Tokens swap positions.
     - Sender receives `Swap Successful!` message.

2. **Force instant mode**
   - Action: `!swap-tokens --instant`
   - Expected:
     - Immediate swap regardless of saved defaults.
     - No staged FX delay.

3. **No-FX/no-timing config path**
   - Action: `!swap-tokens --origin-fx none --travel-fx none --destination-fx none --origin-time 0 --travel-time 0 --swap-delay 0 --destination-delay 0`
   - Expected: Immediate swap; no FX shown.

## Preset and Override Tests

1. **Portal preset**
   - Action: `!swap-tokens --preset portal`
   - Expected:
     - Staged FX appears (origin, travel beam, destination).
     - Swap occurs after preset timing.

2. **Lightning preset**
   - Action: `!swap-tokens --preset lightning`
   - Expected: Fast travel beam effect and quick swap.

3. **Preset + explicit override precedence**
   - Action: `!swap-tokens --preset portal --travel-time 3`
   - Expected:
     - Preset applies.
     - Explicit `--travel-time 3` overrides preset travel timing.
     - Sender sees `Override Active` whisper values.

4. **Custom stage FX**
   - Action: `!swap-tokens --origin-fx nova-magic --travel-fx beam-fire --destination-fx explode-fire`
   - Expected:
     - Matching stage FX at each phase.
     - Successful swap and confirmation whisper.

## Travel Mode Validation

1. **Invisible travel mode behavior**
    - Action: `!swap-tokens --travel-mode invisible --origin-time 0 --travel-time 1 --destination-delay 0`
    - Expected:
       - Tokens are hidden during travel phase.
       - Tokens are restored and visible after swap completes.

2. **Normal travel mode behavior**
    - Action: `!swap-tokens --travel-mode normal --origin-time 0 --travel-time 1 --destination-delay 0`
    - Expected:
       - Tokens remain visible throughout travel phase.
       - Swap completes without visibility flicker.

3. **Preset default + override**
    - Action: `!swap-tokens --preset transport`
    - Expected:
       - Transport preset uses `travel-mode invisible` by default.
    - Action: `!swap-tokens --preset transport --travel-mode normal`
    - Expected:
       - Explicit travel mode override is honored.

4. **Invalid travel mode value**
    - Action: `!swap-tokens --travel-mode phase`
    - Expected:
       - Invalid input whisper for travel mode.
       - Script remains stable and does not crash.

## Timing and Range Validation

1. **Boundary minimum values**
   - Action: Run with all timing fields set to `0`.
   - Expected: Accepted; command runs successfully.

2. **Boundary maximum values**
   - Action: Run with `--origin-time 10 --travel-time 10 --destination-time 10 --swap-delay 10 --destination-delay 10`.
   - Expected: Accepted; long staged delays occur.

3. **Out-of-range numeric values**
   - Action: Try `--swap-delay 11` and `--origin-time -1`.
   - Expected:
     - Invalid input whisper for each invalid value.
     - Script does not crash.

## Deprecated Flag Warnings

1. **Deprecated mode flag warning + mapping (beams)**
    - Action: `!swap-tokens --mode beams`
    - Expected:
       - Sender sees deprecation warning indicating `--mode` is deprecated and mapped to a preset.
       - Command still functions.

2. **Deprecated mode flag warning + mapping (transport)**
    - Action: `!swap-tokens --mode transport`
    - Expected:
       - Sender sees deprecation warning indicating `--mode` is deprecated and mapped to a preset.
       - Command still functions.

3. **Deprecated beam flag warning**
   - Action: `!swap-tokens --beam-fx beam-fire`
   - Expected:
     - Sender sees deprecation warning: use `--travel-fx`.
     - Command still functions.

4. **Deprecated burst flag warning**
   - Action: `!swap-tokens --burst-fx burst-holy`
   - Expected:
     - Sender sees deprecation warning: use `--destination-fx`.
     - Command still functions.

5. **Deprecated duration flag warning**
   - Action: `!swap-tokens --duration 2`
   - Expected:
     - Sender sees deprecation warning: use `--swap-delay`.
     - Command still functions.

6. **Deprecated invalid values**
   - Action: `!swap-tokens --beam-fx not-a-real-fx --duration 99`
   - Expected:
     - Deprecation warnings still appear.
     - Invalid input messages are shown.
     - Script remains stable.

## GM-Only Management Commands

Run these as GM unless otherwise specified.

1. `!swap-tokens --show-settings`
   - Expected: GM sees styled persistent settings report.

2. `!swap-tokens --check-settings`
   - Expected: Validation success (or issues list if state is malformed).

3. `!swap-tokens --reset-settings`
   - Expected: Confirmation plus settings display with factory defaults.

4. `!swap-tokens --install-macro`
   - Expected:
     - First run creates global `SwapTokens` macro.
     - Second run reports `Macro Exists`.

5. Non-GM permission checks
   - Action: As player, run `--show-settings`, `--check-settings`, `--reset-settings`, and `--install-macro`.
   - Expected: `Access Denied` message for each.

6. Player `--save` permission check
   - Action: As player, select two tokens and run `!swap-tokens --save`.
   - Expected:
     - `Access Denied` whisper explaining they cannot set game defaults.
     - Swap still proceeds normally.

7. Player `--help` access
   - Action: As player, run `!swap-tokens --help`.
   - Expected: Full help output whispered to the player. No `Access Denied`.

## Persistence Tests (`--save`)

1. **Save valid defaults**
   - Action: `!swap-tokens --preset portal --save` (GM).
   - Expected:
     - `Configuration` success message.
     - `--show-settings` reflects saved values.

2. **Save with mixed valid/invalid**
   - Action: `!swap-tokens --origin-fx nova-magic --travel-time 99 --save` (GM).
   - Expected:
     - Save is rejected with `Save Failed`.
     - Previous settings remain unchanged.

3. **Save with no configurable flags**
   - Action: `!swap-tokens --save` (GM).
   - Expected: `Nothing to Save` message.

## Regression and Stability Checks

1. Run 10+ swaps in sequence with mixed presets and overrides.
   - Expected: No crashes, no sandbox instability.

2. Restart sandbox and rerun `--show-settings`.
   - Expected: Saved settings persist across restart.

3. **Delete token during delayed pipeline**
   - Action:
     - Start a delayed swap (for example `!swap-tokens --preset portal` or `!swap-tokens --travel-time 3`).
     - Before swap completion, delete one selected token.
   - Expected:
     - Script does not crash.
     - Sender receives `Swap Cancelled` (or equivalent missing-token error) instead of silent failure.
     - Later swaps with valid tokens still work.

4. **Archive/switch page during delayed pipeline**
   - Action:
     - Start a delayed swap with timing (`--travel-time`, `--swap-delay`, or preset with delay).
     - Before completion, move to another page as GM and/or archive/remove the active page token context.
   - Expected:
     - Script remains stable with no sandbox errors.
     - If tokens become unavailable, swap is cancelled gracefully with feedback.
     - If tokens remain valid, swap completes normally.

5. Verify command still works after reset and save cycles.
   - Expected: Behavior remains consistent.

## Exit Criteria

All tests pass when:

1. Core swap works reliably with valid input.
2. All management commands behave correctly by role.
3. Deprecated flags emit warnings and remain backward compatible.
4. Invalid inputs produce clear feedback without script failure.
5. Persistence (`--save`, restart, reset) is correct and stable.
